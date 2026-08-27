# SP_REBIRTH Proof Ledger

Purpose: separate verified proof from marketing language. Nothing in this file becomes a public claim automatically.

## Engineering release evidence

### Development checkpoint — 27 August 2026

Status: **VERIFIED in GitHub CI; not production release approval.**

Verified development SHA:
- `69aeb76cd6942a73ee38825c8a4452d5759632f0`
- commit: `fix: fail closed on unknown lead deploy env`

Verified GitHub Actions run:
- workflow: `SP_REBIRTH CI`
- run number: `128`
- run id: `33104234003`
- result: `success`

The run passed:
- locked dependency installation
- unit tests
- strict Astro typecheck
- production build
- Wrangler deployment bundle dry-run with automatic provisioning and auto-create disabled
- Chromium installation
- desktop/mobile browser, responsive and accessibility QA
- browser QA evidence upload

Transport safety verified in source/tests at this checkpoint:
- synchronous webhook delivery is permitted only when deployment identity is explicitly `staging`
- missing, unrecognised or `production` deployment identity resolves to Queue mode
- absent Queue binding fails closed rather than silently falling back to webhook
- Queue send failure does not report lead acceptance
- downstream webhook transport requires HTTPS, bearer authentication and stable lead-ID idempotency
- Queue consumer acknowledges an individual message only after downstream acceptance and retries downstream failure with bounded backoff

Still **NOT VERIFIED / NOT IMPLEMENTED** at this checkpoint:
- authenticated Cloudflare account/resource inventory
- real staging Worker deployment for this SHA
- real staging Queue producer binding
- real staging Queue consumer configuration
- real staging Dead Letter Queue
- forced retry exhaustion into the DLQ
- DLQ replay/recovery proof
- real downstream staging destination and idempotency proof
- production Queue/DLQ resources
- production domain/DNS cutover

Do not describe CI bundling as staging runtime proof or production readiness.

## Current independent profile evidence

### realestate.com.au — Sana Patel agent profile
Status: independently published / current snapshot to re-check before launch.

Observed:
- Managing Director / OIEC at Sana Patel Real Estate
- profile reports 9 years experience
- profile describes close to a decade of property-industry experience and licensed-estate-agent status

Use:
- supports founder authority and licensed-estate-agent positioning
- exact years must be re-checked at launch because it changes over time

### realestate.com.au — agency profile
Status: independently published / dynamic market-performance snapshot.

Observed at research date:
- recent leasing activity is publicly attributed to Sana Patel Real Estate
- profile exposes leased-property and median-advertised-time metrics

Use:
- candidate source for a future evidence strip, but do not hardcode dynamic metrics without a dated/source-labelled presentation and Sana approval
- never imply that historical leasing results guarantee future performance

## Historical customer-language evidence

### RateMyAgent / prior agency reviews mentioning Sana
Status: independently published historical reviews; final public reuse should respect source/platform permissions and should preferably be reconciled with Sana's Trustindex/Google corpus.

Repeated themes in landlord/customer language:
- timely, up-to-date communication
- efficient and hassle-free management experience
- professionalism
- strong real-estate knowledge
- prompt email responses
- issue resolution
- approachability / pleasant to deal with
- confidence that Sana follows through

Strategic use:
- these themes support the positioning territory “visible accountability / calm competence / clear follow-through”
- use the *patterns* to guide copy and proof architecture
- do not fabricate or lightly rewrite a review as if it were a direct testimonial

## Current Sana website claims requiring care

Existing/current public copy contains stronger claims such as:
- maximising returns
- minimising vacancy
- quality and long-term renters
- guarantees / seamless experience language on some pages

Treatment in SP_REBIRTH:
- prefer evidence-led, process-led language
- remove guarantees that cannot be responsibly substantiated
- avoid claiming legal protection/full compliance

## Trustindex / Google proof — pending connection

Required before launch:
- authoritative current review count
- current rating
- review-source URL
- permission/integration method through Sana's Trustindex subscription
- selected review IDs/content
- date last refreshed

Implementation rule:
- review count and rating should come from the source/integration where possible, not hand-maintained text
- if cached, include a refresh/expiry policy
- never show a rating or count if the source cannot be verified

## Proof hierarchy for the final site

1. current verified Google/Trustindex reviews
2. current independent professional profiles/credentials
3. dated realestate.com.au market activity where commercially useful and contextually fair
4. historical review-language patterns
5. process evidence—what Sana actually does and how decisions are communicated
6. marketing claims only where the above cannot reasonably provide proof

## Release gate

Before production:
- re-check every numerical claim
- record URL/source/date
- obtain Sana approval for credentials/award wording
- obtain legal/compliance review where the claim could imply statutory or financial outcomes
