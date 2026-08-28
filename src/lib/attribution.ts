import { LEAD_LIMITS, sanitizeAttributionUrl, type LeadAttribution } from './leads';

export const ATTRIBUTION_STORAGE_KEY = 'sp:lead-attribution:v1';

export interface SessionStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function cleanCampaignValue(value: string | null): string {
  return value?.trim().replace(/\s+/g, ' ').slice(0, LEAD_LIMITS.short) ?? '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseStoredAttribution(raw: string | null): LeadAttribution | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;

    const fields = ['landingPage', 'referrer', 'utmSource', 'utmMedium', 'utmCampaign', 'utmContent', 'utmTerm'] as const;
    if (fields.some((field) => typeof parsed[field] !== 'string')) return null;

    return {
      landingPage: sanitizeAttributionUrl(parsed.landingPage as string),
      referrer: sanitizeAttributionUrl(parsed.referrer as string),
      utmSource: cleanCampaignValue(parsed.utmSource as string),
      utmMedium: cleanCampaignValue(parsed.utmMedium as string),
      utmCampaign: cleanCampaignValue(parsed.utmCampaign as string),
      utmContent: cleanCampaignValue(parsed.utmContent as string),
      utmTerm: cleanCampaignValue(parsed.utmTerm as string),
    };
  } catch {
    return null;
  }
}

export function attributionFromVisit(locationUrl: string, referrer: string): LeadAttribution {
  let current: URL;
  try {
    current = new URL(locationUrl);
  } catch {
    return {
      landingPage: '',
      referrer: '',
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
      utmContent: '',
      utmTerm: '',
    };
  }

  return {
    landingPage: sanitizeAttributionUrl(current.toString()),
    referrer: sanitizeAttributionUrl(referrer),
    utmSource: cleanCampaignValue(current.searchParams.get('utm_source')),
    utmMedium: cleanCampaignValue(current.searchParams.get('utm_medium')),
    utmCampaign: cleanCampaignValue(current.searchParams.get('utm_campaign')),
    utmContent: cleanCampaignValue(current.searchParams.get('utm_content')),
    utmTerm: cleanCampaignValue(current.searchParams.get('utm_term')),
  };
}

export function captureSessionAttribution(
  storage: SessionStorageLike,
  locationUrl: string,
  referrer: string,
): LeadAttribution {
  const existing = parseStoredAttribution(safeGet(storage));
  if (existing) return existing;

  const current = attributionFromVisit(locationUrl, referrer);
  try {
    storage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Storage can be unavailable in hardened/private contexts. Attribution is
    // optional and must never block the lead journey.
  }
  return current;
}

export function readSessionAttribution(
  storage: SessionStorageLike,
  locationUrl: string,
  referrer: string,
): LeadAttribution {
  return parseStoredAttribution(safeGet(storage)) ?? attributionFromVisit(locationUrl, referrer);
}

function safeGet(storage: SessionStorageLike): string | null {
  try {
    return storage.getItem(ATTRIBUTION_STORAGE_KEY);
  } catch {
    return null;
  }
}
