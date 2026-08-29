# SP_REBIRTH Proof Ledger

Purpose: separate verified proof from marketing language. Nothing in this file becomes a public claim automatically.

## Engineering release evidence

### Current audit wave — 29 August 2026

Status: **LOCAL FIXES VERIFIED; PR CI and Cloudflare release gates still open.**

Verified against branch `audit/mobile-nav-contrast-fix` at source head `2b6c019fc7298e44e4f253357aba58465239ca82` plus the uncommitted working-tree fixes recorded in this section:

- `npm ci` completed from a clean dependency install (Node 24.19.0 emitted only the repository's existing Node 22 engine warning)
- `npm test`: 7 files and 49 tests passed
- `npm audit --audit-level=low`: 0 vulnerabilities
- `npm run build`: Astro diagnostics 0 errors, 0 warnings, 0 hints; production build completed
- desktop Chromium accessibility: 9 passed after the featured journey-number contrast correction
- desktop Firefox accessibility: 9 passed
- desktop WebKit accessibility: 9 passed
- Chromium growth-event/attribution/security suite: 6 passed; first-touch attribution, contact channel events and thank-you security headers now pass
- Chromium homepage hero media contract: passed; the expected static `srcset` is present in the built and served output
- ESLint: passed
- full Playwright matrix, serialised at one worker to remove host contention: 229 passed and 21 intentional visual-review skips across desktop Chromium, mobile Chromium, desktop Firefox, desktop WebKit and mobile WebKit
- GitHub Actions run `33231896004` for commit `a1d9e7ddf00e78244d03f61bf23ca0e269a1a6e2`: **success** — quality/build/Chromium QA, desktop Firefox, desktop WebKit and mobile WebKit all passed
- authenticated Cloudflare inventory confirmed the account contains Worker `sp-rebirth`; its current 100% deployment is version `9a3fff3e-0af6-49d9-92c5-f4dac0d77cc2` and its only reported binding is static `ASSETS`
- the authenticated Queue inventory contains no SP_REBIRTH Queue or DLQ, and `wrangler.jsonc` has no `staging` environment definition

The earlier all-project local Playwright run (before the deterministic fixes were served from the refreshed checkout) recorded 206 passed, 21 intentional visual-review skips and 23 failures. The failures were traced to the deferred attribution/contact listener, the Worker response not preserving dynamic security headers in local serving, stale test-server output for the hero `srcset`, and Firefox timeout contention under five-project parallel load. The refreshed serialised matrix is now green locally; a fresh PR workflow remains required for repository release evidence.

Still open after this wave: protected branch/environment configuration; an approved isolated staging strategy and its Worker/domain/secrets/Turnstile keys/Queue/DLQ/downstream destination; retry/DLQ replay and idempotency proof; separately verified production resources; final CMS/analytics/CRM/review/legal approvals; WordPress backup, asset cutover and rollback drill; and the explicit production promotion gate.

### Continuation hardening and live WordPress inventory — 28 August 2026

Status: **VERIFIED for the audited source/CI checkpoint and connected WordPress inventory; not isolated Cloudflare staging certification and not production release approval.**

Verified code checkpoint:

- branch: `audit/mobile-nav-contrast-fix`
- verified code head: `7c347d7bbe1aa8ad8808945eaae0570294091614`
- pull request: `#2`, open and unmerged, targeting `development`
- `main` remained `a5df5c9e1f96f8f7c9390af5c86172e3eeaf51ff` and `development` remained `35b56039d3de6ad07435eb1dd2cad3c17b042b62` at the repository-governance read
- documentation follow-ups after the verified code checkpoint may have a newer branch SHA; do not treat that as code verification until its exact workflow finishes

Verified GitHub Actions run for code head `7c347d7bbe1aa8ad8808945eaae0570294091614`:

- workflow: `SP_REBIRTH CI`
- run number: `185`
- run id: `33187586105`
- result: `success`
- dependency vulnerability audit: passed
- unit tests: 48 passed
- Astro typecheck: passed
- ESLint: passed
- Prettier format check: passed
- Astro production build: passed
- Sanity Studio build: passed
- Wrangler deployment dry-run: passed
- Chromium desktop/mobile functional, responsive and accessibility QA: passed
- desktop Firefox functional/accessibility QA: passed
- desktop WebKit functional/accessibility QA: passed
- mobile WebKit functional/accessibility QA: passed
- Playwright retries remain disabled

Source and CI hardening added in this continuation:

- GitHub Actions are pinned to immutable commit SHAs rather than mutable action tags
- CI now runs `npm audit --audit-level=low`; the verified run reported no advisory gate failure
- the CI format gate remains strict but prints the formatter-generated diff on failure so formatting defects can be fixed without guessing or weakening the gate
- lead intake now fails closed when the browser `Origin` header is missing and still requires exact same-origin equality
- HTML security headers now include host-scoped HSTS (`max-age=31536000`) without asserting `includeSubDomains` or preload before broader DNS ownership is proven
- first-touch landing/referrer and explicit UTM attribution persist for the browser session only and continue across internal navigation
- attribution URLs are sanitised on both browser capture and lead normalisation: only HTTP(S) URLs are accepted and credentials, query strings and fragments are removed
- contact fields are not written to the session-attribution record and attribution failure never blocks the lead journey
- the lead privacy-notice version advanced to `2026-08-28`; `2026-08-27` remains recognised at the Queue-consumer boundary so previously accepted legitimate messages are not poisoned by the notice revision

Verified production WordPress inventory from read-only connected CMS checks:

- production front page is WordPress page ID `10` and resolves to `/`
- permalink structure is `/%postname%/`
- seven published pages exist: `/`, `/about/`, `/lease/`, `/contact/`, `/for-rental-providers/`, `/for-renters/` and `/sale/`
- no published WordPress posts exist
- the production media library contains 112 attachment records
- all 11 WordPress upload assets referenced by the Astro launch surface were found as production media attachments
- the only changed currently published WordPress page path, `/for-rental-providers/`, is covered by the committed 301 redirect to `/rental-providers/`
- no WordPress content, media, theme, plugin, setting or DNS state was changed during the inventory

Fresh content-source verification:

- current Consumer Affairs Victoria guidance still supports the resource-page statements that rental minimum standards apply at advertising from 25 November 2025
- current guidance still states routine inspections may occur only after the first three months and at most every six months, with seven days' written notice for a general inspection
- current guidance still lists 13 October 2026 changes for minimum-standards compliance records and two-year gas/electrical safety checks
- current guidance still states new rental minimum energy-efficiency standards begin in phases from 1 March 2027 with standard-specific triggers

Repository-governance findings — release blocking:

- the repository remains public while its own README says unpublished client discovery/strategy must not be committed while public
- source-derived discovery/strategy documents are present in the repository, so current visibility is not consistent with that stated policy
- repository rulesets are empty
- GitHub branch inventory reports `protected: false` for `main`, `development` and the audit branch
- pull request `#2` has no requested individual or team reviewer at this checkpoint
- the available integration cannot read or mutate the required repository visibility, secret-scanning/push-protection or branch-protection settings; those controls must be verified/remediated through an authorised GitHub administration path before release

Current external-system blockers and unknowns:

- no authenticated Cloudflare control-plane tool is available in this audit session; current Worker deployments, routes/custom domains, Builds configuration, Queue/DLQ resources, Turnstile, WAF/rate limiting, secrets/bindings, DNS and observability therefore remain **BLOCKED / UNVERIFIED NOW**
- earlier account-backed Cloudflare statements later in this ledger are historical checkpoints only until re-verified against the current account
- no isolated staging Queue producer/consumer, DLQ, forced retry exhaustion, replay/recovery or end-to-end downstream idempotency proof has been established for the current code
- genuine Sanity project/origin/content configuration is not available to this audit; the Studio/schema/preview architecture builds successfully but live CMS content integration must not be fabricated
- final CRM/email/downstream destination, analytics vendor, Search Console/GBP integration, verified review source, retention rules, overseas-processing position, consent approach and privacy/legal approval remain unverified
- the live WordPress media dependency is verified, but final asset migration/preservation, restorable backup proof and rollback drill remain incomplete
- a Semrush project/SEO report could not be retrieved because the connected subscription did not have sufficient API units; no Semrush metrics are claimed from this wave

Release rule for this checkpoint:

- do not merge to `main`, alter production DNS/domain routing, retire WordPress, remove the legacy uploads path, create guessed Cloudflare resources, or promote production based on this CI result
- the next release-critical wave is authenticated GitHub governance remediation plus authenticated Cloudflare staging inventory/provisioning and failure-path UAT

### Development checkpoint — 28 August 2026

Status: **VERIFIED in GitHub CI; not staging runtime proof and not production release approval.**

Verified development SHA:

- `8ea7609cfa58af4073285224a12af97ac2121760`
- commit: `fix: secure dynamic thank-you response`

Verified GitHub Actions run:

- workflow: `SP_REBIRTH CI`
- run number: `136`
- run id: `33108467099`
- result: `success`

The run passed:

- locked dependency installation
- unit tests
- strict Astro typecheck
- production build
- Wrangler deployment bundle dry-run
- Chromium installation
- desktop/mobile browser, responsive and accessibility QA
- browser QA evidence upload

Deployment safety verified in source/tests at this checkpoint:

- actual production deploy command disables Wrangler automatic provisioning and resource auto-create
- non-production version-upload command disables Wrangler automatic provisioning and resource auto-create
- deployment-contract tests keep Queue bindings absent until authenticated Cloudflare resource inventory/provisioning is completed deliberately

Lead intake and transport safety verified in source/tests at this checkpoint:

- synchronous webhook delivery is permitted only when deployment identity is explicitly `staging`
- missing, unrecognised or `production` deployment identity resolves to Queue mode
- absent Queue binding fails closed rather than silently falling back to webhook
- Queue send failure does not report lead acceptance
- declared request-size limits are backed by an actual bounded request-body stream read, so missing/chunked `Content-Length` cannot bypass the application limit
- browser-origin enforcement compares the full expected origin rather than host-only equivalence
- lead intake accepts only explicitly supported form media types rather than substring MIME matches
- Queue consumer validates the canonical lead contract before downstream delivery, including field limits and form-specific constraints
- invalid/poison Queue messages are not forwarded downstream
- downstream webhook transport requires HTTPS, bearer authentication and stable lead-ID idempotency
- Queue consumer acknowledges an individual message only after downstream acceptance and retries downstream failure with bounded backoff

Acknowledgement and analytics semantics verified at this checkpoint:

- durable Queue acceptance is not represented to the browser as downstream delivery
- the thank-you page acknowledges secure receipt/routing without claiming the enquiry has already reached the final destination
- the browser does not emit a fabricated `lead_delivered` event on Queue acceptance

Dynamic response security verified at this checkpoint:

- the on-demand `/thank-you/` response applies the browser-security baseline explicitly rather than assuming Cloudflare static `_headers` applies to Worker-generated HTML
- the dynamic thank-you response is `no-store` and carries `X-Robots-Tag: noindex, nofollow`
- tests keep the dynamic response policy aligned with the static `_headers` security baseline

Still **NOT VERIFIED / NOT IMPLEMENTED** at this checkpoint:

- authenticated Cloudflare account/resource inventory
- real staging Worker deployment for this SHA
- real staging Queue producer binding
- real staging Queue consumer configuration
- real staging Dead Letter Queue
- forced retry exhaustion into the DLQ
- DLQ replay/recovery proof
- real downstream staging destination and end-to-end idempotency proof
- production Queue/DLQ resources
- production domain/DNS cutover
- Sanity Presentation iframe allow-list against the actual trusted Studio origin
- repository privacy/governance remediation for unpublished client discovery material currently stored in a public repository

Do not describe CI bundling as staging runtime proof or production readiness.

### Independent audit wave — 28 August 2026

Status: **VERIFIED for the local audit branch and an unpromoted Worker version; not production approval.**

Source state:

- branch: `audit/mobile-nav-contrast-fix`
- verified code/CI baseline: `a2192b1fd1bea68a51e3ef9087e5e83362c73985`
- latest audited code head: `a9e570853201eaab3c0dc0a83470242a265b7c71`
- latest pull-request head: `36acdbfa6be5bbec406e2b6dad15b4128b7f5961` (documentation-only follow-up; code remains at `a9e570853201eaab3c0dc0a83470242a265b7c71`)
- prior functional/CI baseline: `de618820aa536376635d4e8d23048d11034d8281`
- the audit branch contains the responsive-test fix, retry-policy hardening, dependency-tree remediation and documentation follow-ups after that baseline
- `origin/main` baseline at audit: `a5df5c9e1f96f8f7c9390af5c86172e3eeaf51ff`
- pull request: `#2` targeting `development`
- no merge to `development` or `main` was performed

Repository gates run from that exact local state:

- unit tests: 44 passed
- Astro typecheck: 66 files, 0 errors, 0 warnings, 0 hints
- ESLint: passed
- Prettier format check: passed
- Astro production build: passed
- Sanity Studio build: passed (expected warning: no Studio app ID is configured)
- Wrangler deployment dry-run: passed with automatic provisioning and draft binding creation disabled
- the documented `test:a11y` command was corrected to target the existing accessibility suite and passed 7/7 Chromium checks

GitHub Actions verification for commit `3e2e55530314e4b193da77702bbfb9c9afccbf2c`:

- workflow run `33170784269`: **success**
- primary Chromium job: 83 passed, 1 intentional skip
- desktop Firefox job: 35 passed, 7 intentional skips
- desktop WebKit job: 35 passed, 7 intentional skips
- mobile WebKit job: 36 passed, 6 intentional skips
- quality, build, dry-run and all four browser jobs completed; no test failure was hidden by a skipped dependency job

Refreshed GitHub Actions verification for the current documentation head `cca8cbe8b32526a4e930a411e84ce9934e318c50`:

- workflow run `33171277886`: **success**
- primary Chromium job: 83 passed, 1 intentional skip
- desktop Firefox job: 35 passed, 7 intentional skips
- desktop WebKit job: 35 passed, 7 intentional skips
- mobile WebKit job: 36 passed, 6 intentional skips
- all quality, build, dry-run and browser jobs completed successfully

Earlier responsive-style readiness follow-up for code head `a2192b1fd1bea68a51e3ef9087e5e83362c73985`:

- an earlier run (`33173568173`) recorded one first-attempt mobile WebKit `target-size` failure before its retry passed; this was treated as a test-readiness defect, not silently accepted
- the accessibility suite now waits for the browser load event and asserts the intended responsive navigation mode before Axe analysis; no rule, route or assertion was skipped or weakened
- targeted local mobile WebKit accessibility run with retries disabled: 7/7 passed
- workflow run `33174952905`: **success**; primary Chromium 83 passed/1 intentional skip, desktop Firefox 35 passed/7 intentional skips, desktop WebKit 35 passed/7 intentional skips, mobile WebKit 36 passed/6 intentional skips
- the current workflow log contains no retry, `target-size`, or test-failure record

Earlier final audit refresh for pull-request head `e638950b42de0911eccc54640e479b192f48c6f8`:

- dependency tree was freshly installed with `npm ci --no-audit --no-fund`; targeted npm overrides address the reachable `js-yaml`, `smol-toml` and `uuid` transitive advisories without a blind Sanity major-version change
- `npm audit --omit=dev --json`: zero vulnerabilities
- full `npm audit --json`: zero vulnerabilities
- local unit tests, typecheck, ESLint, Prettier, Astro build, Sanity Studio build and Wrangler dry-run remained passing after the dependency refresh
- CI browser retries are now explicitly disabled (`retries: 0`) so a future first-attempt failure remains visible rather than being hidden by automatic reruns
- workflow run `33176898291`: **success** for all quality/build/dry-run and browser jobs; primary Chromium 83 passed/1 intentional skip, desktop Firefox 35 passed/7 intentional skips, desktop WebKit 35 passed/7 intentional skips, mobile WebKit 36 passed/6 intentional skips
- the run log contains no Playwright retry or test-failure record; repeated local TLS handshake messages are the test web-server's non-fatal certificate noise and did not fail a job
- the PR remains open and unmerged; no production promotion, DNS change or WordPress cutover was performed

Documentation-head verification:

- workflow run `33177508729`: **success** for `f7f2605f5b405cc5dc8700890c2ad95750d34e08`; it re-ran the same quality/build/dry-run and four-browser matrix after the ledger update
- totals: Chromium 83 passed/1 intentional skip, desktop Firefox 35 passed/7 intentional skips, desktop WebKit 35 passed/7 intentional skips, mobile WebKit 36 passed/6 intentional skips
- no Playwright retry marker or failed test was present in the run log

Mobile form interaction follow-up and current code head:

- workflow run `33178036745` (for `d97c16cbe829023f9d02624ff192bcd10e851666`) failed on one first-attempt mobile WebKit radio interaction; the trace showed the native control did not toggle while the responsive layout was still settling. This failure is retained as evidence and was not hidden with a retry or a weakened assertion.
- commit `a9e570853201eaab3c0dc0a83470242a265b7c71` updates the four affected form/event suites to wait for the full load event and font readiness, click the visible label as a user would, and explicitly verify the radio becomes checked. No route, product assertion, accessibility rule or coverage was removed.
- focused local mobile WebKit run with retries disabled: 10 passed.
- local full matrix from this host: 157 passed, 14 intentional skips, and 39 Firefox launch failures (`spawn UNKNOWN`) because the Windows audit host lacks a compatible Firefox side-by-side runtime. Those 39 are an environment limitation, not application passes; the remote Linux Firefox job below is the authoritative Firefox result.
- workflow run `33179981844`: **success** for all quality/build/dry-run and four-browser jobs at the current head. Primary Chromium: 83 passed/1 intentional skip; desktop Firefox: 35 passed/7 intentional skips; desktop WebKit: 35 passed/7 intentional skips; mobile WebKit: 36 passed/6 intentional skips. The run log contains no Playwright retry, flaky-test or failed-test marker.
- final verification run `33180662561` for documentation head `36acdbfa6be5bbec406e2b6dad15b4128b7f5961`: **success** for the same four jobs and gates. Primary Chromium: 83 passed/1 intentional skip; desktop Firefox 35 passed/7 intentional skips, desktop WebKit 35 passed/7 intentional skips, mobile WebKit 36 passed/6 intentional skips. No retry-like marker, flaky test or failed test was present in any job log.
- the pull request remains open and unmerged; no production promotion, DNS change or WordPress cutover was performed.

Earlier GitHub Actions verification for code head `de618820aa536376635d4e8d23048d11034d8281`:

- workflow run `33172698521`: **success**
- primary Chromium job: 83 passed, 1 intentional skip
- desktop Firefox job: 35 passed, 7 intentional skips
- desktop WebKit job: 35 passed, 7 intentional skips
- mobile WebKit job: 36 passed, 6 intentional skips
- all quality, build, dry-run and browser jobs completed successfully

Browser evidence from the same state:

- Chromium desktop/mobile plus WebKit desktop/mobile: 154 passed, 14 intentional skips
- accessibility, responsive navigation, conversion journeys, route/redirect behavior, analytics-safety assertions and visual captures passed in those projects
- the local Firefox executable could not launch because the Windows audit host is missing a compatible side-by-side runtime; this is a host limitation, not an application result. The GitHub Linux result above is the authoritative Firefox evidence for this branch.

Account-backed Cloudflare evidence:

- the authenticated account contains the `sp-rebirth` Worker, currently exposed only through its `workers.dev` hostname; no Sana custom domain or route is attached
- the active 100% deployment remains the previously deployed `main` version; the audit version was not promoted
- the Worker has no configured lead secrets, Queue/DLQ bindings, D1 database, R2 bucket or verified Turnstile configuration
- Workers Builds was corrected to use the locked install/build contract, the guarded repository deploy script, `SKIP_DEPENDENCY_INSTALL=1`, and an explicit `PUBLIC_DEPLOY_ENV=staging` plus the verified workers.dev canonical URL; previews remain disabled because a version preview is not an isolated staging environment
- an unpromoted preview version was uploaded from this audit state and returned `sitemap.xml` as HTTP 404 with `noindex`, `robots.txt` as crawl-blocking, and the expected security headers. Negative lead probes rejected missing verification and cross-site origins without forwarding a lead.

Read-only Workers Observability check (24 hours ending 28 August 2026 13:00 UTC):

- the service returned 37 response-status records across the observed requests (301, 308, 400, 403, 404 and 405)
- no response with status 500 or above was observed in that window
- observed log levels were informational and observed Worker outcomes were `ok`
- this is a telemetry snapshot, not proof of complete availability, lead delivery or production readiness

Release blockers and unknowns remain:

- the branch has passed the latest refreshed GitHub workflow, but the pull request remains unmerged pending review and the separate production release gates
- the active `main` deployment is still the prior version; the corrected staging-safe sitemap behavior exists only in the unpromoted audit version until an approved merge/deploy
- no isolated staging Worker/Queue/DLQ, Turnstile keys, downstream sandbox, retry-exhaustion, DLQ replay or end-to-end idempotency proof exists
- the dependency audit is now clean (`npm audit --omit=dev` and full audit both report zero vulnerabilities) after reviewed transitive overrides; continue monitoring on dependency updates
- Sanity project/origin/content credentials, approved analytics/Search Console/GBP integrations, review source and CRM/mail destination are not verified
- the complete Sana/WhatsApp source conversation and competitor-research provenance are not present as an authoritative export; repository notes are source-derived summaries, not proof of exhaustive capture
- legacy WordPress URL/media inventory, redirect coverage, backup/rollback proof and DNS cutover approval are outstanding
- production `PUBLIC_DEPLOY_ENV`, production site URL, production Queue/DLQ and production secrets must remain unset until the explicit release gate

This wave is evidence for the next engineering review only. It must not be described as staging certification, production readiness or permission to replace the live WordPress website.

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
- use the _patterns_ to guide copy and proof architecture
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
