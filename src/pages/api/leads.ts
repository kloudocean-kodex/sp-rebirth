import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { acceptLeadForDelivery, type LeadDeliveryBindings } from '@/lib/lead-delivery';
import {
  LEAD_LIMITS,
  cleanText,
  createLeadPayload,
  declaredBodyTooLarge,
  normalizeFormType,
  validateLead,
  type LeadFormType,
} from '@/lib/leads';

export const prerender = false;

interface TurnstileResult {
  success?: boolean;
  hostname?: string;
  action?: string;
  challenge_ts?: string;
  ['error-codes']?: string[];
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

function delivered(request: Request, formType: LeadFormType, leadId?: string) {
  if (request.headers.get('x-sp-rebirth-fetch') === '1') {
    return json({ ok: true, leadId }, leadId ? 201 : 202);
  }

  const destination = new URL('/thank-you/', request.url);
  destination.searchParams.set('type', formType);
  return new Response(null, {
    status: 303,
    headers: {
      location: destination.toString(),
      'cache-control': 'no-store',
    },
  });
}

async function verifyTurnstile(
  token: string,
  ip: string | null,
  expectedHostname: string,
  expectedAction: LeadFormType,
) {
  const secret = env.TURNSTILE_SECRET_KEY;
  if (!secret) return { success: false, reason: 'turnstile_not_configured' } as const;

  const payload = new FormData();
  payload.set('secret', secret);
  payload.set('response', token);
  if (ip) payload.set('remoteip', ip);

  let response: Response;
  try {
    response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: payload,
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return { success: false, reason: 'turnstile_upstream_error' } as const;
  }

  if (!response.ok) return { success: false, reason: 'turnstile_upstream_error' } as const;

  let result: TurnstileResult;
  try {
    result = (await response.json()) as TurnstileResult;
  } catch {
    return { success: false, reason: 'turnstile_upstream_error' } as const;
  }

  if (result.success !== true) return { success: false, reason: 'turnstile_rejected' } as const;
  if (!result.hostname || result.hostname.toLowerCase() !== expectedHostname.toLowerCase()) {
    return { success: false, reason: 'turnstile_hostname_mismatch' } as const;
  }
  if (result.action !== expectedAction) {
    return { success: false, reason: 'turnstile_action_mismatch' } as const;
  }

  return { success: true } as const;
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

  if (declaredBodyTooLarge(request.headers.get('content-length'))) {
    return json({ ok: false, error: 'request_too_large' }, 413);
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/x-www-form-urlencoded') && !contentType.includes('multipart/form-data')) {
    return json({ ok: false, error: 'unsupported_content_type' }, 415);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: 'invalid_form_data' }, 400);
  }

  const formType = normalizeFormType(form.get('form_type'));

  // Honeypot: genuine visitors never fill this field. Return a success-like response without forwarding data.
  if (cleanText(form.get('company_website'), 200)) return delivered(request, formType);

  const lead = createLeadPayload(form, {
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
  });

  const errors = validateLead(lead);
  if (errors.length) return json({ ok: false, error: 'validation_failed', fields: errors }, 400);

  const rawTurnstileToken = form.get('cf-turnstile-response');
  const turnstileToken = typeof rawTurnstileToken === 'string' ? rawTurnstileToken.trim() : '';
  if (!turnstileToken) return json({ ok: false, error: 'verification_required' }, 400);
  if (turnstileToken.length > LEAD_LIMITS.turnstileToken) {
    return json({ ok: false, error: 'verification_invalid' }, 400);
  }

  const turnstile = await verifyTurnstile(
    turnstileToken,
    request.headers.get('cf-connecting-ip'),
    requestUrl.hostname,
    lead.formType,
  );
  if (!turnstile.success) return json({ ok: false, error: 'verification_failed' }, 403);

  const delivery = await acceptLeadForDelivery(lead, env as LeadDeliveryBindings, {
    deployEnv: import.meta.env.PUBLIC_DEPLOY_ENV,
  });

  if (!delivery.ok) {
    const configurationFailure =
      delivery.error === 'lead_queue_not_configured' ||
      delivery.error === 'lead_delivery_not_configured' ||
      delivery.error === 'lead_delivery_invalid';

    // Keep transport details server-side. The public contract is simply that the
    // website will not claim success unless a configured durable destination accepted the lead.
    return json(
      { ok: false, error: configurationFailure ? 'lead_delivery_not_configured' : 'lead_delivery_failed' },
      configurationFailure ? 503 : 502,
    );
  }

  return delivered(request, lead.formType, lead.id);
};

export const ALL: APIRoute = async () => json({ ok: false, error: 'method_not_allowed' }, 405);
