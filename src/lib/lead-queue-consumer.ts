import {
  deliverLeadToWebhook,
  isLeadPayload,
  queueRetryDelaySeconds,
  type LeadDeliveryBindings,
} from './lead-delivery';

export interface QueueMessageLike {
  readonly id: string;
  readonly body: unknown;
  readonly attempts: number;
  ack(): void;
  retry(options?: { delaySeconds?: number }): void;
}

export type QueueMessageOutcome =
  | { status: 'delivered'; messageId: string; leadId: string }
  | { status: 'retried'; messageId: string; leadId: string; error: string; delaySeconds: number }
  | { status: 'discarded_invalid'; messageId: string };

export async function consumeLeadQueueMessage(
  message: QueueMessageLike,
  bindings: LeadDeliveryBindings,
  fetcher: typeof fetch = fetch,
): Promise<QueueMessageOutcome> {
  if (!isLeadPayload(message.body)) {
    // Poison/malformed messages should not loop forever or expose their body in logs.
    // They are explicitly acknowledged and reported by message ID only.
    message.ack();
    return { status: 'discarded_invalid', messageId: message.id };
  }

  const lead = message.body;
  const delivery = await deliverLeadToWebhook(lead, bindings, fetcher);

  if (delivery.ok) {
    message.ack();
    return { status: 'delivered', messageId: message.id, leadId: lead.id };
  }

  const delaySeconds = queueRetryDelaySeconds(message.attempts);
  message.retry({ delaySeconds });
  return {
    status: 'retried',
    messageId: message.id,
    leadId: lead.id,
    error: delivery.error,
    delaySeconds,
  };
}
