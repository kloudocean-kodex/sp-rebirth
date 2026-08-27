export type LeadJourney = 'rental_appraisal' | 'switch_manager' | 'general';
export type VisibilityCheckCta = 'rental_appraisal' | 'switch_manager';

export type GrowthEvent =
  | { name: 'visibility_check_started' }
  | { name: 'visibility_check_completed' }
  | { name: 'visibility_check_cta_selected'; cta: VisibilityCheckCta }
  | { name: 'visibility_check_printed' }
  | { name: 'lead_started'; formType: LeadJourney }
  | { name: 'lead_submit_attempted'; formType: LeadJourney }
  | { name: 'lead_accepted'; formType: LeadJourney }
  | { name: 'lead_failed'; formType: LeadJourney };

/**
 * First-party browser measurement contract for SP_REBIRTH.
 *
 * This function intentionally does not write cookies/localStorage, call analytics
 * vendors, send network requests or accept arbitrary payloads. The discriminated
 * union above limits the data surface to non-PII journey metadata. An approved
 * analytics adapter can listen for `sp:growth-event` later without changing the
 * product components that generate the lifecycle signals.
 *
 * Downstream delivery is deliberately not a browser event. In Queue mode the
 * browser can prove durable acceptance only; actual delivery is known by the
 * Queue consumer/downstream system and must be measured from that server-side
 * source of truth rather than inferred from a thank-you page view.
 */
export function emitGrowthEvent(event: GrowthEvent): void {
  if (typeof window === 'undefined') return;

  const detail = Object.freeze({ ...event });
  window.dispatchEvent(new CustomEvent('sp:growth-event', { detail }));
  window.dispatchEvent(new CustomEvent(`sp:${event.name}`, { detail }));
}
