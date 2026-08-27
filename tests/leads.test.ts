import { describe, expect, it } from 'vitest';
import {
  LEAD_LIMITS,
  cleanText,
  createLeadPayload,
  declaredBodyTooLarge,
  normalizeFormType,
  readFormDataWithinLimit,
  requestOriginAllowed,
  supportedLeadContentType,
  validateLead,
} from '../src/lib/leads';

function validForm(type = 'general') {
  const form = new FormData();
  form.set('form_type', type);
  form.set('full_name', '  Sana   Example  ');
  form.set('email', 'SANA@example.com');
  form.set('phone', '0416 977 990');
  form.set('privacy_notice_version', '2026-08-27');
  return form;
}

describe('lead normalization', () => {
  it('collapses whitespace and respects max length', () => {
    expect(cleanText('  A   B  ', 10)).toBe('A B');
    expect(cleanText('123456', 4)).toBe('1234');
  });

  it('allows only known form types', () => {
    expect(normalizeFormType('rental_appraisal')).toBe('rental_appraisal');
    expect(normalizeFormType('switch_manager')).toBe('switch_manager');
    expect(normalizeFormType('anything_else')).toBe('general');
  });

  it('normalizes email casing and text before delivery', () => {
    const lead = createLeadPayload(validForm(), {
      id: 'lead-1',
      submittedAt: '2026-08-27T00:00:00.000Z',
    });
    expect(lead.fullName).toBe('Sana Example');
    expect(lead.email).toBe('sana@example.com');
    expect(lead.privacyNoticeVersion).toBe('2026-08-27');
  });
});

describe('lead validation', () => {
  it('accepts a valid general enquiry without a property location', () => {
    const lead = createLeadPayload(validForm(), {
      id: 'lead-1',
      submittedAt: '2026-08-27T00:00:00.000Z',
    });
    expect(validateLead(lead)).toEqual([]);
  });

  it('requires a property location for appraisal and switching journeys', () => {
    for (const type of ['rental_appraisal', 'switch_manager']) {
      const lead = createLeadPayload(validForm(type), {
        id: 'lead-1',
        submittedAt: '2026-08-27T00:00:00.000Z',
      });
      expect(validateLead(lead)).toContain('property_location');
    }
  });

  it('accepts suburb alone as sufficient initial property context', () => {
    const form = validForm('rental_appraisal');
    form.set('suburb', 'Port Melbourne');
    const lead = createLeadPayload(form, {
      id: 'lead-1',
      submittedAt: '2026-08-27T00:00:00.000Z',
    });
    expect(validateLead(lead)).not.toContain('property_location');
  });

  it('rejects malformed contact data and a missing collection-notice version', () => {
    const form = validForm();
    form.set('full_name', 'A');
    form.set('email', 'not-an-email');
    form.set('phone', '12');
    form.delete('privacy_notice_version');
    const errors = validateLead(
      createLeadPayload(form, { id: 'lead-1', submittedAt: '2026-08-27T00:00:00.000Z' }),
    );
    expect(errors).toEqual(
      expect.arrayContaining(['full_name', 'email', 'phone', 'privacy_notice_version']),
    );
  });
});

describe('request boundary', () => {
  it('requires an exact same origin when the Origin header is present', () => {
    const requestUrl = new URL('https://staging.example.test/api/leads');

    expect(requestOriginAllowed('https://staging.example.test', requestUrl)).toBe(true);
    expect(requestOriginAllowed(null, requestUrl)).toBe(true);
    expect(requestOriginAllowed('http://staging.example.test', requestUrl)).toBe(false);
    expect(requestOriginAllowed('https://staging.example.test:8443', requestUrl)).toBe(false);
    expect(requestOriginAllowed('https://other.example.test', requestUrl)).toBe(false);
    expect(requestOriginAllowed('not a url', requestUrl)).toBe(false);
  });

  it('accepts only the supported form media types, including normal parameters', () => {
    expect(supportedLeadContentType('application/x-www-form-urlencoded')).toBe(true);
    expect(supportedLeadContentType('application/x-www-form-urlencoded; charset=UTF-8')).toBe(true);
    expect(supportedLeadContentType('multipart/form-data; boundary=synthetic')).toBe(true);
    expect(supportedLeadContentType('text/application/x-www-form-urlencoded')).toBe(false);
    expect(supportedLeadContentType('application/x-www-form-urlencoded.evil')).toBe(false);
    expect(supportedLeadContentType('application/json')).toBe(false);
    expect(supportedLeadContentType(null)).toBe(false);
  });
});

describe('request limits', () => {
  it('rejects declared bodies over the lead endpoint limit', () => {
    expect(declaredBodyTooLarge(String(LEAD_LIMITS.requestBytes + 1))).toBe(true);
    expect(declaredBodyTooLarge(String(LEAD_LIMITS.requestBytes))).toBe(false);
    expect(declaredBodyTooLarge(null)).toBe(false);
  });

  it('parses a bounded form body without relying on Content-Length', async () => {
    const request = new Request('https://staging.example.test/api/leads', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        full_name: 'Synthetic Test',
        email: 'synthetic@example.test',
      }).toString(),
    });

    expect(request.headers.get('content-length')).toBeNull();
    const result = await readFormDataWithinLimit(request, 1024);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected bounded form parsing to succeed');
    expect(result.form.get('full_name')).toBe('Synthetic Test');
    expect(result.form.get('email')).toBe('synthetic@example.test');
  });

  it('rejects the actual streamed body once it exceeds the limit even without Content-Length', async () => {
    const request = new Request('https://staging.example.test/api/leads', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ message: 'x'.repeat(256) }).toString(),
    });

    expect(request.headers.get('content-length')).toBeNull();
    await expect(readFormDataWithinLimit(request, 64)).resolves.toEqual({
      ok: false,
      error: 'request_too_large',
    });
  });
});
