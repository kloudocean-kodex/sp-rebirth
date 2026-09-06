import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const headersUrl = new URL('../public/_headers', import.meta.url);
const sourceHeaders = readFileSync(headersUrl, 'utf8');
const globalRule = '/*\n';
const stagingNoindexRule = '  X-Robots-Tag: noindex, nofollow\n';

if (!sourceHeaders.startsWith(globalRule)) {
  throw new Error('Expected public/_headers to begin with the global /* rule.');
}

if (sourceHeaders.startsWith(`${globalRule}${stagingNoindexRule}`)) {
  throw new Error('Production source headers unexpectedly already contain a global noindex rule.');
}

const stagingHeaders = sourceHeaders.replace(globalRule, `${globalRule}${stagingNoindexRule}`);
let result;

writeFileSync(headersUrl, stagingHeaders, 'utf8');
try {
  // Workers Static Assets parse `_headers` during the Astro/Cloudflare build.
  // Add the staging-only indexing rule before that parse, then restore the
  // production-safe source file immediately after the synchronous build exits.
  result = spawnSync(npmCommand, ['run', 'build'], {
    env: {
      ...process.env,
      PUBLIC_DEPLOY_ENV: 'staging',
      PUBLIC_SITE_URL: 'https://sp-rebirth-staging.rajputrupali138.workers.dev',
    },
    shell: process.platform === 'win32',
    stdio: 'inherit',
  });
} finally {
  writeFileSync(headersUrl, sourceHeaders, 'utf8');
}

if (!result) throw new Error('Staging build did not return a process result.');
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
