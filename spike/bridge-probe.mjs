// Spike: can something other than Tolaria's own frontend reach the WS tool bridge?
// Run with Tolaria open on a vault: `node spike/bridge-probe.mjs` (VAULT=/abs/path to pick a vault).
import WebSocket from 'ws';

const URL = 'ws://localhost:9710';

function connect(options) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL, options);
    ws.once('open', () => resolve(ws));
    ws.once('error', reject);
  });
}

function rpc(ws) {
  let seq = 0;
  const pending = new Map();
  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());
    const p = pending.get(msg.id);
    if (!p) return;
    pending.delete(msg.id);
    msg.error ? p.reject(new Error(msg.error)) : p.resolve(msg.result);
  });
  return (tool, args = {}) =>
    new Promise((resolve, reject) => {
      const id = `probe-${++seq}`;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, tool, args }));
    });
}

// 1. Same handshake a browser extension would make (Origin header present).
try {
  const ws = await connect({ origin: 'chrome-extension://abcdefghijklmnopabcdefghijklmnop' });
  console.log('[origin] UNEXPECTED: connected with a chrome-extension origin');
  ws.close();
} catch (error) {
  console.log(`[origin] rejected as expected: ${error.message}`);
}

// 2. Origin-less client, i.e. what a native messaging host would be.
try {
  const ws = await connect();
  const call = rpc(ws);
  const { vaults } = await call('list_vaults');
  console.log('[no-origin] list_vaults:', vaults.map((v) => v.path));
  const vaultPath = process.env.VAULT ?? vaults[0]?.path;
  const path = `spike-bridge-${Date.now()}.md`;
  const content = `---\ntype: Clip\nurl: https://example.com\n---\n\n# Spike bridge ${new Date().toISOString()}\n\nCreated over ${URL} with create_note.\n`;
  console.log('[no-origin] create_note:', await call('create_note', { path, content, vaultPath }));
  ws.close();
} catch (error) {
  console.error(`[no-origin] failed: ${error.message} (is Tolaria open with an active vault?)`);
  process.exitCode = 1;
}
