import { handle } from '@astrojs/cloudflare/handler';
import { consumeLeadQueueMessage, type QueueMessageLike } from './lib/lead-queue-consumer';
import type { LeadDeliveryBindings } from './lib/lead-delivery';

type AstroWorkerEnv = Parameters<typeof handle>[1];
type AstroExecutionContext = Parameters<typeof handle>[2];
type WorkerEnv = AstroWorkerEnv & LeadDeliveryBindings;

interface LeadQueueBatch {
  readonly queue: string;
  readonly messages: readonly QueueMessageLike[];
}

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: AstroExecutionContext): Promise<Response> {
    return handle(request, env, ctx);
  },

  async queue(batch: LeadQueueBatch, env: WorkerEnv): Promise<void> {
    for (const message of batch.messages) {
      const outcome = await consumeLeadQueueMessage(message, env);

      // Operational logs intentionally contain identifiers/status only. Never log
      // the Queue message body because it contains enquiry PII.
      if (outcome.status === 'delivered') {
        console.info(
          JSON.stringify({
            event: 'lead_queue_delivered',
            queue: batch.queue,
            messageId: outcome.messageId,
            leadId: outcome.leadId,
          }),
        );
        continue;
      }

      if (outcome.status === 'discarded_invalid') {
        console.error(
          JSON.stringify({
            event: 'lead_queue_invalid_message_discarded',
            queue: batch.queue,
            messageId: outcome.messageId,
          }),
        );
        continue;
      }

      console.warn(
        JSON.stringify({
          event: 'lead_queue_retry_scheduled',
          queue: batch.queue,
          messageId: outcome.messageId,
          leadId: outcome.leadId,
          attempts: message.attempts,
          error: outcome.error,
          delaySeconds: outcome.delaySeconds,
        }),
      );
    }
  },
};
