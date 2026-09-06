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

  it('builds an indexable production bundle only for the canonical production origin', () => {
    expect(packageJson).toMatch(/"build:production"\s*:\s*"node scripts\/build-production\.mjs"/);
    const productionBuild = readFileSync(join(root, 'scripts', 'build-production.mjs'), 'utf8');
    expect(productionBuild).toContain("PUBLIC_DEPLOY_ENV: 'production'");
    expect(productionBuild).toContain("PUBLIC_SITE_URL: 'https://www.sanapatel.com.au'");
  });

  it('injects staging noindex before static-asset parsing and always restores production-safe source headers', () => {
    const stagingBuild = readFileSync(join(root, 'scripts', 'build-staging.mjs'), 'utf8');
    const sourceHeaders = readFileSync(join(root, 'public', '_headers'), 'utf8');

    expect(sourceHeaders.startsWith('/*\n  X-Robots-Tag: noindex, nofollow\n')).toBe(false);
    expect(stagingBuild).toContain("const headersUrl = new URL('../public/_headers', import.meta.url)");
    expect(stagingBuild).toContain("const stagingNoindexRule = '  X-Robots-Tag: noindex, nofollow\\n'");
    expect(stagingBuild).toContain("writeFileSync(headersUrl, stagingHeaders, 'utf8')");
    expect(stagingBuild).toContain('finally {');
    expect(stagingBuild).toContain("writeFileSync(headersUrl, sourceHeaders, 'utf8')");

    const injectIndex = stagingBuild.indexOf("writeFileSync(headersUrl, stagingHeaders, 'utf8')");
    const buildIndex = stagingBuild.indexOf("spawnSync(npmCommand, ['run', 'build']");
    const restoreIndex = stagingBuild.indexOf("writeFileSync(headersUrl, sourceHeaders, 'utf8')");

    expect(injectIndex).toBeGreaterThan(-1);
    expect(buildIndex).toBeGreaterThan(injectIndex);
    expect(restoreIndex).toBeGreaterThan(buildIndex);
  });

  it('disables automatic resource provisioning in the preview upload script', () => {
    expect(packageJson).toMatch(
      /"deploy:preview"\s*:\s*"[^"]*wrangler versions upload[^"]*--experimental-provision=false[^"]*--experimental-auto-create=false[^"]*"/,
    );
  });

  it('binds separately verified production and staging Queue resources', () => {
    expect(wrangler).toMatch(/"queue"\s*:\s*"sp-rebirth-production-leads"/);
    expect(wrangler).toMatch(/"dead_letter_queue"\s*:\s*"sp-rebirth-production-leads-dlq"/);
    expect(wrangler).toMatch(/"env"\s*:\s*\{[\s\S]*"staging"\s*:/);
    expect(wrangler).toMatch(/"name"\s*:\s*"sp-rebirth-staging"/);
    expect(wrangler).toMatch(/"binding"\s*:\s*"LEAD_QUEUE"/);
    expect(wrangler).toMatch(/"queue"\s*:\s*"sp-rebirth-staging-leads"/);
    expect(wrangler).toMatch(/"dead_letter_queue"\s*:\s*"sp-rebirth-staging-leads-dlq"/);
  });
});
