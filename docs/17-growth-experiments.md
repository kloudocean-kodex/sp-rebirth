# SP_REBIRTH · Growth experiments and lead utilities

Status: prioritised experiment backlog. Each item must pass usefulness, evidence, privacy, compliance, performance and conversion review before production.

## Tier 1 — build for launch or launch-near

### 1. Property Management Visibility Check

Purpose: give a rental provider immediate value before asking for contact details.

Positioning: **How visible is the management of your investment?** This is deliberately different from competitor 'rental health check' / 'rental performance review' forms that ask for contact details before providing value.

Proposed 7 dimensions:

- rent strategy / review visibility
- inspection quality and property-condition visibility
- unresolved maintenance / follow-through
- communication and response clarity
- lease-expiry / next-step planning
- safety-record visibility (gas/electrical/smoke alarm where applicable)
- rent statements / disbursement visibility

UX:

- 60–90 seconds
- answer choices scored locally in the browser
- no name, email, phone or property address required to see result
- overall **Management Visibility Score** plus three sub-scores: Rent Strategy, Property Protection, Management Visibility
- result language: 'well visible', 'some areas deserve a closer look', 'limited visibility / worth reviewing'
- personalised list of 2–3 areas to review based on answers
- clear disclaimer: self-assessment only; not a valuation, compliance audit, legal advice or judgement about another agency
- after result, optional CTA: Request an evidence-backed rental appraisal / Talk privately about switching / Send my result to Sana (only once lead-delivery architecture is configured)

Conversion events to measure later: tool_start, question_progress, tool_complete, result_band, CTA_selected, lead_started, lead_submitted.

### 2. Evidence-backed Rental Appraisal

Do not provide an instant property-specific dollar figure without a defensible data source. Current public Victorian tools use quarterly historical data and explicitly do not represent properties on the market right now.

Launch path:

- visitor gives address/suburb and useful property context
- Sana provides a personalised appraisal using current comparable evidence and professional judgement
- website explains what the appraisal considers: location, condition, property type/features, competition, presentation, demand and timing

Future enhancement: licensed property/rental data API if commercial value justifies it.

### 3. Switching Readiness Journey

A high-intent owner should be able to understand the transition before giving details:

- what to review in the current management agreement
- what information/authority is typically needed
- what Sana can coordinate after authority is given
- what does not happen without the owner's instruction

CTA should be a confidential conversation, not a scare tactic.

## Tier 2 — content + traffic moat

### 4. Rental Provider Hub

Structured evergreen + time-sensitive content:

- Victorian rental-law changes with effective dates and 'last reviewed' date
- rent review rules and process
- minimum standards overview linked to Consumer Affairs Victoria
- gas/electrical/smoke-alarm record explainers
- inspection-report quality guide
- maintenance triage / prevention guide
- switching-manager guide
- rental appraisal guide
- owner FAQs

All compliance content must cite authoritative Victorian sources and avoid legal advice.

### 5. Renter Hub

Useful self-service pages can improve renter experience and reduce repetitive administration:

- maintenance request guidance
- urgent repairs guidance with official Victorian sources
- application guidance
- tenancy-transfer / change-of-renter guidance where appropriate
- renter FAQs

No emergency workflow should rely solely on a website form.

### 6. Areas We Serve / local SEO

Create a Melbourne service-area hub first. Add suburb pages only when each page has unique, useful content: actual service relevance, local rental context, property-type patterns, useful owner guidance, real case evidence or community knowledge. No programmatic thin suburb pages.

## Tier 3 — evidence moat

### 7. Results / Client Stories

Only publish when source evidence exists. Preferred structure:

- starting situation
- constraint/problem
- what Sana did
- measurable outcome (if documented)
- owner quote (verified permission/source)
- context/caveat

Avoid cherry-picked financial claims without enough context.

### 8. Review-language intelligence

Use verified Google/Trustindex/portal reviews to identify recurring customer-language themes. Use those themes to inform page hierarchy and copy, but never fabricate or paraphrase a review as if it were a quotation.

## Rent-price / calculator research conclusion

Current official Victorian sources are useful for context, not an automated property-specific valuation:

- Consumer Affairs Victoria's 'rent calculator' converts rent between payment periods; it does not estimate market rent.
- Housing Victoria's rental-cost tool uses the Homes Victoria Quarterly Rental Report and states results are based on the most recent quarter, not live properties currently on the market.
- DFFH publishes quarterly medians / moving annual rents by suburb, but the currently surfaced public Rental Report is September quarter 2025.

Therefore SP_REBIRTH should **not** launch a fake 'your property is worth $X/week' calculator. A high-trust brand wins by explaining the limits and offering a personalised evidence-backed appraisal.

## Other experiment ideas to validate later

- 'What has changed in Victorian renting?' update digest, with optional email subscription only after a clear proposition and separate marketing consent.
- owner checklist PDF generated from the Visibility Check result.
- portfolio-owner version of the Visibility Check for multiple properties.
- campaign-specific landing pages for Instagram/Google Ads with preserved UTM attribution.
- appointment booking after a qualified lead, if Sana's calendar/workflow supports it.
- 'rent review reminder' service only if operational ownership and legal wording are confirmed.

## Anti-patterns

Do not ship:

- fake instant valuations
- fabricated scarcity ('only 3 spots left')
- fake review counts
- guaranteed rent-growth or days-on-market claims
- legal/compliance guarantees
- dark-pattern gated results
- 20+ thin suburb pages
- AI chatbot that cannot answer with verified property/business context
- generic newsletter signup without a defined value proposition
