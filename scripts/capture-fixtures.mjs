// Captures the *rendered* DOM of each fixture page with headless Chrome, so SPAs are frozen after hydration.
// Usage: npm run fixtures [-- name1 name2] [-- --force]
import { execFile } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { promisify } from 'node:util';

const run = promisify(execFile);
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const root = new URL('../tests/fixtures/', import.meta.url);
const pages = JSON.parse(readFileSync(new URL('pages.json', root), 'utf8'));
const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.filter((arg) => !arg.startsWith('--'));

mkdirSync(new URL('html/', root), { recursive: true });

for (const { name, url, synthetic } of pages) {
  // Hand-written pages have no live source to capture.
  if (synthetic) continue;
  if (only.length && !only.includes(name)) continue;
  const target = new URL(`html/${name}.html`, root);
  if (existsSync(target) && !force) continue;
  try {
    const { stdout } = await run(
      CHROME,
      // --timeout forces the dump on ad-heavy pages whose virtual time never settles.
      ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=15000', '--timeout=30000', `--user-agent=${UA}`, '--dump-dom', url],
      { maxBuffer: 64 * 1024 * 1024, timeout: 90_000 },
    );
    writeFileSync(target, stdout);
    console.log(`✓ ${name} (${Math.round(stdout.length / 1024)} KB)`);
  } catch (error) {
    console.error(`✗ ${name}: ${error.message.split('\n')[0]}`);
  }
}
