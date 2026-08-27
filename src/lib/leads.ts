export const LEAD_FORM_TYPES = ['rental_appraisal', 'switch_manager', 'general'] as const;
export type LeadFormType = (typeof LEAD_FORM_TYPES)[number];

export const LEAD_LIMITS = {
  name: 120,
  email: 180,
  phone: 40,
  address: 240,
  suburb: 120,
  short: 180,
  message: 3000,
  url: 700,
  turnstileToken: 2048,
  requestBytes: 64 * 1024,
} as const;

export interface LeadAttribution {
  landingPage: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
}

export interface LeadPayload {
  id: string;
  submittedAt: string;
  formType: LeadFormType;
  fullName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  suburb: string;
  currentManager: string;
  situation: string;
  timeframe: string;
  message: string;
  consent: boolean;
  attribution: LeadAttribution;
}

export function cleanText(value: FormDataEntryValue | null, max: number): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, max) : '';
}

export function normalizeFormType(value: FormDataEntryValue | null): LeadFormType {
  const candidate = cleanText(value, 80);
  return (LEAD_FORM_TYPES as readonly string[]).includes(candidate) ? (candidate as LeadFormType) : 'general';
}

export function emailLooksValid(value: string): boolean {
  return value.length <= LEAD_LIMITS.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function createLeadPayload(
  form: FormData,
  options: { id: string; submittedAt: string },
): LeadPayload {
  return {
    id: options.id,
    submittedAt: options.submittedAt,
    formType: normalizeFormType(form.get('form_type')),
    fullName: cleanText(form.get('full_name'), LEAD_LIMITS.name),
    email: cleanText(form.get('email'), LEAD_LIMITS.email).toLowerCase(),
    phone: cleanText(form.get('phone'), LEAD_LIMITS.phone),
    propertyAddress: cleanText(form.get('property_address'), LEAD_LIMITS.address),
    suburb: cleanText(form.get('suburb'), LEAD_LIMITS.suburb),
    currentManager: cleanText(form.get('current_manager'), LEAD_LIMITS.short),
    situation: cleanText(form.get('situation'), LEAD_LIMITS.short),
    timeframe: cleanText(form.get('timeframe'), LEAD_LIMITS.short),
    message: cleanText(form.get('message'), LEAD_LIMITS.message),
    consent: form.get('consent') === 'yes',
    attribution: {
      landingPage: cleanText(form.get('landing_page'), LEAD_LIMITS.url),
      referrer: cleanText(form.get('referrer'), LEAD_LIMITS.url),
      utmSource: cleanText(form.get('utm_source'), LEAD_LIMITS.short),
      utmMedium: cleanText(form.get('utm_medium'), LEAD_LIMITS.short),
      utmCampaign: cleanText(form.get('utm_campaign'), LEAD_LIMITS.short),
      utmContent: cleanText(form.get('utm_content'), LEAD_LIMITS.short),
      utmTerm: cleanText(form.get('utm_term'), LEAD_LIMITS.short),
    },
  };
}

export function validateLead(lead: LeadPayload): string[] {
  const errors: string[] = [];
  if (lead.fullName.length < 2) errors.push('full_name');
  if (!emailLooksValid(lead.email)) errors.push('email');
  if (lead.phone.length < 6) errors.push('phone');
  if (!lead.consent) errors.push('consent');

  if (
    (lead.formType === 'rental_appraisal' || lead.formType === 'switch_manager') &&
    !lead.propertyAddress &&
    !lead.suburb
  ) {
    errors.push('property_location');
  }

  return errors;
}

export function declaredBodyTooLarge(contentLength: string | null): boolean {
  if (!contentLength) return false;
  const bytes = Number.parseInt(contentLength, 10);
  return Number.isFinite(bytes) && bytes > LEAD_LIMITS.requestBytes;
}
