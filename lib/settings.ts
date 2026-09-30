import { DEFAULT_NOTE_OPTIONS, type NoteOptions } from './note';

export interface Settings extends NoteOptions {
  subfolder: string;
}

export const DEFAULT_SETTINGS: Settings = { ...DEFAULT_NOTE_OPTIONS, subfolder: '' };

// Returns why a subfolder can't be used, or undefined when it's fine. Segments are created with
// getDirectoryHandle, which rejects '.', '..' and names the OS won't accept.
export function subfolderError(subfolder: string): string | undefined {
  for (const segment of subfolder.split('/').map((s) => s.trim()).filter(Boolean)) {
    if (segment === '.' || segment === '..') return "'.' et '..' ne sont pas autorisés.";
    if (/[\\:*?"<>|\u0000-\u001f]/.test(segment)) return `Caractères interdits dans « ${segment} » : \\ : * ? " < > |`;
  }
  return undefined;
}

export async function loadSettings(): Promise<Settings> {
  const { settings } = await browser.storage.local.get('settings');
  return { ...DEFAULT_SETTINGS, ...(settings as Partial<Settings> | undefined) };
}

export const saveSettings = (settings: Settings) => browser.storage.local.set({ settings });

export function onSettingsChanged(listener: (settings: Settings) => void): void {
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.settings) {
      listener({ ...DEFAULT_SETTINGS, ...(changes.settings.newValue as Partial<Settings> | undefined) });
    }
  });
}
