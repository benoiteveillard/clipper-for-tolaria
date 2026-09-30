import { captureTab, loadPendingClip, onPendingClip, type PendingClip } from '@/lib/clip';
import { findClipByUrl } from '@/lib/duplicates';
import { copyMarkdown, downloadMarkdown } from '@/lib/fallback';
import { noteFilename } from '@/lib/filename';
import { buildNote, noteTitle, type ExtractedPage } from '@/lib/note';
import { loadSettings, onSettingsChanged } from '@/lib/settings';
import {
  ensurePermission,
  isAbort,
  loadVault,
  pickVault,
  resolveDir,
  subfolderSegments,
  supportsFsAccess,
  tolariaLink,
  vaultPermission,
  writeNote,
} from '@/lib/vault';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const status = $('status');
const form = $<HTMLFormElement>('clip');
const title = $<HTMLInputElement>('title');
const type = $<HTMLInputElement>('type');
const body = $<HTMLTextAreaElement>('body');
const save = $<HTMLButtonElement>('save');
const duplicate = $('duplicate');
const duplicateLink = $<HTMLAnchorElement>('duplicate-link');
const openLink = $<HTMLAnchorElement>('open');

const SAVE_LABEL = save.textContent;
let settings = await loadSettings();
onSettingsChanged((next) => {
  settings = next;
});
const incomingBox = $('incoming');
const windowId = (await browser.windows.getCurrent()).id!;
let page: ExtractedPage | undefined;
let incoming: ExtractedPage | undefined;
let baseline = '';

const snapshot = () => JSON.stringify([title.value, type.value, body.value]);
// Unsaved edits: a new clip must not silently replace them.
const isDirty = () => !form.hidden && snapshot() !== baseline;
const markClean = () => {
  baseline = snapshot();
};

function setStatus(text: string, kind: 'info' | 'ok' | 'error' = 'info') {
  status.textContent = text;
  status.dataset.kind = kind;
}

function render(clip: PendingClip | undefined) {
  if (!clip) return;
  if (clip.status === 'loading') return setStatus('Extraction en cours…');
  if (clip.status === 'error') return setStatus(clip.error, 'error');
  if (isDirty()) return offerIncoming(clip.page);
  show(clip.page);
}

function show(next: ExtractedPage) {
  page = next;
  incoming = undefined;
  incomingBox.hidden = true;
  title.value = noteTitle(page);
  type.value = settings.type;
  body.value = page.markdown;
  markClean();
  openLink.hidden = true;
  form.hidden = false;
  setStatus(describe(page));
  void checkDuplicate();
}

function offerIncoming(next: ExtractedPage) {
  incoming = next;
  $('incoming-title').textContent = noteTitle(next);
  incomingBox.hidden = false;
  // The "loading" status replaced the current clip's line: put it back.
  if (page) setStatus(describe(page));
}

const describe = (p: ExtractedPage) => `${p.selection ? 'Sélection · ' : ''}${p.site || new URL(p.url).hostname}`;

async function lookupDuplicate(vault: FileSystemDirectoryHandle, url: string): Promise<string | undefined> {
  const segments = subfolderSegments(settings.subfolder);
  const dir = await resolveDir(vault, segments);
  const name = dir && (await findClipByUrl(dir, url));
  return name ? [...segments, name].join('/') : undefined;
}

function showDuplicate(vault: FileSystemDirectoryHandle, path: string) {
  duplicateLink.textContent = path;
  duplicateLink.href = tolariaLink(vault, path);
  duplicate.hidden = false;
  save.textContent = 'Enregistrer quand même';
}

// Only looks when the permission is already granted: it must never trigger a prompt by itself.
async function checkDuplicate() {
  const current = page;
  hideDuplicate();
  if (!current?.url || !supportsFsAccess()) return;
  try {
    const vault = await loadVault();
    if (!vault || (await vaultPermission(vault)) !== 'granted') return;
    const path = await lookupDuplicate(vault, current.url);
    if (path && page === current) showDuplicate(vault, path);
  } catch {
    // Best effort: a failed lookup must not get in the way of saving.
  }
}

function hideDuplicate() {
  duplicate.hidden = true;
  save.textContent = SAVE_LABEL;
}

function currentNote(): string {
  if (!page) throw new Error('Aucune page capturée.');
  return buildNote(
    { ...page, title: title.value, markdown: body.value },
    { type: type.value.trim(), authorAsWikilink: settings.authorAsWikilink },
  );
}

async function showVault() {
  if (!supportsFsAccess()) {
    save.hidden = true;
    $('pick').hidden = true;
    $('vault-name').textContent = 'non supporté par ce navigateur (Copier / Télécharger)';
    return;
  }
  const vault = await loadVault();
  $('vault-name').textContent = vault?.name ?? 'aucun';
  $('vault-permission').textContent = vault ? `(${await vaultPermission(vault)})` : '';
}

async function run(action: () => Promise<void>) {
  try {
    await action();
  } catch (error) {
    if (!isAbort(error)) setStatus((error as Error).message, 'error');
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  // Enter in a text field submits even when the save button is hidden (Firefox has no FS Access).
  if (!supportsFsAccess() || save.disabled) return;
  save.disabled = true;
  // Stays inside the click's user activation, which requestPermission/showDirectoryPicker need.
  void run(async () => {
    const vault = (await loadVault()) ?? (await pickVault());
    if (!(await ensurePermission(vault))) return setStatus('Accès au vault refusé.', 'error');
    // Another window (or an earlier click) may have saved this page since the panel last looked.
    if (duplicate.hidden && page?.url) {
      const existing = await lookupDuplicate(vault, page.url).catch(() => undefined);
      if (existing) {
        showDuplicate(vault, existing);
        return setStatus('Cette page est déjà dans le vault : clique de nouveau pour enregistrer quand même.', 'error');
      }
    }
    const path = await writeNote(vault, settings.subfolder, noteFilename(title.value), currentNote());
    openLink.href = tolariaLink(vault, path);
    openLink.hidden = false;
    hideDuplicate();
    markClean();
    setStatus(`Enregistré dans l'Inbox : ${path}`, 'ok');
    await showVault();
  }).finally(() => {
    save.disabled = false;
  });
});

$('copy').addEventListener('click', () =>
  run(async () => {
    await copyMarkdown(currentNote());
    markClean();
    setStatus('Markdown copié.', 'ok');
  }),
);

$('download').addEventListener('click', () =>
  run(async () => {
    downloadMarkdown(noteFilename(title.value), currentNote());
    markClean();
    setStatus('Fichier téléchargé.', 'ok');
  }),
);

$('pick').addEventListener('click', () =>
  run(async () => {
    await pickVault();
    await showVault();
  }),
);

$('reclip').addEventListener('click', () =>
  run(async () => {
    const [tab] = await browser.tabs.query({ active: true, windowId });
    if (tab?.id !== undefined) await captureTab({ id: tab.id, windowId });
  }),
);

$('incoming-replace').addEventListener('click', () => incoming && show(incoming));
$('incoming-dismiss').addEventListener('click', () => {
  incoming = undefined;
  incomingBox.hidden = true;
});

onPendingClip(windowId, render);
render(await loadPendingClip(windowId));
await showVault();
