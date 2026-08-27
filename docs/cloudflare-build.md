# Cloudflare Workers build contract

SP_REBIRTH deploys to **Cloudflare Workers + Static Assets**. Cloudflare Pages is not the target runtime.

## Production branch

`main`

## Runtime / build toolchain

- Node.js: pinned by `.node-version` (`22.23.2`)
- Package manager: npm
- Dependency graph: committed `package-lock.json`
- Build: `npm run build`
- Deploy: `npx wrangler deploy`
- Preview deploy for non-production branches: Cloudflare Workers Builds default `npx wrangler versions upload`

## Cloudflare Workers Builds settings

After `package-lock.json` is committed, configure:

- **Root directory:** `/`
- **Production branch:** `main`
- **Build variable:** `SKIP_DEPENDENCY_INSTALL=1`
- **Build command:** `npm ci --no-audit --no-fund && npm run build`
- **Deploy command:** `npx wrangler deploy`

This disables Cloudflare's automatic dependency installer so GitHub CI and Cloudflare use the same npm lockfile and install semantics.

Do not configure `PUBLIC_DEPLOY_ENV=production` on a preview/staging Worker. Public pages default to `noindex,nofollow`, `robots.txt` blocks crawling, and `sitemap.xml` is unavailable until production is deliberately enabled.

## Runtime variables and secrets

Build variables are not runtime secrets. Configure runtime values separately under Worker **Variables & Secrets**.

Required before lead forms are enabled for real traffic:

- `PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `LEAD_DELIVERY_WEBHOOK_URL`
- `LEAD_DELIVERY_TOKEN`

Required for Sanity visual editing when enabled:

- `PUBLIC_SANITY_PROJECT_ID`
- `PUBLIC_SANITY_DATASET`
- `PUBLIC_SANITY_STUDIO_URL`
- `SANITY_API_READ_TOKEN`

Only at production cutover:

- `PUBLIC_DEPLOY_ENV=production`
- `PUBLIC_SITE_URL=https://www.sanapatel.com.au`

## Release rule

A Cloudflare deployment is not considered releasable merely because it built successfully. Promotion requires the repository release gates, including tests, typecheck, production build, staging QA, accessibility, SEO/crawl validation, lead-delivery proof, redirect verification, and explicit production approval.
