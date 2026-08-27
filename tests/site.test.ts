import { describe, expect, it } from 'vitest';
import { INDEXED_PATHS, INTERNAL_PATH_PREFIXES, SITE } from '../src/config/site';

describe('site configuration', () => {
  it('uses an HTTPS canonical production origin', () => {
    const url = new URL(SITE.url);
    expect(url.protocol).toBe('https:');
    expect(url.hostname).toBe('www.sanapatel.com.au');
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
});
