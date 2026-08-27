import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const wrangler = readFileSync(join(root, 'wrangler.jsonc'), 'utf8');
const packageJson = readFileSync(join(root, 'package.json'), 'utf8');

describe('Cloudflare deployment contract', () => {
  it('routes Wrangler through the reviewed custom Worker entrypoint', () => {
    expect(wrangler).toMatch(/"main"\s*:\s*"\.\/src\/worker\.ts"/);
  });

  it('retains the required Workers compatibility flags', () => {
    expect(wrangler).toContain('nodejs_compat');
    expect(wrangler).toContain('global_fetch_strictly_public');
  });

  it('disables automatic resource provisioning in the explicit deploy script', () => {
    expect(packageJson).toMatch(
      /"deploy"\s*:\s*"[^"]*wrangler deploy[^"]*--experimental-provision=false[^"]*--experimental-auto-create=false[^"]*"/,
    );
  });

  it('does not commit guessed Queue resources before account verification', () => {
    // This assertion is intentionally temporary. When the real staging Queue and
    // DLQ have been verified/provisioned, replace it with assertions for those
    // exact reviewed bindings rather than deleting deployment-contract coverage.
    expect(wrangler).not.toMatch(/"queues"\s*:/);
  });
});
