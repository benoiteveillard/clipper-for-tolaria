import { ensurePermission, loadVault, pickVault, vaultPermission, writeNote } from '@/lib/vault';

// Persisted so the log survives a full browser restart, which is the point of the spike.
const LOG_KEY = 'spike-log';
const logEl = document.getElementById('log')!;

function log(line: string) {
  const entry = `${new Date().toLocaleString()}  ${line}`;
  const lines = [...JSON.parse(localStorage.getItem(LOG_KEY) ?? '[]'), entry];
  localStorage.setItem(LOG_KEY, JSON.stringify(lines));
  logEl.textContent = lines.join('\n');
}

async function guard(label: string, action: () => Promise<void>) {
  try {
    await action();
  } catch (error) {
    log(`${label} ✗ ${(error as Error).name}: ${(error as Error).message}`);
  }
}

function probe(port: number): Promise<string> {
  return new Promise((resolve) => {
    const ws = new WebSocket(`ws://localhost:${port}`);
    ws.onopen = () => {
      ws.close();
      resolve('open (accepted)');
    };
    ws.onerror = () => resolve('error (handshake rejected or nothing listening)');
  });
}

document.getElementById('pick')!.addEventListener('click', () =>
  guard('pick', async () => {
    const vault = await pickVault();
    log(`pick ✓ "${vault.name}" permission=${await vaultPermission(vault)}`);
  }),
);

document.getElementById('write')!.addEventListener('click', () =>
  guard('write', async () => {
    const vault = await loadVault();
    if (!vault) return log('write ✗ no stored handle');
    log(`write: before=${await vaultPermission(vault)}`);
    const granted = await ensurePermission(vault);
    log(`write: after request=${await vaultPermission(vault)}`);
    if (!granted) return;
    const now = new Date();
    const content = `---\ntype: Clip\nurl: https://example.com/spike\n---\n\n# Spike ${now.toISOString()}\n\nWritten by the extension via the File System Access API.\n`;
    log(`write ✓ ${await writeNote(vault, '', `spike-${now.getTime()}.md`, content)}`);
  }),
);

document.getElementById('ws')!.addEventListener('click', async () => {
  log(`ws 9710 (tool bridge): ${await probe(9710)}`);
  log(`ws 9711 (UI bridge): ${await probe(9711)}`);
});

document.getElementById('clear')!.addEventListener('click', () => {
  localStorage.removeItem(LOG_KEY);
  logEl.textContent = '';
});

await guard('load', async () => {
  const vault = await loadVault();
  log(vault ? `load: handle "${vault.name}" permission=${await vaultPermission(vault)}` : 'load: no stored handle');
});
