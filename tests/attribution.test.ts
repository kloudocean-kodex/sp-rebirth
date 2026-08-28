import { describe, expect, it } from 'vitest';
import {
  ATTRIBUTION_STORAGE_KEY,
  attributionFromVisit,
  captureSessionAttribution,
  readSessionAttribution,
  type SessionStorageLike,
} from '../src/lib/attribution';

class MemoryStorage implements SessionStorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe('lead attribution', () => {
  it('keeps campaign fields while stripping query strings, credentials and fragments from URLs', () => {
    const attribution = attributionFromVisit(
      'https://example.test/start/?utm_source=Google&utm_medium=cpc&utm_campaign=Spring&email=private%40example.test#offer',
      'https://referrer.example/path/?customer=private#section',
    );

    expect(attribution).toEqual({
      landingPage: 'https://example.test/start/',
      referrer: 'https://referrer.example/path/',
      utmSource: 'Google',
      utmMedium: 'cpc',
      utmCampaign: 'Spring',
      utmContent: '',
      utmTerm: '',
    });
  });

  it('preserves first-touch attribution for the browser session', () => {
    const storage = new MemoryStorage();

    const first = captureSessionAttribution(
      storage,
      'https://example.test/?utm_source=google&utm_campaign=first',
      'https://search.example/results?q=private',
    );
    const later = captureSessionAttribution(
      storage,
      'https://example.test/contact/?utm_source=other&utm_campaign=later',
      'https://example.test/',
    );

    expect(later).toEqual(first);
    expect(readSessionAttribution(storage, 'https://example.test/contact/', '')).toEqual(first);
  });

  it('ignores malformed stored data and falls back to the current visit', () => {
    const storage = new MemoryStorage();
    storage.setItem(ATTRIBUTION_STORAGE_KEY, '{not-json');

    expect(readSessionAttribution(storage, 'https://example.test/contact/?utm_source=direct', '')).toMatchObject({
      landingPage: 'https://example.test/contact/',
      utmSource: 'direct',
    });
  });
});
