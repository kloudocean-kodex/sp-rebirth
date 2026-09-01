import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { AI_DISCOVERY_USER_AGENTS, INDEXED_PATHS, INTERNAL_PATH_PREFIXES, SITE } from '../src/config/site';
import { buildRobotsPolicy } from '../src/pages/robots.txt';

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
  '../src/pages/rental-position-check/index.astro',
  '../src/pages/resources/index.astro',
  '../src/pages/resources/victoria-rental-minimum-standards/index.astro',
  '../src/pages/resources/routine-inspections-victoria/index.astro',
  '../src/pages/resources/changing-property-managers-victoria/index.astro',
] as const;

const reviewedResourcePaths = [
  '/resources/',
  '/resources/victoria-rental-minimum-standards/',
  '/resources/routine-inspections-victoria/',
  '/resources/changing-property-managers-victoria/',
] as const;

const prelaunchCopyPatterns = [/\bSP_REBIRTH\b/i, /\bthis page will become\b/i, /\bthe new site will\b/i] as const;

describe('site configuration', () => {
  it('uses HTTPS production and browser-icon origins', () => {
    const siteUrl = new URL(SITE.url);
    const faviconUrl = new URL(SITE.favicon);

    expect(siteUrl.protocol).toBe('https:');
    expect(siteUrl.hostname).toBe('www.sanapatel.com.au');
    expect(faviconUrl.protocol).toBe('https:');
    expect(faviconUrl.hostname).toBe('www.sanapatel.com.au');
  });

  it('connects the business and founder to verified public entity profiles', () => {
    const publicProfiles = [...SITE.profiles.business, ...SITE.profiles.founder];

    expect(publicProfiles).toContain('https://www.realestate.com.au/agency/sana-patel-real-estate-KRFFJV');
    expect(publicProfiles).toContain('https://www.realestate.com.au/agent/sana-patel-3829096');
    expect(publicProfiles).toContain('https://au.linkedin.com/in/sana-p-726457138');
    expect(publicProfiles).toContain(SITE.reviews.googleProfileUrl);
    expect(publicProfiles).toContain(SITE.reviews.trustindexSummaryUrl);
    expect(new Set(publicProfiles).size).toBe(publicProfiles.length);

    for (const profile of publicProfiles) expect(new URL(profile).protocol).toBe('https:');
  });

  it('allows opted-in AI discovery crawlers without exposing internal runtime routes', () => {
    const policy = buildRobotsPolicy(true, new URL(SITE.url));
    const groups = policy.split('\n\n');

    for (const userAgent of AI_DISCOVERY_USER_AGENTS) {
      const group = groups.find((candidate) => candidate.startsWith(`User-agent: ${userAgent}\n`));
      expect(group).toBeDefined();
      expect(group).toContain('Allow: /');
      for (const prefix of INTERNAL_PATH_PREFIXES) expect(group).toContain(`Disallow: ${prefix}`);
    }

    expect(policy).toContain(`Sitemap: ${new URL('/sitemap.xml', SITE.url).toString()}`);
    expect(buildRobotsPolicy(false, new URL(SITE.url))).toBe('User-agent: *\nDisallow: /\n');
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

  it('publishes the reviewed resource hub and guides in the production crawl surface', () => {
    for (const path of reviewedResourcePaths) {
      expect(INDEXED_PATHS).toContain(path);
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

  it('keeps the homepage hero static and aligned with the default social image', () => {
    const source = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
    expect(source).not.toMatch(/<video\b/i);
    expect(source).toContain('home-interior_413970226.webp');
    expect(SITE.defaultOgImage).toContain('home-interior_413970226.webp');
  });

  it('uses a source-driven Trustindex review widget without hard-coded aggregate claims', () => {
    const component = readFileSync(new URL('../src/components/TrustProof.astro', import.meta.url), 'utf8');
    const homepage = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');

    expect(SITE.reviews.provider).toBe('Trustindex');
    expect(SITE.reviews.trustindexWidgetId).toMatch(/^[a-f0-9]{24,64}$/);
    expect(new URL(SITE.reviews.googleProfileUrl).hostname).toBe('www.google.com');
    expect(new URL(SITE.reviews.trustindexSummaryUrl).hostname).toBe('www.trustindex.io');
    expect(component).toContain('https://cdn.trustindex.io/loader.js?');
    expect(component).toContain('data-trustindex-widget-id');
    expect(component).not.toMatch(/aggregateRating|reviewRating|ratingValue|reviewCount/);
    expect(homepage).toContain('<TrustProof />');
  });
});
