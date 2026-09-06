import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const result = spawnSync(npmCommand, ['run', 'build'], {
  env: {
    ...process.env,
    PUBLIC_DEPLOY_ENV: 'staging',
    PUBLIC_SITE_URL: 'https://sp-rebirth-staging.rajputrupali138.workers.dev',
  },
  shell: process.platform === 'win32',
  stdio: 'inherit',
});

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

// Staging must remain non-indexable even if a crawler ignores robots.txt.
// Inject this only into the generated staging artifact so production headers
// stay unchanged until the explicit production release gate.
const headersUrl = new URL('../dist/client/_headers', import.meta.url);
const headers = readFileSync(headersUrl, 'utf8');
const globalRule = '/*\n';

if (!headers.startsWith(globalRule)) {
  throw new Error('Expected the generated _headers file to begin with the global /* rule.');
}

if (!headers.includes('X-Robots-Tag: noindex, nofollow')) {
  writeFileSync(
    headersUrl,
    headers.replace(globalRule, `${globalRule}  X-Robots-Tag: noindex, nofollow\n`),
    'utf8',
  );
}

console.log('[SP_REBIRTH] Staging X-Robots-Tag noindex header injected into generated artifact.');
