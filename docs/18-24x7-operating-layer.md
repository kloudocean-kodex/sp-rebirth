# SP_REBIRTH · 24×7 Human Accountability Layer

Status: architecture and operating contract. The **24×7 direct access to Sana Patel** promise is confirmed. Vendor selection, channel rules, urgency rules and human-response expectations remain release-gated until Sana's real operating workflow is confirmed.

Last reviewed: 28 August 2026.

## 1. What the public promise means

**Confirmed:** rental providers have a direct path to Sana Patel 24×7 when something needs attention.

The promise is about access, accountability and a responsive next step. It must never be represented as a guarantee that every repair, trade attendance, tenancy process, legal step or final resolution can be completed immediately at any hour.

The system may acknowledge, capture context, classify, route and escalate outside business hours. It must not pretend that an automated acknowledgement is a personal human response from Sana.

## 2. Product principle

The product is not an "AI chatbot". It is a **human-accountability operating layer** in which automation reduces delay and information loss while Sana remains the accountable professional.

Desired outcome:

`visitor / rental provider → secure intake → durable acceptance → acknowledgement → context + routing → Sana / authorised human → follow-through → measurable closure`

## 3. Current engineering baseline

Already implemented in SP_REBIRTH:

- same-origin lead endpoint
- strict request-size and supported-content checks
- server-side field normalisation and validation
- honeypot abuse filtering
- Cloudflare Turnstile server verification when configured
- Turnstile hostname and action verification
- HTTPS-only authenticated downstream delivery
- idempotency key per lead
- explicit delivery timeout
- fail-closed success UX: the browser is not told a lead was received unless the configured downstream destination accepted it
- automatic landing-page, referrer and UTM capture
- versioned collection-notice field
- first-party typed growth events that carry journey metadata only, not answers or contact details
- a telephone fallback when safe digital delivery fails

The current webhook transport is a sound staging integration boundary, but it is **not the final durability model** for the 24×7 promise because a single synchronous third-party handoff can be temporarily unavailable.

## 4. Durable transport target

Cloudflare's current Workers guidance distinguishes the primitives cleanly:

- **Queues**: decouple producer and consumer; buffer work; provide at-least-once delivery and configurable retries; suitable for lead delivery, notification jobs and other single-step background work.
- **Workflows**: durable multi-step execution; persist step state; retry failed steps independently; suitable once acknowledgement, CRM write, notification, AI-assisted triage, human approval and follow-up become a coordinated sequence.

Target progression:

### Phase A — launch reliability

`Lead API → Cloudflare Queue → delivery consumer → configured CRM / notification destination`

The website returns success only after durable queue acceptance. The consumer owns retry logic and failed-message handling. A Dead Letter Queue or equivalent failure sink must exist before production relies on the queue.

### Phase B — 24×7 operating sequence

When the workflow has genuinely dependent steps, the queue consumer may start a Workflow:

`Queue → Workflow → acknowledge → persist/routable record → notify Sana → optional AI-assisted summary/triage → human action → follow-up state`

Do not introduce Workflows merely to make the architecture look advanced. Use it only when durable multi-step state is required.

Primary references:

- https://developers.cloudflare.com/workers/best-practices/workers-best-practices/
- https://developers.cloudflare.com/queues/
- https://developers.cloudflare.com/queues/configuration/dead-letter-queues/
- https://developers.cloudflare.com/workflows/
- https://developers.cloudflare.com/workflows/build/rules-of-workflows/

## 5. Canonical lead lifecycle

Every accepted lead should have a stable identifier and timestamps for the states the final system actually supports.

Proposed lifecycle vocabulary:

1. `received_by_edge` — request reached the website endpoint.
2. `validated` — required validation and abuse checks passed.
3. `durably_accepted` — the lead is stored in a queue/system that can survive downstream service failure.
4. `acknowledged` — the visitor has received a truthful automated or human acknowledgement through an approved channel.
5. `routed` — the lead has been assigned to Sana or another explicitly authorised handler.
6. `human_reviewed` — an authorised person has reviewed the context.
7. `responded` — a human response has been sent or a conversation has begun.
8. `closed` — the enquiry has an explicit outcome or no further action is required.

Not every launch integration needs to expose every state, but no state may be fabricated merely to make dashboards look complete.

## 6. Acknowledgement is not impersonation

An automated acknowledgement may say, in substance, that the enquiry has been received securely and is being routed to Sana.

It must not say or imply:

- "Sana has read this" when she has not
- "Sana says..." when content was generated automatically
- a human response time that Sana has not operationally committed to
- that an emergency or urgent repair is being actively handled merely because a web message was accepted

If AI drafts a response, the system should identify the approval/sending rule internally. Initial launch posture should default to human approval for personalised outbound responses.

## 7. AI — allowed uses

AI may support the operating layer when grounded in approved business data and subject to deterministic guardrails. Suitable uses include:

- concise lead summaries for Sana
- suggested category / intent
- suggested urgency for human review
- extraction of structured context already supplied by the user
- duplicate/similar-enquiry detection
- drafting acknowledgement or follow-up text from approved templates
- identifying missing context that a human may want to request
- internal next-step suggestions
- after-hours knowledge assistance from a controlled, cited knowledge base

The design should record which model/version/provider performed a material automated action when that becomes operationally useful.

## 8. AI — prohibited or human-gated uses

Do not allow an autonomous model to:

- impersonate Sana
- present itself as a licensed estate agent or human property manager
- provide an unverified property-specific rental valuation
- determine legal compliance
- make binding tenancy/legal decisions
- approve expenditure or contractors without explicit business authority
- promise emergency attendance or repair completion
- change a renter's or rental provider's legal position
- publish case-study/review/performance claims without source evidence
- send sensitive personalised advice autonomously unless Sana explicitly approves that operating mode after testing

## 9. Urgent renter / safety boundary

A website, AI assistant or form must never be the sole pathway for an emergency or urgent renter safety matter.

Renter-facing experiences must clearly distinguish:

- emergency services / immediate danger
- Victorian urgent-repair pathways
- ordinary maintenance
- general tenancy questions

The final renter workflow must use current authoritative Victorian guidance and show a review date. AI can help users find the correct approved pathway, but it must not delay emergency action.

## 10. Routing and urgency are not yet invented

SP_REBIRTH must not silently invent business rules for Sana.

Before automated routing or escalation is activated, confirm at minimum:

- Sana's preferred primary and fallback notification channels
- whether SMS, email, WhatsApp, phone, CRM task or another channel is operationally acceptable
- what Sana considers urgent for rental-provider enquiries
- separate rules for renter repairs/safety
- who may act if Sana is unavailable
- whether there are quiet-hours exceptions for non-urgent notifications despite 24×7 access
- what information can be included in notifications on lock screens or shared devices
- desired human-response expectations, if any are to be published
- escalation path when the primary notification is not acknowledged

Until those are confirmed, the website can truthfully promise access without inventing an SLA.

## 11. Reliability requirements

Production lead delivery should satisfy these properties:

- durable acceptance before showing success
- idempotent processing because queues/workflows can retry
- deterministic lead identifier carried end-to-end
- bounded retries with observable failure state
- Dead Letter Queue or equivalent recovery path
- no silent deletion of failed leads
- alerting for backlog, repeated delivery failure or dead-letter messages
- replay/recovery procedure tested without duplicating customer contact
- downstream timeouts
- least-privilege credentials
- secret rotation procedure
- staging destination separated from production
- synthetic non-customer delivery test available for release verification

## 12. Data minimisation and privacy

The 24×7 layer should carry only data needed for the enquiry and agreed operations.

Rules:

- do not put lead PII into analytics events
- do not send Visibility Check answers/scores unless the visitor explicitly chooses a future "share my result" action
- do not put unnecessary personal data into logs
- do not expose tokens, webhook secrets or provider credentials to browser code
- define retention for lead records, workflow state, dead-letter records and AI logs before production
- document likely overseas processing after final vendors are selected
- keep marketing consent separate from service-enquiry handling

## 13. Measurement contract

Current browser lifecycle events are first-party only and do not make network calls themselves.

Current event vocabulary:

- `visibility_check_started`
- `visibility_check_completed`
- `visibility_check_cta_selected`
- `visibility_check_printed`
- `lead_started`
- `lead_submit_attempted`
- `lead_accepted`
- `lead_failed`

There is deliberately no browser-side `lead_delivered` event. In Queue mode the browser can prove durable acceptance only; downstream delivery must be measured from the Queue consumer, CRM or other server-side system of record.

Approved event payloads contain only event/journey identifiers such as `formType` or CTA name. They must never contain a person's name, phone, email, property address, message, Visibility Check answers or score.

A GA4/GTM or other analytics adapter may listen to these events later only after the production measurement/privacy plan is approved.

## 14. Observability that matters

Operational metrics should answer real questions, not create vanity dashboards:

- lead acceptance success/failure rate
- queue backlog and oldest-message age
- consumer retry count
- dead-letter count
- acknowledgement delivery success/failure
- time from durable acceptance to human review
- time from human review to response, if operationally meaningful
- lead source / journey type
- qualified vs unqualified outcome once a CRM definition exists
- appraisal requested / completed
- switching conversation / management won, only when backed by real CRM status

Do not claim conversion or revenue attribution merely because a browser event fired.

## 15. Legacy WordPress migration observations

Read-only production inspection verified that the legacy site uses Gravity Forms, abuse-prevention tooling and SMTP-backed mail delivery, and that historical form records exist in the WordPress database.

Public repository documentation must not contain customer records, submission contents or operational record counts. The detailed retention/export inventory is an internal migration artifact, not website source code.

Migration implications:

- preserve automatic referrer/UTM attribution in SP_REBIRTH
- decide whether an optional self-reported source field is still useful for referrals/offline channels
- define the retention/export disposition for historical enquiry and subscription records before WordPress retirement
- verify any export in a private, access-controlled location
- do not require a manual source dropdown merely because the old site did

## 16. Release gates for the 24×7 claim

Before production promotion, evidence must prove:

- public wording matches the confirmed promise and does not overstate resolution speed
- real lead form → durable destination succeeds end-to-end in staging
- failure path visibly falls back to direct contact
- duplicate delivery is controlled
- retry/dead-letter recovery is tested
- Sana receives a usable notification containing enough context but no unnecessary data
- visitor acknowledgement wording is truthful
- after-hours routing has been tested
- urgent renter/safety pathway is not dependent on AI
- AI, if enabled, is bounded by approved knowledge and human authority
- analytics cannot collect lead PII or Visibility Check answers by accident
- privacy notice matches the actual vendors/data flows
- production secrets and staging secrets are separate
- there is an operational owner for failures and alerts

## 17. ProddyG reuse principle

The reusable ProddyG asset should be the operating pattern, not Sana-specific content:

**24×7 Human Accountability Layer**

`secure intake → durable acceptance → transparent acknowledgement → context → routing → human accountability → follow-through → evidence`

The framework can later serve founder-led professional businesses, but every deployment must have its own domain rules, escalation authority, privacy model and compliance boundaries.
