import { slugify, uniqueFilename } from './filename';

const DB_NAME = 'tolaria-clipper';
const STORE = 'handles';
const VAULT_KEY = 'vault';
const READ_WRITE = { mode: 'readwrite' } as const;

function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB_NAME, 1);
    open.onupgradeneeded = () => open.result.createObjectStore(STORE);
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const request = run(open.result.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(request.error);
    };
  });
}

// The user dismissing the directory picker is not an error worth showing.
export const isAbort = (error: unknown) => (error as DOMException)?.name === 'AbortError';

export const supportsFsAccess = () => typeof window.showDirectoryPicker === 'function';

export const loadVault = () =>
  withStore<FileSystemDirectoryHandle | undefined>('readonly', (store) => store.get(VAULT_KEY));

export async function pickVault(): Promise<FileSystemDirectoryHandle> {
  const handle = await window.showDirectoryPicker!({ id: 'tolaria-vault', mode: 'readwrite', startIn: 'documents' });
  await withStore('readwrite', (store) => store.put(handle, VAULT_KEY));
  return handle;
}

export const vaultPermission = (vault: FileSystemDirectoryHandle) => vault.queryPermission(READ_WRITE);

// requestPermission needs a user gesture: call it straight from a click handler.
export async function ensurePermission(vault: FileSystemDirectoryHandle): Promise<boolean> {
  if ((await vault.queryPermission(READ_WRITE)) === 'granted') return true;
  return (await vault.requestPermission(READ_WRITE)) === 'granted';
}

export const subfolderSegments = (subfolder: string) => subfolder.split('/').map((s) => s.trim()).filter(Boolean);

// Without `create`, a missing folder resolves to undefined instead of throwing.
export async function resolveDir(
  vault: FileSystemDirectoryHandle,
  segments: string[],
  create = false,
): Promise<FileSystemDirectoryHandle | undefined> {
  let dir = vault;
  for (const segment of segments) {
    try {
      dir = await dir.getDirectoryHandle(segment, { create });
    } catch (error) {
      if (!create && (error as DOMException).name === 'NotFoundError') return undefined;
      throw error;
    }
  }
  return dir;
}

// Returns the vault-relative path of the written note.
export async function writeNote(
  vault: FileSystemDirectoryHandle,
  subfolder: string,
  filename: string,
  content: string,
): Promise<string> {
  const segments = subfolderSegments(subfolder);
  const dir = (await resolveDir(vault, segments, true))!;

  const name = await uniqueFilename(filename, async (candidate) => {
    try {
      await dir.getFileHandle(candidate);
      return true;
    } catch (error) {
      return (error as DOMException).name !== 'NotFoundError';
    }
  });

  const writable = await (await dir.getFileHandle(name, { create: true })).createWritable();
  await writable.write(content);
  await writable.close();
  return [...segments, name].join('/');
}

// tolaria://<vault-slug>/<path> (ADR-0129). The slug falls back to the folder basename,
// which matches Tolaria unless the vault has a custom alias or label.
export function tolariaLink(vault: FileSystemDirectoryHandle, path: string): string {
  return `tolaria://${slugify(vault.name)}/${path.split('/').map(encodeURIComponent).join('/')}`;
}
