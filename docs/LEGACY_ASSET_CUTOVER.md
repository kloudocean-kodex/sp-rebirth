# Legacy media cutover inventory

Purpose: prevent the new SP_REBIRTH site from becoming visually broken when the legacy WordPress runtime or hosting arrangement is retired.

Status: **PARTIALLY VERIFIED against the connected production WordPress CMS; final media destination, backup/restore proof and post-cutover availability remain release gates.**

## Verified production WordPress inventory — 28 August 2026

Read-only checks against the connected live WordPress installation established:

- the production front page is WordPress page ID `10` and resolves to `/`
- the permalink structure is `/%postname%/`
- there are exactly seven published pages: `/`, `/about/`, `/lease/`, `/contact/`, `/for-rental-providers/`, `/for-renters/` and `/sale/`
- there are no published WordPress posts
- the production media library contains 112 attachment records
- all 11 WordPress upload assets currently referenced by the Astro launch surface were found as production media attachments with the expected image MIME types

Route preservation consequence:

- `/`, `/about/`, `/lease/`, `/contact/`, `/for-renters/` and `/sale/` retain their legacy public paths in SP_REBIRTH
- the one changed published WordPress page path, `/for-rental-providers/`, is already covered by the committed permanent redirect to `/rental-providers/`
- this closes the known published WordPress page-slug inventory; Search Console, backlink and analytics evidence may still reveal historical or externally linked URLs that are not represented by current published pages

These checks were read-only. No WordPress page, media item, theme, plugin, setting or production content was changed.

## Why this is a release gate

The Astro/Workers application still references media directly from `https://www.sanapatel.com.au/wp-content/uploads/...`.

That dependency is currently valid by design because the legacy WordPress site remains live. It becomes a cutover risk if DNS, routing, origin hosting or WordPress retention changes before the media is either migrated or deliberately preserved.

Three dependencies are site-wide:

- the Sana Patel Real Estate logo in `SiteHeader.astro` is served from the legacy WordPress upload origin on every page
- `SITE.favicon` preserves the existing approved WordPress Site Icon and is served from the legacy upload origin in browser chrome
- `SITE.defaultOgImage` is served from the legacy WordPress upload origin and is inherited by pages that do not provide a page-specific social image

A successful application deployment is therefore **not** proof that legacy WordPress can be decommissioned safely.

## Observed launch-surface dependencies

| #   | Legacy asset                                                                                           | Observed use                                     | Cutover status                                                                   |
| --- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------ | -------------------------------------------------------------------------------- |
| 1   | `https://www.sanapatel.com.au/wp-content/uploads/2025/07/Sana-Patel-Logo.webp`                         | site header / brand on every page                | verified in WP media; migration/preservation required; approved master preferred |
| 2   | `https://www.sanapatel.com.au/wp-content/uploads/2025/07/favicon.jpg`                                  | approved WordPress Site Icon / browser favicon   | verified in WP media; migration/preservation required                            |
| 3   | `https://www.sanapatel.com.au/wp-content/uploads/2025/07/home-interior_413970226.webp`                 | homepage static hero and `SITE.defaultOgImage`   | verified in WP media; migration/preservation required                            |
| 4   | `https://www.sanapatel.com.au/wp-content/uploads/2025/07/for-owners_2624278291.webp`                   | `/rental-providers/` hero                        | verified in WP media; migration/preservation required                            |
| 5   | `https://www.sanapatel.com.au/wp-content/uploads/2025/09/WhatsApp-Image-2025-09-30-at-1.13.01-PM.jpeg` | `/about/` hero                                   | verified in WP media; migration/preservation required                            |
| 6   | `https://www.sanapatel.com.au/wp-content/uploads/2025/07/Sana-headshot.webp`                           | `/about/` founder image and `/contact/` hero     | verified in WP media; migration/preservation required                            |
| 7   | `https://www.sanapatel.com.au/wp-content/uploads/2025/07/home-interior_1892310928.webp`                | `/rental-appraisal/` hero and `/resources/` hero | verified in WP media; migration/preservation required                            |
| 8   | `https://www.sanapatel.com.au/wp-content/uploads/2025/07/Sana-Pate_371781052.webp`                     | `/switch-property-managers/` hero                | verified in WP media; migration/preservation required                            |
| 9   | `https://www.sanapatel.com.au/wp-content/uploads/2025/07/lease-banner_2292016801.webp`                 | `/lease/` hero                                   | verified in WP media; migration/preservation required                            |
| 10  | `https://www.sanapatel.com.au/wp-content/uploads/2025/07/for-tenants-banner_2571182183.webp`           | `/for-renters/` hero                             | verified in WP media; migration/preservation required                            |
| 11  | `https://www.sanapatel.com.au/wp-content/uploads/2025/08/Sale_552591889.webp`                          | `/sale/` hero                                    | verified in WP media; migration/preservation required                            |

The shared CSS files inspected for this checkpoint do not introduce additional URL-based image backgrounds. `InnerHero.astro` simply renders the image URL supplied by each page.

## Homepage media intentionally retired from the new application

The following legacy assets remain on the existing WordPress site but are no longer intended to be dependencies of the Astro homepage after the static-hero change:

- `https://www.sanapatel.com.au/wp-content/uploads/2025/09/WhatsApp-Image-2025-09-30-at-1.02.56-PM.jpeg`
- `https://www.sanapatel.com.au/wp-content/uploads/2025/09/WhatsApp-Video-2025-09-30-at-1.22.28-PM-1.mp4`

Do not delete them from WordPress merely because the new application stops referencing them; the live legacy site may still use them until cutover.

## What is not yet proven

- whether every historical/search/backlink URL outside the seven currently published WordPress pages has been inventoried
- whether every legacy media URL will remain routable after the final Cloudflare/DNS cutover
- whether the legacy hosting account will be retained after WordPress is retired
- whether a restorable production WordPress backup has been independently verified and restore-tested
- whether each source asset is the highest-quality approved master
- whether final media should live as repository static assets, Sanity assets, another approved asset store, or a deliberately retained legacy path
- whether a final Melbourne-specific aerial or other premium homepage master will replace the interim owned static hero
- whether the final asset strategy changes CSP `img-src` / `media-src` requirements

Do not infer any of those answers from the current source references or the production media-library inventory.

## Safe migration sequence

Before production cutover or legacy WordPress retirement:

1. obtain/verify the approved source file for every active asset above
2. verify usage rights and that the selected file is the intended final-quality version
3. select the final media destination deliberately
4. migrate one canonical copy of each unique asset; do not create unnecessary duplicates for repeated page use
5. update source references on `development`
6. update CSP only if the chosen trusted asset origin requires it
7. run unit/type/build/Wrangler/browser/accessibility gates
8. browser-test every indexed launch page at desktop and mobile sizes
9. verify logo, favicon, hero images, lazy images and social-preview image URLs return successfully from the new/preserved origin
10. verify the final production host can serve those assets independently of the WordPress application lifecycle
11. verify a restorable WordPress backup and a practical rollback path
12. only then permit the legacy upload origin to be removed, redirected or decommissioned

## Release rule

**Do not retire, block or repoint the legacy WordPress media path while any production SP_REBIRTH response still depends on it.**

If migration cannot be completed before cutover, continued availability of the exact `/wp-content/uploads/...` paths must be an explicitly verified part of the cutover architecture—not an assumption.
