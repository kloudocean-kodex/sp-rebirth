import { LEAD_LIMITS, emailLooksValid, type LeadPayload } from './leads';

export type LeadDeliveryMode = 'queue' | 'webhook';

export interface LeadQueueBinding {
  send(body: LeadPayload, options?: { contentType?: 'json'; delaySeconds?: number }): Promise<unknown>;
}

export interface LeadDeliveryBindings {
  LEAD_DELIVERY_MODE?: string;
  LEAD_QUEUE?: LeadQueueBinding;
  LEAD_DELIVERY_WEBHOOK_URL?: string;
  LEAD_DELIVERY_TOKEN?: string;
}

export interface LeadDeliveryContext {
  deployEnv?: string;
  fetcher?: typeof fetch;
}

export type LeadDeliveryResult =
  | { ok: true; transport: LeadDeliveryMode }
  | {
      ok: false;
      transport: LeadDeliveryMode;
      error:
        | 'lead_queue_not_configured'
        | 'lead_queue_failed'
        | 'lead_delivery_not_configured'
        | 'lead_delivery_invalid'
        | 'lead_delivery_failed';
    };

export function resolveLeadDeliveryMode(bindings: LeadDeliveryBindings, deployEnv?: string): LeadDeliveryMode {
  const normalizedDeployEnv = deployEnv?.trim().toLowerCase();

  // Synchronous webhook delivery is an explicit staging-only integration mode.
  // Missing or unrecognised deployment identity fails closed to Queue so a
  // production build cannot silently weaken durability because the public
  // deployment marker was forgotten or misspelled.
  if (normalizedDeployEnv !== 'staging') return 'queue';

  return bindings.LEAD_DELIVERY_MODE?.trim().toLowerCase() === 'queue' ? 'queue' : 'webhook';
}

export async function deliverLeadToWebhook(
  lead: LeadPayload,
  bindings: Pick<LeadDeliveryBindings, 'LEAD_DELIVERY_WEBHOOK_URL' | 'LEAD_DELIVERY_TOKEN'>,
  fetcher: typeof fetch = fetch,
): Promise<LeadDeliveryResult> {
  const webhookUrl = bindings.LEAD_DELIVERY_WEBHOOK_URL;
  const webhookToken = bindings.LEAD_DELIVERY_TOKEN;

  if (!webhookUrl || !webhookToken) {
    return { ok: false, transport: 'webhook', error: 'lead_delivery_not_configured' };
  }

  let destination: URL;
  try {
    destination = new URL(webhookUrl);
    if (destination.protocol !== 'https:') throw new Error('HTTPS required');
  } catch {
    return { ok: false, transport: 'webhook', error: 'lead_delivery_invalid' };
  }

  let delivery: Response;
  try {
    delivery = await fetcher(destination, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${webhookToken}`,
        'content-type': 'application/json',
        'user-agent': 'SP_REBIRTH/1.0',
        'idempotency-key': lead.id,
      },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return { ok: false, transport: 'webhook', error: 'lead_delivery_failed' };
  }

  if (!delivery.ok) return { ok: false, transport: 'webhook', error: 'lead_delivery_failed' };
  return { ok: true, transport: 'webhook' };
}

export async function acceptLeadForDelivery(
  lead: LeadPayload,
  bindings: LeadDeliveryBindings,
  context: LeadDeliveryContext = {},
): Promise<LeadDeliveryResult> {
  const mode = resolveLeadDeliveryMode(bindings, context.deployEnv);

  if (mode === 'queue') {
    if (!bindings.LEAD_QUEUE) {
      return { ok: false, transport: 'queue', error: 'lead_queue_not_configured' };
    }

    try {
      await bindings.LEAD_QUEUE.send(lead, { contentType: 'json' });
      return { ok: true, transport: 'queue' };
    } catch {
      return { ok: false, transport: 'queue', error: 'lead_queue_failed' };
    }
  }

  return deliverLeadToWebhook(lead, bindings, context.fetcher);
}

export function queueRetryDelaySeconds(attempts: number): number {
  const safeAttempts = Number.isFinite(attempts) ? Math.max(1, Math.floor(attempts)) : 1;
  return Math.min(15 * 2 ** (safeAttempts - 1), 15 * 60);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringWithin(value: unknown, minLength: number, maxLength: number): value is string {
  return typeof value === 'string' && value.length >= minLength && value.length <= maxLength;
}

export function isLeadPayload(value: unknown): value is LeadPayload {
  if (!isRecord(value)) return false;

  const formType = value.formType;
  if (formType !== 'rental_appraisal' && formType !== 'switch_manager' && formType !== 'general') {
    return false;
  }

  if (!stringWithin(value.id, 1, 128)) return false;
  if (!stringWithin(value.submittedAt, 1, 64) || Number.isNaN(Date.parse(value.submittedAt))) return false;
  if (!stringWithin(value.fullName, 2, LEAD_LIMITS.name)) return false;
  if (!stringWithin(value.email, 1, LEAD_LIMITS.email) || !emailLooksValid(value.email)) return false;
  if (!stringWithin(value.phone, 6, LEAD_LIMITS.phone)) return false;
  if (!stringWithin(value.propertyAddress, 0, LEAD_LIMITS.address)) return false;
  if (!stringWithin(value.suburb, 0, LEAD_LIMITS.suburb)) return false;
  if (!stringWithin(value.currentManager, 0, LEAD_LIMITS.short)) return false;
  if (!stringWithin(value.situation, 0, LEAD_LIMITS.short)) return false;
  if (!stringWithin(value.timeframe, 0, LEAD_LIMITS.short)) return false;
  if (!stringWithin(value.message, 0, LEAD_LIMITS.message)) return false;
  if (!stringWithin(value.privacyNoticeVersion, 1, LEAD_LIMITS.noticeVersion)) return false;

  if ((formType === 'rental_appraisal' || formType === 'switch_manager') && !value.propertyAddress && !value.suburb) {
    return false;
  }

  const attribution = value.attribution;
  if (!isRecord(attribution)) return false;
  if (!stringWithin(attribution.landingPage, 0, LEAD_LIMITS.url)) return false;
  if (!stringWithin(attribution.referrer, 0, LEAD_LIMITS.url)) return false;
  if (!stringWithin(attribution.utmSource, 0, LEAD_LIMITS.short)) return false;
  if (!stringWithin(attribution.utmMedium, 0, LEAD_LIMITS.short)) return false;
  if (!stringWithin(attribution.utmCampaign, 0, LEAD_LIMITS.short)) return false;
  if (!stringWithin(attribution.utmContent, 0, LEAD_LIMITS.short)) return false;
  if (!stringWithin(attribution.utmTerm, 0, LEAD_LIMITS.short)) return false;

  return true;
}
