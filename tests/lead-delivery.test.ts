import { describe, expect, it, vi } from 'vitest';
import {
  acceptLeadForDelivery,
  deliverLeadToWebhook,
  isLeadPayload,
  queueRetryDelaySeconds,
  resolveLeadDeliveryMode,
  type LeadQueueBinding,
} from '../src/lib/lead-delivery';
import type { LeadPayload } from '../src/lib/leads';

function lead(): LeadPayload {
  return {
    id: 'lead-123',
    submittedAt: '2026-08-27T00:00:00.000Z',
    formType: 'rental_appraisal',
    fullName: 'Test Rental Provider',
    email: 'test@example.com',
    phone: '0416 000 000',
    propertyAddress: '1 Test Street',
    suburb: 'Port Melbourne',
    currentManager: '',
    situation: 'Currently vacant',
    timeframe: 'Within 30 days',
    message: 'Synthetic test lead',
    privacyNoticeVersion: '2026-08-27',
    attribution: {
      landingPage: 'https://staging.example/rental-appraisal/',
      referrer: '',
      utmSource: 'release-test',
      utmMedium: 'synthetic',
      utmCampaign: 'staging-proof',
      utmContent: '',
      utmTerm: '',
    },
  };
}

describe('lead delivery mode', () => {
  it('uses webhook by default outside production', () => {
    expect(resolveLeadDeliveryMode({}, 'staging')).toBe('webhook');
  });

  it('allows staging to opt into Queue delivery', () => {
    expect(resolveLeadDeliveryMode({ LEAD_DELIVERY_MODE: 'queue' }, 'staging')).toBe('queue');
  });

  it('forces Queue delivery in production even if webhook is requested', () => {
    expect(resolveLeadDeliveryMode({ LEAD_DELIVERY_MODE: 'webhook' }, 'production')).toBe('queue');
  });
});

describe('Queue acceptance', () => {
  it('returns success only after the Queue binding accepts the lead', async () => {
    const send = vi.fn(async () => undefined);
    const queue: LeadQueueBinding = { send };

    const result = await acceptLeadForDelivery(
      lead(),
      { LEAD_DELIVERY_MODE: 'queue', LEAD_QUEUE: queue },
      { deployEnv: 'staging' },
    );

    expect(result).toEqual({ ok: true, transport: 'queue' });
    expect(send).toHaveBeenCalledOnce();
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ id: 'lead-123' }), { contentType: 'json' });
  });

  it('fails closed when production has no Queue binding', async () => {
    const result = await acceptLeadForDelivery(
      lead(),
      {
        LEAD_DELIVERY_MODE: 'webhook',
        LEAD_DELIVERY_WEBHOOK_URL: 'https://example.com/legacy',
        LEAD_DELIVERY_TOKEN: 'legacy-token',
      },
      { deployEnv: 'production' },
    );

    expect(result).toEqual({ ok: false, transport: 'queue', error: 'lead_queue_not_configured' });
  });

  it('does not report success when Queue acceptance throws', async () => {
    const queue: LeadQueueBinding = {
      send: vi.fn(async () => {
        throw new Error('queue unavailable');
      }),
    };

    await expect(
      acceptLeadForDelivery(lead(), { LEAD_DELIVERY_MODE: 'queue', LEAD_QUEUE: queue }, { deployEnv: 'staging' }),
    ).resolves.toEqual({ ok: false, transport: 'queue', error: 'lead_queue_failed' });
  });
});

describe('webhook consumer transport', () => {
  it('uses HTTPS, bearer authentication and the stable lead id as idempotency key', async () => {
    const fetcher = vi.fn(async () => new Response(null, { status: 204 }));

    const result = await deliverLeadToWebhook(
      lead(),
      {
        LEAD_DELIVERY_WEBHOOK_URL: 'https://crm.example.test/intake',
        LEAD_DELIVERY_TOKEN: 'secret-token',
      },
      fetcher as typeof fetch,
    );

    expect(result).toEqual({ ok: true, transport: 'webhook' });
    expect(fetcher).toHaveBeenCalledOnce();

    const [destination, init] = fetcher.mock.calls[0];
    expect(destination.toString()).toBe('https://crm.example.test/intake');
    expect(init?.method).toBe('POST');
    expect(init?.headers).toMatchObject({
      authorization: 'Bearer secret-token',
      'content-type': 'application/json',
      'idempotency-key': 'lead-123',
    });
  });

  it('rejects insecure webhook destinations before making a network call', async () => {
    const fetcher = vi.fn(async () => new Response(null, { status: 204 }));

    const result = await deliverLeadToWebhook(
      lead(),
      {
        LEAD_DELIVERY_WEBHOOK_URL: 'http://crm.example.test/intake',
        LEAD_DELIVERY_TOKEN: 'secret-token',
      },
      fetcher as typeof fetch,
    );

    expect(result).toEqual({ ok: false, transport: 'webhook', error: 'lead_delivery_invalid' });
    expect(fetcher).not.toHaveBeenCalled();
  });
});

describe('Queue safety helpers', () => {
  it('uses bounded exponential retry delays', () => {
    expect(queueRetryDelaySeconds(1)).toBe(15);
    expect(queueRetryDelaySeconds(2)).toBe(30);
    expect(queueRetryDelaySeconds(5)).toBe(240);
    expect(queueRetryDelaySeconds(20)).toBe(900);
  });

  it('accepts the canonical lead envelope and rejects malformed messages', () => {
    expect(isLeadPayload(lead())).toBe(true);
    expect(isLeadPayload({ id: 'lead-123' })).toBe(false);
    expect(isLeadPayload(null)).toBe(false);
  });
});
