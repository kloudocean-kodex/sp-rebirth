import { describe, expect, it } from 'vitest';
import { removeUpgradeInsecureRequests } from '../scripts/browser-test-server.mjs';

describe('browser QA server', () => {
  it('removes only the HTTPS-upgrade directive from the local HTTP response', () => {
    const productionPolicy =
      "default-src 'self'; img-src 'self' data:; upgrade-insecure-requests; frame-ancestors 'none'";

    expect(removeUpgradeInsecureRequests(productionPolicy)).toBe(
      "default-src 'self'; img-src 'self' data:; frame-ancestors 'none'",
    );
  });

  it('handles directive casing without weakening the remaining policy', () => {
    const productionPolicy = "base-uri 'self'; UPGRADE-INSECURE-REQUESTS; object-src 'none'";

    expect(removeUpgradeInsecureRequests(productionPolicy)).toBe("base-uri 'self'; object-src 'none'");
  });
});
