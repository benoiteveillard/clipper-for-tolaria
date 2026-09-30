import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = new URL('..', import.meta.url).pathname;
type Messages = Record<string, { message: string; placeholders?: Record<string, unknown> }>;
const load = (lang: string): Messages => JSON.parse(readFileSync(join(root, `public/_locales/${lang}/messages.json`), 'utf8'));
const en = load('en');
const fr = load('fr');

function sources(dir: string): string[] {
  return readdirSync(join(root, dir)).flatMap((name) => {
    const path = join(dir, name);
    if (name === 'spike') return [];
    return statSync(join(root, path)).isDirectory() ? sources(path) : [path];
  });
}
const files = [...sources('entrypoints'), ...sources('lib')];
const read = (path: string) => readFileSync(join(root, path), 'utf8');

describe('messages', () => {
  it('has the same keys in every language', () => {
    expect(Object.keys(fr).sort()).toEqual(Object.keys(en).sort());
  });

  it('keeps placeholders in sync', () => {
    for (const key of Object.keys(en)) {
      const tokens = (m: Messages) => (m[key]!.message.match(/\$[A-Z0-9_]+\$/g) ?? []).sort();
      expect(tokens(fr), key).toEqual(tokens(en));
      for (const token of tokens(en)) {
        expect(en[key]!.placeholders, key).toHaveProperty(token.slice(1, -1).toLowerCase());
      }
    }
  });

  it('has no empty message', () => {
    for (const messages of [en, fr]) for (const [key, { message }] of Object.entries(messages)) expect(message.trim(), key).not.toBe('');
  });
});

describe('usage', () => {
  it('only asks for messages that exist', () => {
    const used = new Set<string>();
    for (const path of files.filter((f) => /\.ts$/.test(f))) {
      for (const match of read(path).matchAll(/\bt\(\s*'([A-Za-z0-9_]+)'/g)) used.add(match[1]!);
    }
    for (const path of files.filter((f) => /\.html$/.test(f))) {
      for (const match of read(path).matchAll(/data-i18n(?:-placeholder)?="([A-Za-z0-9_]+)"/g)) used.add(match[1]!);
    }
    expect(used.size).toBeGreaterThan(30);
    for (const key of used) expect(en, key).toHaveProperty(key);
  });

  it('references manifest messages that exist', () => {
    for (const match of read('wxt.config.ts').matchAll(/__MSG_([A-Za-z0-9_]+)__/g)) expect(en, match[1]).toHaveProperty(match[1]!);
  });

  it('has no unused message', () => {
    const everything = [...files, 'wxt.config.ts'].map(read).join('\n');
    for (const key of Object.keys(en)) expect(everything, key).toContain(key);
  });
});
