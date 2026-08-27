import { describe, expect, it, vi } from 'vitest';
import { consumeLeadQueueMessage, type QueueMessageLike } from '../src/lib/lead-queue-consumer';
import { LEAD_LIMITS, type LeadPayload } from '../src/lib/leads';

function lead(): LeadPayload {
  return {
    id: 'lead-queue-1',
    submittedAt: '2026-08-27T00:00:00.000Z',
    formType: 'switch_manager',
    fullName: 'Synthetic Owner',
    email: 'owner@example.com',
    phone: '0416 000 001',
    propertyAddress: '',
    suburb: 'South Melbourne',
    currentManager: 'Example Agency',
    situation: 'Property currently managed',
    timeframe: 'Within 30 days',
    message: 'Synthetic queue test',
    privacyNoticeVersion: '2026-08-27',
    attribution: {
      landingPage: 'https://staging.example/switch-property-managers/',
      referrer: '',
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
      utmContent: '',
      utmTerm: '',
    },
  };
}

function message(body: unknown, attempts = 1) {
  const ack = vi.fn();
  const retry = vi.fn();
  const value: QueueMessageLike = {
    id: 'queue-message-1',
    body,
    attempts,
    ack,
    retry,
  };
  return { value, ack, retry };
}

describe('lead Queue consumer', () => {
  it('acknowledges an individual message only after downstream acceptance', async () => {
    const queued = message(lead());
    const fetcher = vi.fn(async () => new Response(null, { status: 202 }));

    const result = await consumeLeadQueueMessage(
      queued.value,
      {
        LEAD_DELIVERY_WEBHOOK_URL: 'https://crm.example.test/intake',
        LEAD_DELIVERY_TOKEN: 'secret-token',
      },
      fetcher as typeof fetch,
    );

    expect(result).toEqual({ status: 'delivered', messageId: 'queue-message-1', leadId: 'lead-queue-1' });
    expect(queued.ack).toHaveBeenCalledOnce();
    expect(queued.retry).not.toHaveBeenCalled();
  });

  it('retries a failed individual message with bounded backoff instead of acknowledging it', async () => {
    const queued = message(lead(), 3);
    const fetcher = vi.fn(async () => new Response(null, { status: 503 }));

    const result = await consumeLeadQueueMessage(
      queued.value,
      {
        LEAD_DELIVERY_WEBHOOK_URL: 'https://crm.example.test/intake',
        LEAD_DELIVERY_TOKEN: 'secret-token',
      },
      fetcher as typeof fetch,
    );

    expect(result).toEqual({
      status: 'retried',
      messageId: 'queue-message-1',
      leadId: 'lead-queue-1',
      error: 'lead_delivery_failed',
      delaySeconds: 60,
    });
    expect(queued.retry).toHaveBeenCalledWith({ delaySeconds: 60 });
    expect(queued.ack).not.toHaveBeenCalled();
  });

  it('acknowledges malformed poison messages without exposing their body to a retry loop', async () => {
    const queued = message({ secret: 'do-not-log-this-body' });
    const fetcher = vi.fn(async () => new Response(null, { status: 202 }));

    const result = await consumeLeadQueueMessage(
      queued.value,
      {
        LEAD_DELIVERY_WEBHOOK_URL: 'https://crm.example.test/intake',
        LEAD_DELIVERY_TOKEN: 'secret-token',
      },
      fetcher as typeof fetch,
    );

    expect(result).toEqual({ status: 'discarded_invalid', messageId: 'queue-message-1' });
    expect(queued.ack).toHaveBeenCalledOnce();
    expect(queued.retry).not.toHaveBeenCalled();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('discards structurally complete but non-canonical Queue payloads before downstream delivery', async () => {
    const queued = message({ ...lead(), message: 'x'.repeat(LEAD_LIMITS.message + 1) });
    const fetcher = vi.fn(async () => new Response(null, { status: 202 }));

    const result = await consumeLeadQueueMessage(
      queued.value,
      {
        LEAD_DELIVERY_WEBHOOK_URL: 'https://crm.example.test/intake',
        LEAD_DELIVERY_TOKEN: 'secret-token',
      },
      fetcher as typeof fetch,
    );

    expect(result).toEqual({ status: 'discarded_invalid', messageId: 'queue-message-1' });
    expect(queued.ack).toHaveBeenCalledOnce();
    expect(queued.retry).not.toHaveBeenCalled();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
