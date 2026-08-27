import type { LeadPayload } from '@/lib/leads';

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

export function resolveLeadDeliveryMode(
  bindings: LeadDeliveryBindings,
  deployEnv = 'staging',
): LeadDeliveryMode {
  // Production is intentionally queue-only. A forgotten runtime variable must not
  // silently downgrade the 24×7 durability contract back to a synchronous webhook.
  if (deployEnv === 'production') return 'queue';

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

export function isLeadPayload(value: unknown): value is LeadPayload {
  if (!value || typeof value !== 'object') return false;

  const lead = value as Partial<LeadPayload>;
  return (
    typeof lead.id === 'string' &&
    lead.id.length > 0 &&
    typeof lead.submittedAt === 'string' &&
    lead.submittedAt.length > 0 &&
    (lead.formType === 'rental_appraisal' || lead.formType === 'switch_manager' || lead.formType === 'general') &&
    typeof lead.fullName === 'string' &&
    typeof lead.email === 'string' &&
    typeof lead.phone === 'string' &&
    typeof lead.propertyAddress === 'string' &&
    typeof lead.suburb === 'string' &&
    typeof lead.currentManager === 'string' &&
    typeof lead.situation === 'string' &&
    typeof lead.timeframe === 'string' &&
    typeof lead.message === 'string' &&
    typeof lead.privacyNoticeVersion === 'string' &&
    !!lead.attribution &&
    typeof lead.attribution === 'object' &&
    typeof lead.attribution.landingPage === 'string' &&
    typeof lead.attribution.referrer === 'string' &&
    typeof lead.attribution.utmSource === 'string' &&
    typeof lead.attribution.utmMedium === 'string' &&
    typeof lead.attribution.utmCampaign === 'string' &&
    typeof lead.attribution.utmContent === 'string' &&
    typeof lead.attribution.utmTerm === 'string'
  );
}
