# Cloudflare Workers build contract

SP_REBIRTH deploys to **Cloudflare Workers + Static Assets**. Cloudflare Pages is not the target runtime.

## Production branch

`main`

## Runtime / build toolchain

- Node.js: pinned by `.node-version` (`22.23.2`)
- Package manager: npm
- Dependency graph: committed `package-lock.json`
- Build: `npm run build`
- Deploy: `npm run deploy`
- Preview-version upload: `npm run deploy:preview`
- Worker entrypoint: `src/worker.ts` through `wrangler.jsonc`

Both repository deployment scripts deliberately disable Wrangler automatic resource provisioning and automatic draft-binding creation:

```text
wrangler deploy --experimental-provision=false --experimental-auto-create=false
wrangler versions upload --experimental-provision=false --experimental-auto-create=false
```

This is a release safety boundary. Queue, DLQ and other bound resources must be verified and deliberately provisioned in the intended Cloudflare account before deployment or preview upload rather than being silently created from a misspelled or guessed configuration.

The custom Worker entrypoint delegates HTTP traffic to Astro's official Cloudflare `handle()` function and also exposes a Queue consumer handler. This follows the current Astro Cloudflare adapter custom-entrypoint API rather than replacing Astro routing with a hand-rolled server.

## Cloudflare Workers Builds settings

After `package-lock.json` is committed, configure:

- **Root directory:** `/`
- **Production branch:** `main`
- **Build variable:** `SKIP_DEPENDENCY_INSTALL=1`
- **Build command:** `npm ci --no-audit --no-fund && npm run build`
- **Deploy command:** `npm run deploy`
- **Non-production branch deploy command:** `npm run deploy:preview`

### Current account-backed hold (28 August 2026)

The connected account currently has one Workers Builds trigger watching `main`, while its shared build variables still identify the build as `staging` and its deploy command is `npm run deploy`. That combination is an intentional pre-release hold, not a production release configuration: a future push to `main` must not be allowed to publish a staging-marked build to the Worker that is labelled production.

Before enabling or relying on automatic `main` deployments, choose and verify one of these explicit architectures:

- separate staging and production Workers with branch-appropriate variables and secrets; or
- a protected, manual production deployment workflow with an approved production environment and release gate.

Do not leave a single production-branch trigger using shared staging variables, and do not change it to production values until the domain, Queue/DLQ, Turnstile, downstream delivery, rollback and UAT gates below are complete.

Cloudflare Workers Builds exposes production and non-production deploy commands separately. Do not leave the non-production branch command at its default plain `npx wrangler versions upload` once account-backed preview builds are enabled; use the repository script so preview version uploads retain the same no-auto-provision safety boundary as production deployments.

The build command disables Cloudflare's automatic dependency installer so GitHub CI and Cloudflare use the same npm lockfile and install semantics. The deploy/upload flags independently prevent automatic resource provisioning or draft-binding creation during an intentional deployment or preview version upload.

Do not configure `PUBLIC_DEPLOY_ENV=production` on a preview/staging Worker. Public pages default to `noindex,nofollow`, `robots.txt` blocks crawling, and `sitemap.xml` is unavailable until production is deliberately enabled.

## Preview versions are not isolated staging

`wrangler versions upload` uploads a new version of a Worker and can expose that version through a preview URL, but a version preview is **not** by itself a separately isolated staging environment.

This distinction becomes critical once the Worker has stateful or external bindings such as Queues. A preview version can carry the Worker's binding configuration; therefore a browser-visible preview URL must never be treated as proof that lead-delivery testing is isolated from production resources.

Before Queue-backed staging E2E is allowed:

- establish a separately identifiable staging Worker/environment strategy in the authenticated Cloudflare account
- bind only the verified staging Queue and staging DLQ to that staging target
- keep staging runtime secrets separate from production secrets
- keep `PUBLIC_DEPLOY_ENV=staging`
- verify the resulting Worker/resource bindings from the account rather than inferring them from source
- do not perform forced-failure, retry-exhaustion or DLQ-replay tests against a preview version that shares production bindings

Cloudflare environment names, Worker names, Queue names and DLQ names must come from authenticated account inventory and the approved staging strategy. Do not invent them in repository configuration.

A version preview remains useful for code/version inspection, but it does not satisfy the project's staging-infrastructure or Queue-recovery proof gates.

## Lead transport modes

### Staging before Queue provisioning

The staging application may use the existing authenticated HTTPS webhook boundary while downstream CRM/notification integration is being proved, but only when deployment identity is explicitly staging:

- `PUBLIC_DEPLOY_ENV=staging`
- `LEAD_DELIVERY_MODE=webhook`
- `LEAD_DELIVERY_WEBHOOK_URL`
- `LEAD_DELIVERY_TOKEN`

The form still fails closed when the downstream system cannot accept the lead.

### Queue-enabled staging

After the exact Cloudflare account, Queue and Dead Letter Queue names are verified, add the Queue producer/consumer bindings to `wrangler.jsonc`, then set:

- `PUBLIC_DEPLOY_ENV=staging`
- `LEAD_DELIVERY_MODE=queue`

The lead endpoint returns success only after `LEAD_QUEUE.send()` resolves. The Queue consumer then forwards the same canonical lead envelope to the configured HTTPS downstream destination using the stable lead ID as the `Idempotency-Key` header.

Consumer behavior:

- successful downstream acceptance -> explicitly acknowledge that individual Queue message
- transient/configuration delivery failure -> retry that individual message with bounded exponential backoff
- malformed/poison message -> acknowledge without forwarding and log identifiers only, never the message body
- retry exhaustion -> Queue configuration must send the message to a verified DLQ before production relies on this path

### Production and unknown deployment identity

Synchronous webhook delivery is an **explicit staging-only** integration mode.

Application code resolves all other deployment identities to **Queue-only**, including:

- `PUBLIC_DEPLOY_ENV=production`
- a missing `PUBLIC_DEPLOY_ENV`
- an unrecognised or misspelled deployment identity

This rule applies regardless of `LEAD_DELIVERY_MODE`. If the `LEAD_QUEUE` binding is absent, the form fails closed with a configuration error rather than silently reverting to synchronous webhook delivery.

This is intentional: a forgotten or malformed deployment marker must not weaken the public 24×7 access promise into a single synchronous third-party handoff.

## Runtime variables, bindings and secrets

Build variables are not runtime secrets. Configure runtime values separately under Worker **Variables & Secrets**.

Required before lead forms are enabled for real traffic:

- `PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `LEAD_DELIVERY_WEBHOOK_URL`
- `LEAD_DELIVERY_TOKEN`

Required before Queue mode is enabled:

- Cloudflare Queue producer binding named `LEAD_QUEUE`
- Queue consumer attached to the same Worker entrypoint or an explicitly approved dedicated consumer
- Dead Letter Queue configured on the consumer
- bounded retry settings verified
- staging and production queues separated

Required for Sanity visual editing when enabled:

- `PUBLIC_SANITY_PROJECT_ID`
- `PUBLIC_SANITY_DATASET`
- `PUBLIC_SANITY_STUDIO_URL`
- `SANITY_API_READ_TOKEN`

Only at production cutover:

- `PUBLIC_DEPLOY_ENV=production`
- `PUBLIC_SITE_URL=https://www.sanapatel.com.au`

## Queue provisioning rule

Do **not** invent Queue or DLQ names and do not let automatic resource provisioning silently create production infrastructure in the wrong Cloudflare account. First verify the connected account and existing Worker resources, deliberately create or verify the staging Queue and DLQ, then deploy or upload preview versions with automatic provisioning disabled.

Before the Queue binding is committed:

1. verify the intended Cloudflare account
2. verify the Worker/script naming and staging strategy
3. create a staging Queue and staging DLQ
4. configure consumer retry/DLQ policy
5. bind the Queue as `LEAD_QUEUE`
6. perform a non-provisioning Wrangler dry-run
7. deploy/upload with `--experimental-provision=false --experimental-auto-create=false`
8. perform synthetic non-customer end-to-end delivery proof on the isolated staging Worker/resources
9. deliberately force downstream failure and prove retry + DLQ behavior on staging only
10. replay/recover the synthetic lead without duplicate downstream contact
11. only then mirror the proven configuration for production

## Release rule

A Cloudflare deployment is not considered releasable merely because it built successfully. Promotion requires the repository release gates, including tests, typecheck, production build, staging QA, accessibility, SEO/crawl validation, lead-delivery proof, Queue/DLQ recovery proof, redirect verification, privacy/data-flow review, legacy-media cutover proof, and explicit production approval.
