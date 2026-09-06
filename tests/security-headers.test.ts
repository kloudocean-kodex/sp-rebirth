import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { applyDeploymentIndexingHeaders, HTML_SECURITY_HEADERS } from '../src/config/http-security';

const staticHeaders = readFileSync(join(process.cwd(), 'public/_headers'), 'utf8');

describe('HTML security header contract', () => {
  it('keeps the static asset policy aligned with the on-demand HTML policy', () => {
    for (const [name, value] of Object.entries(HTML_SECURITY_HEADERS)) {
      expect(staticHeaders).toContain(`${name}: ${value}`);
    }
  });

  it('permits only the exact Trustindex widget delivery hosts currently required', () => {
    const policy = HTML_SECURITY_HEADERS['Content-Security-Policy'];

    expect(policy).toContain('upgrade-insecure-requests');
    expect(policy).toContain('script-src');
    expect(policy).toContain('connect-src');
    expect(policy).toContain('https://cdn.trustindex.io');
    expect(policy).toContain('https://lh3.googleusercontent.com');
    expect(policy).toContain('https://fonts.googleapis.com');
    expect(policy).not.toContain('https://*.trustindex.io');
  });

  it('adds noindex only for the isolated staging runtime', () => {
    const stagingHeaders = new Headers();
    applyDeploymentIndexingHeaders(stagingHeaders, 'staging');
    expect(stagingHeaders.get('X-Robots-Tag')).toBe('noindex, nofollow');

    const productionHeaders = new Headers();
    applyDeploymentIndexingHeaders(productionHeaders, 'production');
    expect(productionHeaders.has('X-Robots-Tag')).toBe(false);

    const unknownHeaders = new Headers();
    applyDeploymentIndexingHeaders(unknownHeaders);
    expect(unknownHeaders.has('X-Robots-Tag')).toBe(false);
  });
});
