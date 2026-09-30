import { existsSync, readFileSync } from 'node:fs';
import { Defuddle } from 'defuddle/node';
import { JSDOM, VirtualConsole } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { toExtractedPage } from '../lib/extract';
import { buildNote } from '../lib/note';
import pages from './fixtures/pages.json';

const NOW = new Date(2026, 8, 10, 12);
const htmlPath = (name: string) => new URL(`./fixtures/html/${name}.html`, import.meta.url);
const captured = pages.filter((page) => existsSync(htmlPath(page.name)));

describe('clip snapshots', () => {
  it('has captured fixtures (run `npm run fixtures`)', () => {
    expect(captured.length).toBeGreaterThan(0);
  });

  it.each(captured)('$name', async ({ name, url }) => {
    const dom = new JSDOM(readFileSync(htmlPath(name), 'utf8'), { url, virtualConsole: new VirtualConsole() });
    const result = await Defuddle(dom, url, { markdown: true, useAsync: false });
    const note = buildNote(toExtractedPage(result, url), undefined, NOW);

    expect(note).not.toMatch(/^_organized:/m);
    await expect(note).toMatchFileSnapshot(`./__snapshots__/${name}.md`);
  }, 30_000);
});
