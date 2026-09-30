import { loadSettings, saveSettings, subfolderError } from '@/lib/settings';
import { isAbort, loadVault, pickVault, supportsFsAccess, vaultPermission } from '@/lib/vault';

const form = document.getElementById('settings') as HTMLFormElement;
const pick = document.getElementById('pick') as HTMLButtonElement;
const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement;

async function showVault() {
  const vault = await loadVault();
  document.getElementById('vault-name')!.textContent = vault?.name ?? 'aucun';
  document.getElementById('vault-permission')!.textContent = vault ? `(${await vaultPermission(vault)})` : '';
}

const settings = await loadSettings();
field('type').value = settings.type;
field('subfolder').value = settings.subfolder;
field('authorAsWikilink').checked = settings.authorAsWikilink;

let hideSaved: ReturnType<typeof setTimeout> | undefined;

form.addEventListener('change', async () => {
  const error = subfolderError(field('subfolder').value);
  const message = document.getElementById('error')!;
  message.hidden = !error;
  message.textContent = error ?? '';
  field('subfolder').setAttribute('aria-invalid', String(Boolean(error)));
  if (error) return;
  await saveSettings({
    type: field('type').value.trim(),
    subfolder: field('subfolder').value.trim(),
    authorAsWikilink: field('authorAsWikilink').checked,
  });
  const saved = document.getElementById('saved')!;
  saved.hidden = false;
  clearTimeout(hideSaved);
  hideSaved = setTimeout(() => (saved.hidden = true), 2000);
});

if (supportsFsAccess()) {
  pick.addEventListener('click', async () => {
    try {
      await pickVault();
      await showVault();
    } catch (error) {
      if (!isAbort(error)) throw error;
    }
  });
  await showVault();
} else {
  pick.disabled = true;
  document.getElementById('vault-name')!.textContent = 'non supporté par ce navigateur';
}
