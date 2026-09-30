import { describe, expect, it } from 'vitest';
import type { DefuddleResponse } from 'defuddle';
import { cleanUrl, iframesToLinks, toExtractedPage } from '../lib/extract';

describe('cleanUrl', () => {
  it('drops tracking params and keeps the rest', () => {
    expect(
      cleanUrl('https://www.searchenginejournal.com/post/572386/?user_id=abc&utm_campaign=x&utm_medium=email&_hsmi=1&page=2#section'),
    ).toBe('https://www.searchenginejournal.com/post/572386/?page=2#section');
  });

  it('leaves invalid URLs untouched', () => {
    expect(cleanUrl('not a url')).toBe('not a url');
  });
});

describe('iframesToLinks', () => {
  it('turns an embed into a link, decoding entities', () => {
    expect(iframesToLinks('a\n\n<iframe src="https://x.fr/sim?a=1&amp;b=2" title="Nos [Gestes]" allowfullscreen="true"></iframe>\n\nb')).toBe(
      'a\n\n[Nos Gestes](https://x.fr/sim?a=1&b=2)\n\nb',
    );
  });

  it('falls back to the hostname, and drops embeds without a web src', () => {
    expect(iframesToLinks("<iframe src='https://youtu.be/x'></iframe>")).toBe('[youtu.be](https://youtu.be/x)');
    expect(iframesToLinks('<iframe src="javascript:alert(1)"></iframe>x')).toBe('x');
    expect(iframesToLinks('<iframe></iframe>x')).toBe('x');
  });
});

describe('lead image', () => {
  const image = (value: string) => toExtractedPage({ title: 't', content: '', image: value } as DefuddleResponse, 'https://e.com/a').image;

  it('drops generic site images but keeps article ones', () => {
    expect(image('https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png')).toBeUndefined();
    expect(image('/img/placeholder.jpg')).toBeUndefined();
    expect(image('/img/cover-photo.jpg')).toBe('https://e.com/img/cover-photo.jpg');
    expect(image('https://cdn.e.com/catalog/2026/blog-post.jpg')).toBe('https://cdn.e.com/catalog/2026/blog-post.jpg');
  });
});
