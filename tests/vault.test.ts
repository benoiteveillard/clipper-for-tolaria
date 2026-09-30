import { describe, expect, it } from 'vitest';
import { isAbort, writeNote } from '../lib/vault';

class FakeDir {
  files = new Map<string, string>();
  dirs = new Map<string, FakeDir>();

  async getDirectoryHandle(name: string, options?: { create?: boolean }) {
    let dir = this.dirs.get(name);
    if (!dir && options?.create) this.dirs.set(name, (dir = new FakeDir()));
    if (!dir) throw new DOMException('missing', 'NotFoundError');
    return dir;
  }

  async getFileHandle(name: string, options?: { create?: boolean }) {
    if (!this.files.has(name)) {
      if (!options?.create) throw new DOMException('missing', 'NotFoundError');
      this.files.set(name, '');
    }
    return {
      createWritable: async () => ({
        write: async (content: string) => void this.files.set(name, content),
        close: async () => {},
      }),
    };
  }
}

const asVault = (dir: FakeDir) => dir as unknown as FileSystemDirectoryHandle;

describe('writeNote', () => {
  it('writes at the vault root and returns the relative path', async () => {
    const vault = new FakeDir();
    expect(await writeNote(asVault(vault), '', 'a.md', 'hello')).toBe('a.md');
    expect(vault.files.get('a.md')).toBe('hello');
  });

  it('creates nested subfolders, ignoring blank segments', async () => {
    const vault = new FakeDir();
    expect(await writeNote(asVault(vault), ' Clips / web //', 'a.md', 'x')).toBe('Clips/web/a.md');
    expect(vault.dirs.get('Clips')?.dirs.get('web')?.files.get('a.md')).toBe('x');
  });

  it('never overwrites an existing note', async () => {
    const vault = new FakeDir();
    await writeNote(asVault(vault), '', 'a.md', 'first');
    expect(await writeNote(asVault(vault), '', 'a.md', 'second')).toBe('a-2.md');
    expect(vault.files.get('a.md')).toBe('first');
  });
});

describe('isAbort', () => {
  it('recognises a dismissed picker only', () => {
    expect(isAbort(new DOMException('x', 'AbortError'))).toBe(true);
    expect(isAbort(new Error('x'))).toBe(false);
    expect(isAbort(undefined)).toBe(false);
  });
});
