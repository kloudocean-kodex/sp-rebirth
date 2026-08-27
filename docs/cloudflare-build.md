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
- Preview deploy for non-production branches: Cloudflare Workers Builds default `npx wrangler versions upload`
- Worker entrypoint: `src/worker.ts` through `wrangler.jsonc`

The repository deploy script deliberately disables Wrangler automatic resource provisioning and automatic draft-binding creation:

```text
wrangler deploy --experimental-provision=false --experimental-auto-create=false
```

This is a release safety boundary. Queue, DLQ and other bound resources must be verified and deliberately provisioned in the intended Cloudflare account before deployment rather than being silently created from a misspelled or guessed configuration.

The custom Worker entrypoint delegates HTTP traffic to Astro's official Cloudflare `handle()` function and also exposes a Queue consumer handler. This follows the current Astro Cloudflare adapter custom-entrypoint API rather than replacing Astro routing with a hand-rolled server.

## Cloudflare Workers Builds settings

After `package-lock.json` is committed, configure:

- **Root directory:** `/`
- **Production branch:** `main`
- **Build variable:** `SKIP_DEPENDENCY_INSTALL=1`
- **Build command:** `npm ci --no-audit --no-fund && npm run build`
- **Deploy command:** `npx wrangler deploy --experimental-provision=false --experimental-auto-create=false`

This disables Cloudflare's automatic dependency installer so GitHub CI and Cloudflare use the same npm lockfile and install semantics. The deploy flags independently prevent automatic resource provisioning or draft-binding creation during an intentional deployment.

Do not configure `PUBLIC_DEPLOY_ENV=production` on a preview/staging Worker. Public pages default to `noindex,nofollow`, `robots.txt` blocks crawling, and `sitemap.xml` is unavailable until production is deliberately enabled.

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

Do **not** invent Queue or DLQ names and do not let automatic resource provisioning silently create production infrastructure in the wrong Cloudflare account. First verify the connected account and existing Worker resources, deliberately create or verify the staging Queue and DLQ, then deploy with automatic provisioning disabled.

Before the Queue binding is committed:

1. verify the intended Cloudflare account
2. verify the Worker/script naming and staging strategy
3. create a staging Queue and staging DLQ
4. configure consumer retry/DLQ policy
5. bind the Queue as `LEAD_QUEUE`
6. perform a non-provisioning Wrangler dry-run
7. deploy with `--experimental-provision=false --experimental-auto-create=false`
8. perform synthetic non-customer end-to-end delivery proof
9. deliberately force downstream failure and prove retry + DLQ behavior
10. replay/recover the synthetic lead without duplicate downstream contact
11. only then mirror the proven configuration for production

## Release rule

A Cloudflare deployment is not considered releasable merely because it built successfully. Promotion requires the repository release gates, including tests, typecheck, production build, staging QA, accessibility, SEO/crawl validation, lead-delivery proof, Queue/DLQ recovery proof, redirect verification, privacy/data-flow review, and explicit production approval.
