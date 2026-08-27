import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

const MAX = {
  name: 120,
  email: 180,
  phone: 40,
  address: 240,
  suburb: 120,
  short: 180,
  message: 3000,
  url: 700,
};

function clean(value: FormDataEntryValue | null, max: number) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, max) : '';
}

function emailLooksValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= MAX.email;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}

async function verifyTurnstile(token: string, ip: string | null) {
  const secret = env.TURNSTILE_SECRET_KEY;
  if (!secret) return { success: false, reason: 'turnstile_not_configured' };

  const payload = new FormData();
  payload.set('secret', secret);
  payload.set('response', token);
  if (ip) payload.set('remoteip', ip);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: payload,
  });

  if (!response.ok) return { success: false, reason: 'turnstile_upstream_error' };
  const result = (await response.json()) as { success?: boolean; ['error-codes']?: string[] };
  return {
    success: result.success === true,
    reason: result.success === true ? undefined : 'turnstile_rejected',
  };
}

export const POST: APIRoute = async ({ request }) => {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get('origin');

  if (origin) {
    try {
      if (new URL(origin).host !== requestUrl.host) return json({ ok: false, error: 'origin_rejected' }, 403);
    } catch {
      return json({ ok: false, error: 'origin_rejected' }, 403);
    }
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/x-www-form-urlencoded') && !contentType.includes('multipart/form-data')) {
    return json({ ok: false, error: 'unsupported_content_type' }, 415);
  }

  const form = await request.formData();

  // Honeypot: genuine visitors never fill this field.
  if (clean(form.get('company_website'), 200)) return json({ ok: true }, 202);

  const lead = {
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    formType: clean(form.get('form_type'), 80) || 'general',
    fullName: clean(form.get('full_name'), MAX.name),
    email: clean(form.get('email'), MAX.email).toLowerCase(),
    phone: clean(form.get('phone'), MAX.phone),
    propertyAddress: clean(form.get('property_address'), MAX.address),
    suburb: clean(form.get('suburb'), MAX.suburb),
    currentManager: clean(form.get('current_manager'), MAX.short),
    situation: clean(form.get('situation'), MAX.short),
    timeframe: clean(form.get('timeframe'), MAX.short),
    message: clean(form.get('message'), MAX.message),
    consent: form.get('consent') === 'yes',
    attribution: {
      landingPage: clean(form.get('landing_page'), MAX.url),
      referrer: clean(form.get('referrer'), MAX.url),
      utmSource: clean(form.get('utm_source'), MAX.short),
      utmMedium: clean(form.get('utm_medium'), MAX.short),
      utmCampaign: clean(form.get('utm_campaign'), MAX.short),
      utmContent: clean(form.get('utm_content'), MAX.short),
      utmTerm: clean(form.get('utm_term'), MAX.short),
    },
  };

  const errors: string[] = [];
  if (lead.fullName.length < 2) errors.push('full_name');
  if (!emailLooksValid(lead.email)) errors.push('email');
  if (lead.phone.length < 6) errors.push('phone');
  if (!lead.consent) errors.push('consent');
  if (['rental_appraisal', 'switch_manager'].includes(lead.formType) && !lead.propertyAddress && !lead.suburb) {
    errors.push('property_location');
  }

  if (errors.length) return json({ ok: false, error: 'validation_failed', fields: errors }, 400);

  const turnstileToken = clean(form.get('cf-turnstile-response'), 4096);
  if (!turnstileToken) return json({ ok: false, error: 'verification_required' }, 400);

  const cfIp = request.headers.get('cf-connecting-ip');
  const turnstile = await verifyTurnstile(turnstileToken, cfIp);
  if (!turnstile.success) return json({ ok: false, error: turnstile.reason }, 403);

  const webhookUrl = env.LEAD_DELIVERY_WEBHOOK_URL;
  const webhookToken = env.LEAD_DELIVERY_TOKEN;
  if (!webhookUrl || !webhookToken) {
    // Deliberately fail closed. A successful UX must never be shown when there is no durable lead destination.
    return json({ ok: false, error: 'lead_delivery_not_configured' }, 503);
  }

  let destination: URL;
  try {
    destination = new URL(webhookUrl);
    if (destination.protocol !== 'https:') throw new Error('HTTPS required');
  } catch {
    return json({ ok: false, error: 'lead_delivery_invalid' }, 503);
  }

  const delivery = await fetch(destination, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${webhookToken}`,
      'content-type': 'application/json',
      'user-agent': 'SP_REBIRTH/1.0',
    },
    body: JSON.stringify(lead),
  });

  if (!delivery.ok) return json({ ok: false, error: 'lead_delivery_failed' }, 502);

  return json({ ok: true, leadId: lead.id }, 201);
};

export const ALL: APIRoute = async () => json({ ok: false, error: 'method_not_allowed' }, 405);
