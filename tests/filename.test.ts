import { describe, expect, it } from 'vitest';
import { noteFilename, slugify, uniqueFilename } from '../lib/filename';

describe('slugify', () => {
  it.each([
    ['Hello World', 'hello-world'],
    ['Café crème à Paris', 'café-crème-à-paris'],
    ['Café decomposed', 'café-decomposed'],
    ['東京の天気', '東京の天気'],
    ['a/b\\c:d*e?f"g<h>i|j', 'a-b-c-d-e-f-g-h-i-j'],
    ['Trailing dot.', 'trailing-dot'],
    ['  --Leading & trailing--  ', 'leading-trailing'],
    ['✨ Your best Front-End Tool ✨', 'your-best-front-end-tool'],
    ['CON', 'con-note'],
    ['lpt1', 'lpt1-note'],
    ['Console', 'console'],
    ['', ''],
    ['!!!', ''],
  ])('%j → %j', (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });

  it('caps length at 80 characters without a trailing dash', () => {
    const slug = slugify(`${'word '.repeat(40)}end`);
    expect(Array.from(slug).length).toBeLessThanOrEqual(80);
    expect(slug.endsWith('-')).toBe(false);
  });
});

describe('noteFilename', () => {
  it('falls back to a timestamped untitled clip', () => {
    expect(noteFilename('???', new Date(1_700_000_000_000))).toBe('untitled-clip-1700000000000.md');
  });
});

describe('uniqueFilename', () => {
  it('suffixes -2, -3 on collisions', async () => {
    const taken = new Set(['note.md', 'note-2.md']);
    expect(await uniqueFilename('note.md', async (name) => taken.has(name))).toBe('note-3.md');
    expect(await uniqueFilename('free.md', async (name) => taken.has(name))).toBe('free.md');
  });
});
