import type { DefuddleResponse } from 'defuddle';
import type { ExtractedPage } from './note';

// Site-wide fallbacks (og:image of a logo, placeholders) say nothing about the article.
const GENERIC_IMAGE = /(^|[/_.-])(logo|favicon|sprite|placeholder|default[-_]?(og|share|image))([/_.-]|\d|$)/i;
const IFRAME = /<iframe\b([^>]*)>\s*(?:<\/iframe>)?/gi;
const TRACKING_PARAM = /^(utm_\w+|_hsmi|_hsenc|mc_cid|mc_eid|fbclid|gclid|dclid|msclkid|igshid|ref_src|user_id)$/i;

// Shared by the injected content script and the snapshot tests, so both map Defuddle identically.
export function toExtractedPage(result: DefuddleResponse, url: string): ExtractedPage {
  return {
    url: cleanUrl(url),
    title: result.title ?? '',
    markdown: iframesToLinks(result.content ?? ''),
    author: result.author || undefined,
    published: result.published || undefined,
    image: leadImage(result.image, url),
    site: result.site || undefined,
    description: result.description || undefined,
  };
}

function leadImage(value: string | undefined, base: string): string | undefined {
  const image = absoluteUrl(value, base);
  return image && !GENERIC_IMAGE.test(new URL(image, base).pathname) ? image : undefined;
}

// Raw <iframe> tags render as nothing useful in Tolaria: keep a link to what was embedded.
export function iframesToLinks(markdown: string): string {
  return markdown.replace(IFRAME, (_, attributes: string) => {
    const attribute = (name: string) => attributes.match(new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)')`, 'i'))?.slice(1).find(Boolean);
    const src = decodeEntities(attribute('src') ?? '');
    if (!/^https?:\/\//i.test(src)) return '';
    const label = decodeEntities(attribute('title') ?? '').replace(/[[\]]/g, '') || new URL(src).hostname;
    return `[${label}](${src.replace(/ /g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29')})`;
  });
}

const decodeEntities = (text: string) =>
  text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

function absoluteUrl(value: string | undefined, base: string): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value, base).href;
  } catch {
    return value;
  }
}

export function cleanUrl(url: string): string {
  try {
    const parsed = new URL(url);
    for (const key of [...parsed.searchParams.keys()]) if (TRACKING_PARAM.test(key)) parsed.searchParams.delete(key);
    return parsed.toString();
  } catch {
    return url;
  }
}
