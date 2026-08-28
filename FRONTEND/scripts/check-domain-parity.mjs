/**
 * Asserts the frontend and backend agree on the vocabulary of the business.
 *
 * The two packages ship separately, so `FRONTEND/src/lib/domain.js` has to
 * repeat `BACKEND/src/constants/domain.js`. Duplication that nothing checks is
 * duplication that drifts: a status added on one side only becomes either a
 * dropdown option the API rejects on save, or a value the API can store that
 * the admin cannot display.
 *
 *   npm run check:domain
 *
 * Skips quietly when the backend is not checked out alongside the frontend,
 * so a frontend-only deploy does not fail on it.
 */
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BACKEND_DOMAIN = resolve(ROOT, '../BACKEND/src/constants/domain.js');

if (!existsSync(BACKEND_DOMAIN)) {
  console.log('[domain] backend not checked out alongside the frontend - skipping');
  process.exit(0);
}

const server = await import(pathToFileURL(BACKEND_DOMAIN).href);
const client = await import(pathToFileURL(resolve(ROOT, 'src/lib/domain.js')).href);

const drifted = [];
let checked = 0;

for (const name of Object.keys(client)) {
  if (!(name in server)) continue;
  checked += 1;
  const a = [...server[name]].sort();
  const b = [...client[name]].sort();
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    drifted.push({
      name,
      serverOnly: a.filter((v) => !b.includes(v)),
      clientOnly: b.filter((v) => !a.includes(v)),
    });
  }
}

if (drifted.length) {
  console.error('\n[domain] the two copies have drifted:\n');
  for (const { name, serverOnly, clientOnly } of drifted) {
    console.error(`  ${name}`);
    if (serverOnly.length) console.error(`    only on the server: ${serverOnly.join(', ')}`);
    if (clientOnly.length) console.error(`    only on the client: ${clientOnly.join(', ')}`);
  }
  console.error('\n  Reconcile BACKEND/src/constants/domain.js and FRONTEND/src/lib/domain.js.\n');
  process.exit(1);
}

console.log(`[domain] ${checked} shared lists, frontend and backend in step`);
