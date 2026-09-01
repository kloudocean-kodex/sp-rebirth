# SP_REBIRTH Proof Ledger

Purpose: separate verified proof from marketing language. Nothing in this file becomes a public claim automatically.

### Staging lead-delivery UAT, branded email and REA profile audit — 1 September 2026

Status: **STAGING SUCCESS, DEDUPLICATION, RETRY/DLQ AND RECOVERY PATHS VERIFIED; REA IMPROVEMENT DRAFT PREPARED BUT NOT PUBLISHED. Production remains untouched.**

- submitted one clearly labelled synthetic lead through the deployed staging browser form and passed the live Turnstile,
  Worker intake and Queue-acceptance path; the browser reached the secure `/thank-you/?type=general` acknowledgement
- verified the corresponding authenticated Pipedream execution completed successfully in 4,304 ms, returned HTTP `200`,
  reported `accepted: true` and `duplicate: false`, and returned the same synthetic lead ID as the inbound Queue envelope
- verified the connected Gmail account created exactly one Sent message for that lead; its MIME structure is
  `multipart/alternative` with both a plain-text body and a responsive HTML body
- replayed the exact same bridge event; the second execution completed successfully in 2,338 ms, exited as
  `duplicate_already_delivered`, returned HTTP `200` and left the Gmail Sent count at exactly one, verifying the bridge's
  exact-event duplicate suppression without creating a second email
- ran a controlled staging-only delivery failure by temporarily replacing the staging Worker's delivery credential with
  a deliberate invalid UAT value, then submitted a second clearly labelled synthetic lead; the public form still reached
  the thank-you page because intake was durably accepted before downstream delivery
- observed the primary Queue backlog reach one and then return to zero after its configured retry attempts, while the
  staging DLQ backlog reached one with the exact synthetic lead ID and source-Queue metadata
- restored the original staging credential from a private temporary rollback file that was never printed, committed or
  copied into documentation; removed that temporary file immediately after the restored path was proven
- requeued the exact DLQ payload to the staging primary Queue through the authenticated Cloudflare dashboard; Pipedream
  event `3IiYBG6BZFQ2sGXFJVUFBgaQLyv` completed successfully in 3,851 ms, returned HTTP `200`, `accepted: true` and
  `duplicate: false`, and returned the same lead ID
- verified Gmail contained exactly one Sent message for the recovered synthetic lead, then acknowledged only the
  delivered synthetic DLQ copy; authoritative Queue metrics reported zero messages and zero bytes in both the staging
  primary Queue and DLQ
- updated only the temporary bridge email's presentation layer to the approved ink, limestone, parchment, porcelain,
  brass, champagne and bronze palette; retained the existing plain-text alternative, lead fields, bearer authentication,
  idempotency and delivery logic
- deployed that isolated Pipedream presentation change as active workflow version 12, then submitted a fresh synthetic
  lead through the public staging form; the bridge completed successfully with HTTP `200`, `accepted: true` and
  `duplicate: false`, and Gmail contained exactly one corresponding Sent message
- visually inspected the fresh HTML email: black brand header, warm gold/ivory content card, clear field hierarchy and a
  responsive single-column container were present; device-specific rendering in the recipient's mailbox remains a
  separate confirmation item
- did not embed the legacy WebP logo in email because that would introduce both an avoidable WordPress-retirement
  dependency and weaker email-client compatibility; use an approved migrated PNG/SVG master when the permanent provider
  and asset origin are selected, without redrawing or recolouring Sana's wordmark
- no webhook URL, bearer token, Worker secret, Turnstile secret, personal Gmail address or other credential is recorded in
  this repository
- recipient-inbox receipt and visual rendering on the recipient's devices still require confirmation; provider acceptance
  and sender-side Sent evidence do not prove how the message rendered in the recipient's mailbox
- Pipedream Free plus a personal Gmail sender is an explicitly temporary staging/early-volume bridge, not the approved
  permanent production CRM or transactional-email system
- current public REA evidence was read on 1 September 2026: Sana's agent profile reports Managing Director / OIEC and
  nine years' experience; the agency profile reports seven leases in the last 12 months, a `$595pw` median leased price
  and 13 median days advertised. These are dated third-party platform observations, not timeless marketing claims
- authenticated Agent Admin shows residential property management selected and genuine licence/start-year data present;
  About Me, tagline, specialities and LinkedIn improvements have been drafted in the browser but **Save was not invoked**
- Awards and Community Involvement remain blank because no independently verifiable award record or specific community
  activity was found; a self-published profile or legacy-site statement is not sufficient proof for publication
- the live agent profile has no cover photo or professional video, and the live agency profile has no hero image; a
  licensed Melbourne sunrise stock candidate was prepared for later agency-hero approval, while an AI-expanded Sana
  concept remains unpublished because authentic founder photography is the preferred production standard
- no REA profile, agency branding, production Worker, custom domain, DNS record or WordPress resource was changed

Required next evidence is: recipient-inbox confirmation; action-time approval before saving the REA draft or agency
branding; authentic landscape founder photography plus an approved YouTube profile video before those media fields can
be described as complete; and a separate production-provider decision and production UAT before any release promotion.

### Sana-supplied forms, package and competitor-capture triage — 1 September 2026

Status: **SOURCE MATERIAL REVIEWED; SAFE CONCEPTS RETAINED; LEGACY OR UNVERIFIED CLAIMS REMAIN WITHHELD.**

- reviewed all 14 newly supplied WhatsApp image captures, six DOCX files and the three-page property-management package
  PDF from the local `SP_rebirth` source folder; no supplied source file was modified
- the supplied “FREE Investment Property Health Check” validates demand for a diagnostic acquisition journey, but it
  requests contact details before returning value; the implemented SP_REBIRTH Visibility Check is deliberately stronger:
  it gives an immediate, ungated result first and offers contact as the visitor's next choice
- the health-check footer's “Rated 5.0 on Google” statement was not independently verified and is not approved for reuse;
  the current public REA agency page also shows no REA review rating, which is a different platform and does not prove or
  disprove a Google rating
- competitor captures show that complete REA profiles combine a useful hero, genuine founder photo/video, concrete
  specialities, verified reviews and current performance evidence; they also show that operational performance can exist
  behind a visually incomplete profile, so presentation and service proof must be improved separately
- the supplied Instagram capture shows an inconsistent visual grid and mostly low-view, generic imagery; the recommended
  content system is founder/process explainers, current Victorian guidance, local Melbourne insights and permissioned
  operational stories—not more anonymous stock-agent tiles
- structurally reviewed the supplied pet, vacate, maintenance, rental-application and smoke-alarm DOCX files; visual DOCX
  rendering was unavailable in the audit environment, so their final layout is explicitly unverified
- withheld the legacy pet, vacate and maintenance documents because they retain another agency's identity and contain
  outdated, over-broad or legally risky language; the official-style pet and rental-application forms should be linked
  from the current Consumer Affairs Victoria source rather than republished as frozen copies
- the package PDF confirms a useful Gold/Platinum service architecture and the original black/gold/ivory visual direction,
  but fees, inclusions, conditions and legal footer require Sana's current commercial approval and legal/content review;
  pages two and three also have crowded footer treatment that should be corrected before publication
- current official guidance was rechecked: the prescribed rental application applies from 31 March 2026; pet requests
  use the prescribed process and cannot attract a pet bond; renter notice periods depend on the reason and evidence; and
  smoke-alarm obligations include annual checks from 25 November 2025

### Entity, search and AI-discovery implementation — 1 September 2026

Status: **CODE AND LOCAL GATES VERIFIED ON FEATURE BRANCH; CI/PR VERIFICATION REQUIRED BEFORE DEVELOPMENT OR STAGING PROMOTION.**

- consolidated verified business/founder identity references, logo/image metadata and current REA/LinkedIn profile URLs
  in the site configuration; connected the website, business and founder with stable JSON-LD identifiers rather than
  creating disconnected schema entities on each page
- changed the default organization schema to the more specific `RealEstateAgent` type without adding an unverified street
  address, rating, award, service price or performance claim
- production robots policy now explicitly permits `OAI-SearchBot`, `Claude-SearchBot` and `Claude-User` while preserving
  the `/api/` and `/preview/` exclusions for every group; staging remains a blanket `Disallow: /`
- Googlebot remains covered by the ordinary production wildcard policy; no `Google-Extended` or model-training crawler
  permission was invented as a supposed prerequisite for Gemini search visibility
- added unit contracts for verified entity profiles, discovery-crawler groups, internal-path exclusions and the complete
  staging block
- this improves crawl eligibility and entity clarity; it cannot guarantee a ranking or inclusion in Google AI results,
  ChatGPT, Claude or Gemini. Production Search Console, Google Business Profile, Bing Webmaster/IndexNow, crawl logs,
  referrals and qualified leads must be measured after cutover
- pinned Node `22.23.2` / npm `10.9.8` local gates passed: 52/52 unit tests, Astro typecheck with zero errors/warnings/hints,
  ESLint, full Prettier check, production build and isolated staging build
- inspected built output rather than relying only on source assertions: production emitted all three explicit discovery
  groups, retained `/api/` and `/preview/` exclusions and emitted the production sitemap; staging emitted only
  `User-agent: *` / `Disallow: /`, a staging canonical and `noindex,nofollow`
- an initial all-project local Playwright invocation ran four workers and produced full-page screenshot timeouts under
  visual-capture contention; it was stopped after the repeatable pattern was established rather than misreported as an
  application failure or hidden with retries
- the exact 12 representative desktop/mobile Chromium visual captures then passed with one worker and the unchanged
  30-second test limit; complete CI Chromium/Firefox/WebKit jobs remain the required remote merge evidence

### GrowthEngine positioning and accessibility refinement — 30 August 2026

Status: **MERGED TO DEVELOPMENT, CI VERIFIED AND STAGING DEPLOYED. Production remains untouched.**

- reviewed a representative current Melbourne property-management set (TTS, Wolfbrook, Smart Property Manager, EZPZ,
  Belle Maison, ANF, 8 Miles, Ryan Property, Ritz and MP Property) plus current Consumer Affairs Victoria guidance
- confirmed that “boutique”, “personal”, “premium”, “direct access” and appraisal promises are crowded category language;
  did not copy competitor numbers, reviews, fees or performance claims
- added `ManagementComparison.astro` to the switch journey: five observable questions covering accountability, rent
  evidence, inspection follow-through, maintenance visibility and a controlled handover; the page links to current CAV
  guidance, which recommends researching agents and speaking with at least two or three locally
- added a switching-journey browser contract test and expanded the accessibility route list to all public routes
- the expanded a11y run initially found a real pre-existing WCAG color-contrast issue on `/for-renters/` (three step
  markers, 3.18:1); replaced opacity-based text with the high-contrast `--gold-deep` token and rebuilt; targeted rerun
  passed on desktop/mobile Chromium, desktop Firefox, desktop WebKit and mobile WebKit (5/5)
- local gates after the fix: `npm test` (50/50), ESLint, Prettier check, production build and staging build all passed
  (Astro diagnostics 0 errors, 0 warnings, 0 hints)
- full cross-browser public-route contract after the refinement: 127 passed, 3 intentional desktop-only navigation skips
  across 130 tests
- visual-review captures for six key journeys at desktop and mobile Chromium: 12/12 passed; switch-page capture reviewed
  for hierarchy, responsive flow, contrast and CTA clarity
- existing supplied property photography remains in use; no artificial property imagery or unlicensed stock was added
- competitor source URLs and the positioning decision are recorded in `docs/COMPETITOR_POSITIONING_2026.md`
- PR #4 merged into protected `development` as commit `6132333c08653866ae076e069abfb16e3106a6da`; GitHub CI run
  `33313073036` passed quality/Chromium, desktop Firefox, desktop WebKit and mobile WebKit jobs
- exact merged commit deployed to isolated staging Worker `sp-rebirth-staging`; deployment version
  `46bed1f0-cc22-4c00-a99a-b6483c185ef1` is at 100% with `fetch, queue`, staging Queue binding, static assets and
  staging-only variables
- direct HTTPS smoke passed for `/`, `/switch-property-managers/` and `/resources/forms-and-guidance/` (200, staging
  canonical); comparison/CAV link, official forms link and withholding boundary were present; `/robots.txt` remains
  `Disallow: /`; `/sitemap.xml` remains 404

Required next action is deployed staging UAT against real approved lead-delivery credentials/destination, followed by the
separate production resource, content/legal, WordPress backup/cutover and explicit promotion gates. No production Worker,
custom domain, DNS, WordPress site or live lead destination has been mutated.

### Forms and guidance surface — 29 August 2026

Status: **STAGING DEPLOYED AND PR CI VERIFIED; supplied legacy originals remain withheld.**

- added the public route `/resources/forms-and-guidance/` and linked it from `/resources/`
- linked current Consumer Affairs Victoria pages for rental applications, pet requests, renter notices, smoke alarms,
  repairs, minimum-standards checklist and the CAV forms-and-publications index
- marked the page as general information only, with the checked-on date and an explicit instruction to use the current
  official source for forms, evidence, delivery and timeframes
- did not publish or submit any Sana-provided DOCX/PDF originals, legacy agency-branded templates, completed personal
  information, pet decisions, notices to vacate or VCAT filings
- stated the remaining approval boundary for Sana-specific forms, policies, fees, package content and downstream workflows
- added the route to the public browser-route contract and kept staging's effective `noindex,nofollow` policy intact
- local gates passed after the change: `npm test` (49/49), ESLint, Prettier format check and staging build (Astro: 0
  errors, 0 warnings, 0 hints)
- complete public-route browser matrix passed: 122 passed across desktop/mobile Chromium, desktop Firefox, desktop WebKit
  and mobile WebKit; three desktop-only mobile-navigation tests were intentionally skipped
- deployed to isolated Worker `sp-rebirth-staging`, version `cc13d1f8-e7cc-421d-9017-8f61b9610437`; account-side version
  inspection confirms `fetch` and `queue` handlers, static assets, the staging-only Queue binding and staging variables
- direct HTTPS smoke for `/resources/forms-and-guidance/`: `200`, correct staging canonical URL, `noindex,nofollow`, official
  CAV forms link present and legacy-document withholding boundary present
- GitHub Actions run `33236898191` for commit `a4e10cb9238231a76ed5ddf381b3217faf45de99`: **success** — dependency
  audit, 49 unit tests, Astro typecheck, ESLint, full-repository Prettier check, production and Studio builds, Wrangler
  dry-run, Chromium QA, desktop Firefox, desktop WebKit and mobile WebKit all passed

The browser connector was unavailable in this session; the route is covered by local build/typecheck and the existing
cross-browser suite, and still requires staging-specific browser/UAT against the deployed URL after redeploy.

### Protected release topology — 29 August 2026

Status: **CONFIGURED; workflow credentials and production promotion remain intentionally unexecuted.**

- `development` and `main` now require the four CI checks (quality/Chromium, desktop Firefox, desktop WebKit and mobile
  WebKit), up-to-date branches, linear history and resolved conversations; force pushes and branch deletion are disabled,
  with protections enforced for administrators too
- the existing `staging` GitHub environment is restricted to the `development` branch; its workflow now also refuses to
  run from another ref
- created a separate `production` GitHub environment, restricted to `main`, with an explicit environment approval gate
  before the manual production deployment job can access its environment
- added a main-only, manually dispatched production workflow and deterministic production build wrapper; production build
  uses only `PUBLIC_DEPLOY_ENV=production` and the canonical `https://www.sanapatel.com.au` origin
- added `/resources/forms-and-guidance/` to the explicitly curated production index surface; the verified production
  bundle has that canonical URL, the official CAV link and no `noindex` meta tag
- no staging or production environment deployment credentials are currently configured in GitHub, so neither automated
  deployment workflow can be started successfully yet
- no production Worker, custom domain, DNS, WordPress, customer data path or cutover routing was changed

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

Still open after this wave: protected branch/environment configuration; staging Turnstile keys, runtime secrets and an approved downstream destination; retry/DLQ replay and idempotency proof; separately verified production resources; final CMS/analytics/CRM/review/legal approvals; WordPress backup, asset cutover and rollback drill; and the explicit production promotion gate.

### Isolated staging infrastructure — 29 August 2026

Status: **STAGING WORKER AND QUEUE BOUNDARIES DEPLOYED; LEAD DELIVERY AND PRODUCTION GATES OPEN.**

- created Queue `sp-rebirth-staging-leads` (account resource ID `ca681a19c01c485cbc7d2c037c1edd02`)
- created Dead Letter Queue `sp-rebirth-staging-leads-dlq` (account resource ID `90cc55c67e004c7ba98921c05f8aa968`)
- deployed Worker `sp-rebirth-staging`, version `ea9a8f9e-9bc2-4314-860a-84bb19d91b91`, with 100% traffic to that version
- account-side version inspection confirmed handlers `fetch, queue`, producer binding `LEAD_QUEUE`, static `ASSETS`, `PUBLIC_DEPLOY_ENV=staging`, and `LEAD_DELIVERY_MODE=queue`
- consumer policy is bounded to one-message batches, one concurrent invocation, three retries, 15-second retry delay and the verified staging DLQ
- live HTTP smoke checks passed: home `200`, staging canonical URL, crawl-blocking `robots.txt`, absent `sitemap.xml` (`404`), and thank-you `no-store`, HSTS and `noindex` headers
- synthetic lead probe was rejected with `verification_required` before queue acceptance because Turnstile is intentionally not configured yet

Staging URL: `https://sp-rebirth-staging.rajputrupali138.workers.dev/`.

The in-app browser connector was unavailable in this session; the live smoke evidence above was collected through direct HTTPS requests and account-side Wrangler inspection. Full browser QA remains covered by the green GitHub matrix, while staging-specific browser/UAT still needs to run against this deployed URL.

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

## Trustindex / Google proof — connected and staged for integration

Verified in Sana's authenticated Trustindex account on 1 September 2026:

- company: `Sana Patel Real Estate`
- package shown by Trustindex: `Single package`
- connected review platform: Google
- company URL: `https://www.sanapatel.com.au`
- public Trustindex summary: `https://www.trustindex.io/reviews/www.sanapatel.com.au`
- Google Place ID: `ChIJ56JfW3H5QQcRERAx5fE3MgM`
- dashboard snapshot at review time: `5.0` from `33 reviews`; this is dated evidence, not a value to hard-code
- one existing website widget: `Slider I. - with header`, internal record `789687`, public widget ID
  `3c2a66b785b296885c763bd7b28`
- widget last-saved value shown by Trustindex: `2026.08.31. 14:56`
- live embed contract:
  `<script defer async src='https://cdn.trustindex.io/loader.js?3c2a66b785b296885c763bd7b28'></script>`
- widget settings observed: all review ratings, all review languages, English interface, review photos enabled, verified
  source enabled, Trustindex verification enabled, lazy loading enabled and rich snippets disabled
- public widget payload contained ten current Google review cards at inspection time and linked each card back to the
  Google source; reviewer text has not been copied into repository source
- the connected WordPress site has no active Trustindex plugin and its current public homepage did not expose a
  Trustindex embed; this GrowthEngine integration is isolated from the live WordPress site

Implemented on the Trustindex proof branch:

- one homepage review-proof section using the existing public widget rather than creating a duplicate
- a server-rendered direct Google source link that remains useful when JavaScript, Trustindex or reviewer avatars are
  blocked
- no hard-coded rating/count and no self-serving `aggregateRating` or review JSON-LD
- exact Content Security Policy allowances for `cdn.trustindex.io` and the currently observed
  `lh3.googleusercontent.com` reviewer-image origin; no wildcard Trustindex allowance
- explicit pre-launch privacy disclosure for Trustindex CDN content and Google-hosted reviewer images
- tests for configuration, source fallback, vendor failure and CSP alignment
- a first-party intersection boundary that defers the third-party loader until the review panel approaches the viewport;
  this preserves the initial page path while still activating Trustindex's own lazy widget reliably
- a branded connecting state plus a direct Google-source fallback when the vendor script or network is unavailable

Verified locally against the live Trustindex service on 1 September 2026:

- the initial Trustindex loader, current widget payload, widget stylesheet, verification graphics, Google artwork,
  reviewer avatars and Trustindex font assets all returned successfully during the final run
- the live widget rendered one active instance in desktop Chromium, mobile Chromium, desktop Firefox, desktop WebKit
  and mobile WebKit: `5/5` configurations passed
- the loaded review section passed the automated WCAG 2.0/2.1/2.2 A/AA scan in all five configurations
- the desktop carousel control was keyboard focusable; the narrow touch layout intentionally rendered a single card
  without requiring a desktop-only next control
- the first live inspection found that Trustindex's own lazy loader waited for user activity after the host entered the
  page; the first-party intersection boundary fixed that root cause rather than adding a timeout or weakening a test
- the same inspection found a blocked Trustindex stylesheet preload to `fonts.googleapis.com`; the policy now permits
  that exact origin in `connect-src`, and the five-configuration rerun passed
- deterministic visual-regression captures deliberately preserve the branded connecting state and do not depend on a
  third-party response; the separate opt-in live-provider suite proves the external rendering path

PR CI follow-up on 1 September 2026:

- workflow run `33505854345` passed the complete quality/build/Chromium job, desktop WebKit and mobile WebKit
- desktop Firefox rendered the complete `/privacy/` page but twice exceeded the 30-second navigation boundary while
  two Firefox pages were sharing the local test server; the retained failure screenshot and page snapshot both showed
  the finished page, so this is recorded as test-host contention rather than an application pass
- a local repeated two-worker Firefox reproduction passed `/privacy/` and then stalled on a different resources route,
  independently confirming that the route was not the root cause
- the workflow now runs the unchanged Firefox suite with one worker, matching the already-established serialised local
  evidence; WebKit keeps two workers, and no retries, timeout inflation, assertion weakening or coverage reduction was
  introduced
- the complete local desktop Firefox run at one worker passed: 54 passed and 8 intentional skips across accessibility,
  growth-event privacy, public-route structure, conversion journeys, security/indexing contracts and lead-flow behavior
- a replacement GitHub Actions run and an all-green branch result remain required before merge

Release rules:

- Trustindex remains the owner of refresh timing and the website must continue to display source-loaded values
- re-check the widget payload, rating/count, account status, source link, privacy wording and network origins immediately
  before production promotion
- the existing account's public company description and `Product` rich-snippet setting require a separately approved
  Trustindex-profile correction; neither has been silently changed
- Google does not award review-star search features to self-serving LocalBusiness/Organization reviews on the business's
  own site, including reviews delivered by a third-party widget; do not enable Trustindex rich snippets to imply otherwise
- treat the carousel as trust/conversion content, not as a guarantee of search ranking or conversion uplift

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
