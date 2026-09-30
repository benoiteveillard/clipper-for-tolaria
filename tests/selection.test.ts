import { Defuddle } from 'defuddle/node';
import { JSDOM, VirtualConsole } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { selectionHtml, selectionPage } from '../lib/selection';

const URL_ = 'https://e.com/post';

// Mirrors entrypoints/extract.ts: select in the live page, then convert the wrapped passage.
async function clipSelection(body: string, select: (doc: Document) => Range[]) {
  const dom = new JSDOM(`<!doctype html><body>${body}</body>`, { url: URL_, virtualConsole: new VirtualConsole() });
  const html = selectionHtml(select(dom.window.document), dom.window.document);
  const doc = new JSDOM(selectionPage(html), { url: URL_, virtualConsole: new VirtualConsole() });
  return (await Defuddle(doc, URL_, { markdown: true, useAsync: false })).content;
}

const rangeOf = (doc: Document, from: string, to: string) => {
  const range = doc.createRange();
  range.setStartBefore(doc.getElementById(from)!);
  range.setEndAfter(doc.getElementById(to)!);
  return range;
};

describe('selection clipping', () => {
  const page = '<nav>Menu</nav><p id="a">Intro <b>bold</b>.</p><p id="b">See <a href="/x">this</a>.</p><p id="c">Outro</p>';

  it('keeps only the selected blocks, with formatting and absolute links', async () => {
    const markdown = await clipSelection(page, (doc) => [rangeOf(doc, 'a', 'b')]);
    expect(markdown).toBe('Intro **bold**.\n\nSee [this](https://e.com/x).');
  });

  it('keeps a short one-line quote', async () => {
    expect(await clipSelection(page, (doc) => [rangeOf(doc, 'c', 'c')])).toBe('Outro');
  });

  it('joins several ranges', async () => {
    const markdown = await clipSelection(page, (doc) => [rangeOf(doc, 'a', 'a'), rangeOf(doc, 'c', 'c')]);
    expect(markdown).toBe('Intro **bold**.\n\nOutro');
  });
});
