import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { buildNote, type ExtractedPage } from '../lib/note';

const NOW = new Date(2026, 8, 10, 12);
const base: ExtractedPage = { url: 'https://example.com/post', title: 'Hello', markdown: 'Body text.' };

function split(note: string) {
  const [, yaml = '', body = ''] = note.match(/^---\n([\s\S]*?)---\n\n([\s\S]*)$/) ?? [];
  return { frontmatter: parse(yaml), body };
}

describe('buildNote', () => {
  it('writes minimal Tolaria frontmatter, then the H1, then the body', () => {
    expect(buildNote(base, undefined, NOW)).toBe(
      '---\ntype: Clip\nurl: https://example.com/post\nclipped: 2026-09-10\n---\n\n# Hello\n\nBody text.\n',
    );
  });

  it('never marks the clip as organized, so it lands in the Inbox', () => {
    const { frontmatter } = split(buildNote({ ...base, author: 'Jane' }, undefined, NOW));
    expect(frontmatter).not.toHaveProperty('_organized');
  });

  it.each([
    'Title with "double" and \'single\' quotes',
    'Colon: in the middle',
    '# leading hash',
    '- leading dash',
    '[[not-a-list]]',
    'Emoji ✨ and accents é',
    '@at yes no null true 2026-01-01',
  ])('round-trips tricky author %j through YAML', (author) => {
    const { frontmatter } = split(buildNote({ ...base, author }, undefined, NOW));
    expect(frontmatter.author).toBe(author);
  });

  it('quotes wikilink authors so they stay strings', () => {
    const note = buildNote({ ...base, author: 'Jane Doe' }, { type: 'Clip', authorAsWikilink: true }, NOW);
    expect(note).toContain('author: "[[jane-doe]]"');
    expect(split(note).frontmatter.author).toBe('[[jane-doe]]');
  });

  it('splits multiple authors into a wikilink list', () => {
    const note = buildNote({ ...base, author: 'Ada Lovelace, Alan Turing et Grace Hopper' }, { type: 'Clip', authorAsWikilink: true }, NOW);
    expect(split(note).frontmatter.author).toEqual(['[[ada-lovelace]]', '[[alan-turing]]', '[[grace-hopper]]']);
  });

  it('keeps the calendar day of ISO timestamps as `published`, and always records `clipped`', () => {
    const { frontmatter } = split(buildNote({ ...base, published: '2024-03-05T23:30:00-08:00' }, undefined, NOW));
    expect(frontmatter.published).toBe('2024-03-05');
    expect(frontmatter.clipped).toBe('2026-09-10');
    expect(split(buildNote({ ...base, published: 'March 5, 2024' }, undefined, NOW)).frontmatter.published).toBe('2024-03-05');
  });

  it('never invents a publication date', () => {
    const { frontmatter } = split(buildNote({ ...base, published: 'not a date' }, undefined, NOW));
    expect(frontmatter).not.toHaveProperty('published');
    expect(frontmatter.clipped).toBe('2026-09-10');
  });

  it('omits empty fields', () => {
    const { frontmatter } = split(buildNote({ ...base, url: '', author: '  ' }, { type: '', authorAsWikilink: false }, NOW));
    expect(Object.keys(frontmatter)).toEqual(['clipped']);
  });

  it('does not duplicate an H1 that repeats the title', () => {
    const { body } = split(buildNote({ ...base, markdown: '#  hello \n\nBody.' }, undefined, NOW));
    expect(body).toBe('# Hello\n\nBody.\n');
  });

  it('adds the lead image once, escaping spaces and parens', () => {
    const image = 'https://cdn.example.com/a b(1).jpg';
    expect(split(buildNote({ ...base, image }, undefined, NOW)).body).toContain('![](https://cdn.example.com/a%20b%281%29.jpg)');
    const withImage = { ...base, image: 'https://x/y.png', markdown: '![](https://x/y.png)' };
    expect(split(buildNote(withImage, undefined, NOW)).body.match(/y\.png/g) ?? []).toHaveLength(1);
  });

  it('collapses whitespace in titles and falls back to the hostname', () => {
    expect(split(buildNote({ ...base, title: 'Multi\nline   title' }, undefined, NOW)).body).toMatch(/^# Multi line title\n/);
    expect(split(buildNote({ ...base, title: '' }, undefined, NOW)).body).toMatch(/^# example\.com\n/);
  });

  it('keeps long values on one line (Tolaria edits frontmatter line by line)', () => {
    const author = 'word '.repeat(40).trim();
    expect(buildNote({ ...base, author }, undefined, NOW)).toContain(`author: ${author}\n`);
  });
});
