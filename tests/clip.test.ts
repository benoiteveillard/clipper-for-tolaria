import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = new Map<string, unknown>();
const listeners: Array<(changes: Record<string, { newValue?: unknown }>, area: string) => void> = [];
const page = { url: 'https://e.com/a', title: 'A', markdown: 'body' };

vi.stubGlobal('browser', {
  i18n: { getMessage: (key: string) => key },
  storage: {
    session: {
      set: async (items: Record<string, unknown>) => {
        for (const [key, value] of Object.entries(items)) store.set(key, value);
        for (const listener of listeners) listener(Object.fromEntries(Object.keys(items).map((k) => [k, { newValue: items[k] }])), 'session');
      },
      get: async (key: string) => ({ [key]: store.get(key) }),
      remove: async (key: string) => void store.delete(key),
    },
    onChanged: { addListener: (listener: (typeof listeners)[number]) => listeners.push(listener) },
  },
  scripting: { executeScript: vi.fn(async () => [{ result: page }]) },
});

const { captureTab, clearPendingClip, loadPendingClip, onPendingClip } = await import('../lib/clip');

beforeEach(() => store.clear());

describe('per-window clip state', () => {
  it('keeps two windows apart', async () => {
    await captureTab({ id: 11, windowId: 1 });
    expect(await loadPendingClip(1)).toMatchObject({ status: 'ready', tabId: 11, page });
    expect(await loadPendingClip(2)).toBeUndefined();
  });

  it('only notifies the panel of its own window', async () => {
    const seen: unknown[] = [];
    onPendingClip(2, (clip) => seen.push(clip));
    await captureTab({ id: 11, windowId: 1 });
    expect(seen).toEqual([]);
    await captureTab({ id: 22, windowId: 2 });
    expect(seen.map((clip) => (clip as { status: string }).status)).toEqual(['loading', 'ready']);
  });

  it('reports extraction failures as an error state', async () => {
    vi.mocked(browser.scripting.executeScript).mockRejectedValueOnce(new Error('Cannot access a chrome:// URL'));
    await captureTab({ id: 33, windowId: 3 });
    expect(await loadPendingClip(3)).toMatchObject({ status: 'error' });
  });

  it('forgets a closed window', async () => {
    await captureTab({ id: 11, windowId: 1 });
    await clearPendingClip(1);
    expect(await loadPendingClip(1)).toBeUndefined();
  });
});
