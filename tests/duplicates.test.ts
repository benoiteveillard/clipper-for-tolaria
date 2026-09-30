import { describe, expect, it } from 'vitest';
import { findClipByUrl, frontmatterUrl, sameUrl } from '../lib/duplicates';

describe('frontmatterUrl', () => {
  it('reads plain and quoted urls', () => {
    expect(frontmatterUrl('---\ntype: Clip\nurl: https://e.com/a\n---\n\n# T')).toBe('https://e.com/a');
    expect(frontmatterUrl('---\nurl: "https://e.com/a?x=1"\n---\n')).toBe('https://e.com/a?x=1');
    expect(frontmatterUrl("---\nurl: 'https://e.com/a'  \n---\n")).toBe('https://e.com/a');
  });

  it('survives a truncated head', () => {
    expect(frontmatterUrl('---\ntype: Clip\nurl: https://e.com/a\nauthor: Jane Do')).toBe('https://e.com/a');
  });

  it('ignores notes without frontmatter, and `url:` lines in the body', () => {
    expect(frontmatterUrl('# Title\n\nurl: https://e.com/a')).toBeUndefined();
    expect(frontmatterUrl('---\ntype: Clip\n---\n\nurl: https://e.com/a')).toBeUndefined();
  });
});

describe('sameUrl', () => {
  it('ignores tracking params, fragments, host case and trailing slash', () => {
    expect(sameUrl('https://E.com/a/?utm_source=x#top', 'https://e.com/a')).toBe(true);
  });

  it('keeps meaningful query params and paths apart', () => {
    expect(sameUrl('https://e.com/a?page=2', 'https://e.com/a')).toBe(false);
    expect(sameUrl('https://e.com/a', 'https://e.com/b')).toBe(false);
  });
});

describe('findClipByUrl', () => {
  const file = (name: string, text: string) => ({ kind: 'file', name, getFile: async () => new Blob([text]) });
  const dir = (entries: unknown[]) => ({ values: async function* () { yield* entries; } }) as unknown as FileSystemDirectoryHandle;

  it('returns the note whose frontmatter url matches', async () => {
    const vault = dir([
      file('other.md', '---\nurl: https://e.com/other\n---\n'),
      { kind: 'directory', name: 'sub' },
      file('image.png', '---\nurl: https://e.com/a\n---\n'),
      file('hit.md', '---\ntype: Clip\nurl: https://e.com/a\n---\n\n# A'),
    ]);
    expect(await findClipByUrl(vault, 'https://e.com/a?utm_medium=x')).toBe('hit.md');
  });

  it('returns undefined when nothing matches', async () => {
    expect(await findClipByUrl(dir([file('n.md', '# no frontmatter')]), 'https://e.com/a')).toBeUndefined();
  });
});
