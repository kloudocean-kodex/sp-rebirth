import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { INDEXED_PATHS, INTERNAL_PATH_PREFIXES, SITE } from '../src/config/site';

const publicPageSourceFiles = [
  '../src/pages/index.astro',
  '../src/pages/404.astro',
  '../src/pages/about/index.astro',
  '../src/pages/lease/index.astro',
  '../src/pages/for-renters/index.astro',
  '../src/pages/sale/index.astro',
  '../src/pages/contact/index.astro',
  '../src/pages/rental-providers/index.astro',
  '../src/pages/rental-appraisal/index.astro',
  '../src/pages/switch-property-managers/index.astro',
  '../src/pages/property-management-visibility-check/index.astro',
] as const;

const prelaunchCopyPatterns = [
  /\bSP_REBIRTH\b/i,
  /\bthis page will become\b/i,
  /\bthe new site will\b/i,
] as const;

describe('site configuration', () => {
  it('uses HTTPS production and browser-icon origins', () => {
    const siteUrl = new URL(SITE.url);
    const faviconUrl = new URL(SITE.favicon);

    expect(siteUrl.protocol).toBe('https:');
    expect(siteUrl.hostname).toBe('www.sanapatel.com.au');
    expect(faviconUrl.protocol).toBe('https:');
    expect(faviconUrl.hostname).toBe('www.sanapatel.com.au');
  });

  it('keeps the indexed crawl surface unique and canonical', () => {
    expect(new Set(INDEXED_PATHS).size).toBe(INDEXED_PATHS.length);

    for (const path of INDEXED_PATHS) {
      expect(path.startsWith('/')).toBe(true);
      expect(path === '/' || path.endsWith('/')).toBe(true);
      expect(path.includes('?')).toBe(false);
      expect(path.includes('#')).toBe(false);
    }
  });

  it('never exposes internal runtime routes as indexable pages', () => {
    for (const prefix of INTERNAL_PATH_PREFIXES) {
      expect(INDEXED_PATHS.some((path) => path.startsWith(prefix))).toBe(false);
    }
  });

  it('keeps privacy and thank-you surfaces out of the production sitemap', () => {
    expect(INDEXED_PATHS).not.toContain('/privacy/');
    expect(INDEXED_PATHS).not.toContain('/thank-you/');
  });

  it('keeps public visitor-facing page source free of internal pre-launch language', () => {
    for (const relativePath of publicPageSourceFiles) {
      const source = readFileSync(new URL(relativePath, import.meta.url), 'utf8');
      for (const pattern of prelaunchCopyPatterns) {
        expect(source, `${relativePath} contains pre-launch copy matching ${pattern}`).not.toMatch(pattern);
      }
    }
  });
});
