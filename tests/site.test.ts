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

  it('keeps the final homepage hero static-first while allowing deferred cinematic enhancement', () => {
    const source = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
    const heroStart = source.indexOf('<section class="sana-hero"');
    const heroEnd = source.indexOf('<section class="sana-pride"', heroStart);
    const heroSource = source.slice(heroStart, heroEnd);

    expect(heroStart).toBeGreaterThan(-1);
    expect(heroEnd).toBeGreaterThan(heroStart);
    expect(heroSource).toMatch(/<video\b/i);
    expect(heroSource).toContain('preload="none"');
    expect(heroSource).toContain('data-src="/media/melbourne-brighton-drone-pexels-38304339-540p.mp4"');
    expect(heroSource).toContain('data-src-low="/media/melbourne-brighton-drone-pexels-38304339-360p.mp4"');
    expect(source).toContain('prefers-reduced-motion: no-preference');
    expect(heroSource).toContain('Melbourne Property Management · For Rental Providers.');
    expect(heroSource).toContain('Is your property really being managed?');
    expect(heroSource).toContain('Property management with strategy, accountability and personal attention.');
    expect(heroSource).toContain('Your Property. My Priority.');
    expect(heroSource).toContain('Get a Rental Health Check');
    expect(heroSource).toContain('Change Property Manager');
    expect(heroSource).not.toContain('24×7 direct access');
    expect(heroSource).not.toContain('founder-concept-placeholder.svg');
    expect(heroSource).not.toContain('WhatsApp-Image-2025-09-30');
    expect(heroSource).not.toContain('Sana-headshot.webp');
  });

  it('preserves Sana original wordmark and final requested primary navigation', () => {
    const header = readFileSync(new URL('../src/components/SiteHeader.astro', import.meta.url), 'utf8');

    expect(header).toContain('src={SITE.logoAsset}');
    expect(SITE.logoAsset).toBe('/media/sana-patel-logo.webp');
    expect(header).toContain('alt="Sana Patel Real Estate"');
    expect(header).toContain('href="/"');
    expect(header).toContain('href="/about/"');
    expect(header).toContain('Property Management');
    expect(header).toContain('href="/switch-property-managers/"');
    expect(header).toContain('Resources');
    expect(header).toContain('href="/contact/"');
    expect(header).toContain('href="/property-management-visibility-check/"');
    expect(header).toContain('Get a Rental Health Check');
    expect(header).not.toContain('brand__monogram');
    expect(header).not.toContain('brand__wordmark');
  });

  it('keeps the final homepage focused on Sana three-part PRIDE brief', () => {
    const source = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');

    expect(source).toContain('bodyClass="home-final"');
    expect(source).toContain('id="pride"');
    expect(source).toContain('Proactive Property Care');
    expect(source).toContain('Responsive Communication');
    expect(source).toContain('Integrity in Every Decision');
    expect(source).toContain('Diligent Property Management');
    expect(source).toContain('Experience That Matters');
    expect(source).toContain('PRIDE is the standard I choose to bring to my work every day.');
    expect(source).toContain('What PRIDE means to me');
    expect(source).toContain('Different properties. Different situations. One consistent standard:');
    expect(source).toContain('id="reviews"');
    expect(source).toContain('<TrustProof />');
    expect(source).toContain('Ready to take a closer look at how your property is being managed?');
    expect(source).not.toContain('rebirth-diagnostic');
    expect(source).not.toContain('rebirth-services');
    expect(source).not.toContain('rebirth-switch');
    expect(source).not.toContain('rebirth-process');
    expect(source).not.toContain('rebirth-faq');
    expect(source).not.toContain('rebirth-appraisal');
    expect(source.match(/<video\b/gi)).toHaveLength(1);
  });

  it('uses a source-driven Trustindex review widget without hard-coded aggregate claims', () => {
    const component = readFileSync(new URL('../src/components/TrustProof.astro', import.meta.url), 'utf8');
    const homepage = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');

    expect(SITE.reviews.provider).toBe('Trustindex');
    expect(SITE.reviews.trustindexWidgetId).toMatch(/^[a-f0-9]{24,64}$/);
    expect(new URL(SITE.reviews.googleProfileUrl).hostname).toBe('www.google.com');
    expect(new URL(SITE.reviews.trustindexSummaryUrl).hostname).toBe('www.trustindex.io');
    expect(component).toContain('Trusted by rental providers &amp; renters');
    expect(component).toContain('Real experiences. Real service.');
    expect(component).toContain('https://cdn.trustindex.io/loader.js?');
    expect(component).toContain('data-trustindex-widget-id');
    expect(component).not.toMatch(/aggregateRating|reviewRating|ratingValue|reviewCount/);
    expect(homepage).toContain('<TrustProof />');
  });
});
