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

  it('disables automatic resource provisioning in the preview upload script', () => {
    expect(packageJson).toMatch(
      /"deploy:preview"\s*:\s*"[^"]*wrangler versions upload[^"]*--experimental-provision=false[^"]*--experimental-auto-create=false[^"]*"/,
    );
  });

  it('keeps the verified lead Queue contract isolated to staging', () => {
    expect(wrangler).toMatch(/"env"\s*:\s*\{[\s\S]*"staging"\s*:/);
    expect(wrangler).toMatch(/"name"\s*:\s*"sp-rebirth-staging"/);
    expect(wrangler).toMatch(/"binding"\s*:\s*"LEAD_QUEUE"/);
    expect(wrangler).toMatch(/"queue"\s*:\s*"sp-rebirth-staging-leads"/);
    expect(wrangler).toMatch(/"dead_letter_queue"\s*:\s*"sp-rebirth-staging-leads-dlq"/);
  });
});
