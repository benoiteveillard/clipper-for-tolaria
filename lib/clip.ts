import { t } from './i18n';
import type { ExtractedPage } from './note';

export type PendingClip =
  | { status: 'loading'; tabId: number }
  | { status: 'ready'; tabId: number; page: ExtractedPage }
  | { status: 'error'; tabId: number; error: string };

// One entry per browser window: each window has its own side panel and its own active tab.
export const clipKey = (windowId: number) => `pendingClip:${windowId}`;

export interface ClipTarget {
  id: number;
  windowId: number;
}

// Relies on activeTab: only works right after the user clicked the action on that tab.
export async function extractTab(tabId: number): Promise<ExtractedPage> {
  const [injection] = await browser.scripting.executeScript({ target: { tabId }, files: ['/extract.js'] });
  const page = injection?.result as ExtractedPage | undefined;
  if (!page || (!page.markdown && !page.title)) throw new Error(t('nothingToExtract'));
  return page;
}

export async function captureTab({ id: tabId, windowId }: ClipTarget): Promise<void> {
  const set = (clip: PendingClip) => browser.storage.session.set({ [clipKey(windowId)]: clip });
  await set({ status: 'loading', tabId });
  try {
    await set({ status: 'ready', tabId, page: await extractTab(tabId) });
  } catch (error) {
    await set({ status: 'error', tabId, error: explain(error) });
  }
}

export async function loadPendingClip(windowId: number): Promise<PendingClip | undefined> {
  const key = clipKey(windowId);
  return (await browser.storage.session.get(key))[key] as PendingClip | undefined;
}

export function onPendingClip(windowId: number, listener: (clip: PendingClip | undefined) => void): void {
  const key = clipKey(windowId);
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'session' && key in changes) listener(changes[key]!.newValue as PendingClip | undefined);
  });
}

export const clearPendingClip = (windowId: number) => browser.storage.session.remove(clipKey(windowId));

function explain(error: unknown): string {
  const message = (error as Error).message ?? String(error);
  if (/cannot access|permission|chrome:\/\/|extensions gallery/i.test(message)) {
    return t('pageInaccessible');
  }
  return message;
}
