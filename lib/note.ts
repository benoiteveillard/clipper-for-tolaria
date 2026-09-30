import { stringify } from 'yaml';
import { slugify } from './filename';

export interface ExtractedPage {
  url: string;
  title: string;
  markdown: string;
  author?: string;
  published?: string;
  image?: string;
  site?: string;
  description?: string;
  // The markdown is what the user had selected, not the whole article.
  selection?: boolean;
}

export interface NoteOptions {
  type: string;
  authorAsWikilink: boolean;
}

export const DEFAULT_NOTE_OPTIONS: NoteOptions = { type: 'Clip', authorAsWikilink: false };

// Never writes `_organized`: its absence is what keeps a clip in Tolaria's Inbox.
export function buildNote(page: ExtractedPage, options = DEFAULT_NOTE_OPTIONS, now = new Date()): string {
  const title = noteTitle(page);
  const frontmatter: Record<string, unknown> = {
    type: options.type || undefined,
    url: page.url || undefined,
    author: formatAuthor(page.author, options.authorAsWikilink),
    published: toIsoDate(page.published),
    clipped: localIsoDate(now),
  };
  for (const key of Object.keys(frontmatter)) if (frontmatter[key] === undefined) delete frontmatter[key];

  const body = stripLeadingTitle(page.markdown.trim(), title);
  const parts = [`# ${title}`];
  if (page.image && !body.includes(page.image)) parts.push(`![](${escapeUrl(page.image)})`);
  if (body) parts.push(body);

  return `---\n${stringify(frontmatter, { lineWidth: 0 })}---\n\n${parts.join('\n\n')}\n`;
}

export function noteTitle(page: Pick<ExtractedPage, 'title' | 'url'>): string {
  const title = page.title.replace(/\s+/g, ' ').trim();
  if (title) return title;
  try {
    return new URL(page.url).hostname;
  } catch {
    return 'Untitled clip';
  }
}

function formatAuthor(author: string | undefined, asWikilink: boolean): string | string[] | undefined {
  const text = (author ?? '').replace(/\s+/g, ' ').trim();
  if (!text) return undefined;
  if (!asWikilink) return text;
  const links = text
    .split(/\s*[,;]\s*|\s+(?:and|et|&)\s+/)
    .filter(Boolean)
    .map((name) => `[[${slugify(name)}]]`);
  return links.length === 1 ? links[0] : links;
}

function toIsoDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const prefix = value.match(/^\d{4}-\d{2}-\d{2}/);
  if (prefix) return prefix[0];
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : localIsoDate(date);
}

function localIsoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function stripLeadingTitle(markdown: string, title: string): string {
  const match = markdown.match(/^#\s+(.+)\n*/);
  if (!match?.[1] || normalize(match[1]) !== normalize(title)) return markdown;
  return markdown.slice(match[0].length);
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

function escapeUrl(url: string): string {
  return url.replace(/ /g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29');
}
