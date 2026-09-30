import { cleanUrl } from './extract';

const HEAD_BYTES = 2048;
const BATCH = 32;
const MAX_FILES = 5000;

// Reads `url:` from the frontmatter block at the top of a note (the head may be truncated).
export function frontmatterUrl(head: string): string | undefined {
  const block = head.match(/^---\r?\n([\s\S]*?)(?:\r?\n---|$)/)?.[1];
  const value = block?.match(/^url:[ \t]*(.+?)[ \t]*$/m)?.[1];
  return value?.replace(/^(["'])(.*)\1$/, '$2');
}

// Same page despite tracking params, fragments, host case or a trailing slash.
export function sameUrl(a: string, b: string): boolean {
  return normalize(a) === normalize(b);
}

function normalize(url: string): string {
  try {
    const parsed = new URL(cleanUrl(url));
    parsed.hash = '';
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return url.trim();
  }
}

// Looks only at notes directly inside `dir`, reading just their first bytes. Returns the file name.
export async function findClipByUrl(dir: FileSystemDirectoryHandle, url: string): Promise<string | undefined> {
  const files: FileSystemFileHandle[] = [];
  for await (const entry of dir.values()) {
    if (entry.kind === 'file' && entry.name.endsWith('.md') && files.length < MAX_FILES) files.push(entry as FileSystemFileHandle);
  }
  for (let i = 0; i < files.length; i += BATCH) {
    const batch = files.slice(i, i + BATCH);
    const heads = await Promise.all(batch.map(async (handle) => (await (await handle.getFile()).slice(0, HEAD_BYTES).text())));
    const hit = heads.findIndex((head) => {
      const found = frontmatterUrl(head);
      return found !== undefined && sameUrl(found, url);
    });
    if (hit !== -1) return batch[hit]!.name;
  }
  return undefined;
}
