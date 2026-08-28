# Legacy media cutover inventory

Purpose: prevent the new SP_REBIRTH site from becoming visually broken when the legacy WordPress runtime or hosting arrangement is retired.

Status: **OBSERVED IN DEVELOPMENT SOURCE — migration target and post-cutover availability are not yet verified.**

## Why this is a release gate

The Astro/Workers application still references media directly from `https://www.sanapatel.com.au/wp-content/uploads/...`.

That dependency is currently valid by design because the legacy WordPress site remains live. It becomes a cutover risk if DNS, routing, origin hosting or WordPress retention changes before the media is either migrated or deliberately preserved.

Two dependencies are site-wide:

- the Sana Patel Real Estate logo in `SiteHeader.astro` is served from the legacy WordPress upload origin on every page
- `SITE.defaultOgImage` is served from the legacy WordPress upload origin and is inherited by pages that do not provide a page-specific social image

A successful application deployment is therefore **not** proof that legacy WordPress can be decommissioned safely.

## Observed launch-surface dependencies

| # | Legacy asset | Observed use | Cutover status |
|---|---|---|---|
| 1 | `https://www.sanapatel.com.au/wp-content/uploads/2025/07/Sana-Patel-Logo.webp` | site header / brand on every page | migration/preservation required |
| 2 | `https://www.sanapatel.com.au/wp-content/uploads/2025/09/WhatsApp-Image-2025-09-30-at-1.02.56-PM.jpeg` | homepage hero poster and `SITE.defaultOgImage` | migration/preservation required |
| 3 | `https://www.sanapatel.com.au/wp-content/uploads/2025/09/WhatsApp-Video-2025-09-30-at-1.22.28-PM-1.mp4` | homepage hero video | migration/preservation required |
| 4 | `https://www.sanapatel.com.au/wp-content/uploads/2025/07/for-owners_2624278291.webp` | `/rental-providers/` hero | migration/preservation required |
| 5 | `https://www.sanapatel.com.au/wp-content/uploads/2025/09/WhatsApp-Image-2025-09-30-at-1.13.01-PM.jpeg` | `/about/` hero | migration/preservation required |
| 6 | `https://www.sanapatel.com.au/wp-content/uploads/2025/07/Sana-headshot.webp` | `/about/` founder image and `/contact/` hero | migration/preservation required |
| 7 | `https://www.sanapatel.com.au/wp-content/uploads/2025/07/home-interior_1892310928.webp` | `/rental-appraisal/` hero and `/resources/` hero | migration/preservation required |
| 8 | `https://www.sanapatel.com.au/wp-content/uploads/2025/07/Sana-Pate_371781052.webp` | `/switch-property-managers/` hero | migration/preservation required |
| 9 | `https://www.sanapatel.com.au/wp-content/uploads/2025/07/lease-banner_2292016801.webp` | `/lease/` hero | migration/preservation required |
| 10 | `https://www.sanapatel.com.au/wp-content/uploads/2025/07/for-tenants-banner_2571182183.webp` | `/for-renters/` hero | migration/preservation required |
| 11 | `https://www.sanapatel.com.au/wp-content/uploads/2025/08/Sale_552591889.webp` | `/sale/` hero | migration/preservation required |

The shared CSS files inspected for this checkpoint do not introduce additional URL-based image backgrounds. `InnerHero.astro` simply renders the image URL supplied by each page.

## What is not yet proven

- whether every legacy URL will remain routable after the final Cloudflare/DNS cutover
- whether the legacy hosting account will be retained after WordPress is retired
- whether each source asset is the highest-quality approved master
- whether final media should live as repository static assets, Sanity assets, another approved asset store, or a deliberately retained legacy path
- whether the homepage video should be migrated unchanged or re-encoded after measured performance testing
- whether the final asset strategy changes CSP `img-src` / `media-src` requirements

Do not infer any of those answers from the current source references.

## Safe migration sequence

Before production cutover or legacy WordPress retirement:

1. obtain/verify the approved source file for every asset above
2. verify usage rights and that the selected file is the intended final-quality version
3. select the final media destination deliberately
4. migrate one canonical copy of each unique asset; do not create unnecessary duplicates for repeated page use
5. update source references on `development`
6. update CSP only if the chosen trusted asset origin requires it
7. run unit/type/build/Wrangler/browser/accessibility gates
8. browser-test every indexed launch page at desktop and mobile sizes
9. verify logo, hero posters, video fallback, lazy images and social-preview image URLs return successfully from the new/preserved origin
10. verify the final production host can serve those assets independently of the WordPress application lifecycle
11. only then permit the legacy upload origin to be removed, redirected or decommissioned

## Release rule

**Do not retire, block or repoint the legacy WordPress media path while any production SP_REBIRTH response still depends on it.**

If migration cannot be completed before cutover, continued availability of the exact `/wp-content/uploads/...` paths must be an explicitly verified part of the cutover architecture—not an assumption.
