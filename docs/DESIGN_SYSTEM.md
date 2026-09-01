# SP_REBIRTH Design System

Status: design system v2 — implementation baseline

## Brand intent

SP_REBIRTH should feel warm, assured and quietly premium. It must not look like a generic luxury-real-estate theme, an aggressive lead-funnel site, or a SaaS dashboard wearing a serif font.

The desired tension is:

- warm, not beige and bland
- premium, not flashy
- personal, not informal
- elegant, not fragile
- direct, not aggressive
- editorial, not magazine cosplay
- conversion-led, not salesy
- technically disciplined, not visibly technical

Sana Patel's original logo/wordmark is an immutable brand asset. Do not redraw, re-typeset, recolour or recreate the wordmark unless Sana explicitly approves a future brand exercise.

## Strategic visual territory

Competitor research shows that “boutique”, “personal”, “direct access” and “owner-operated” are now category language in Melbourne property management. The design therefore needs to support a more specific idea: **visible accountability**.

The visual system should make information feel calm, ordered and deliberate. Visitors should understand who is responsible, what matters, and what happens next.

## Typography

### Display — Newsreader

Use for h1–h4, selected pull quotes and editorial emphasis.

Why:

- designed for continuous on-screen reading
- sophisticated without looking ceremonial
- optical-size axis supports both large display and smaller editorial headings
- variable weights allow fine hierarchy without loading many static files
- real italics are available for occasional editorial emphasis

Rules:

- large display: weight 320–380
- h2: weight 360–430
- h3/h4: weight 430–520
- `font-optical-sizing: auto`
- negative tracking only at large sizes
- avoid all-caps Newsreader

### Functional / body — DM Sans

Use for body copy, navigation, labels, buttons, forms and metadata.

Why:

- designed for smaller text
- clean and contemporary without the strong “software UI” character of Inter
- variable weight/optical-size support
- strong readability for mobile forms and navigation

Rules:

- body: 400–450
- navigation/buttons/labels: 600–700
- never use ultra-light body copy
- uppercase labels use restrained tracking; avoid wide-spaced luxury clichés

### Loading policy

Phase 1: Google Fonts stylesheet with early preconnect and `display=swap`, limited to the two required families and useful weight ranges.

Phase 2 before production cutover: self-host/subset WOFF2 if the asset pipeline permits it and performance testing demonstrates a worthwhile gain. Do not preload every font. Preload only a proven critical font resource.

Fallbacks must remain visually acceptable so text is always usable before fonts finish loading.

## Colour system

### Core neutrals

- Ink: `#171713` — primary dark surface and highest-emphasis text
- Ink soft: `#45443E` — body copy / secondary text on light surfaces
- Limestone: `#F7F2E8` — primary page background
- Parchment: `#ECE3D5` — section contrast / form surrounds
- Porcelain: `#FFFDF8` — cards / logo plaque / clean surfaces

### Metals

- Brass: `#B89A60` — decorative rules, hairlines, selected dark-surface accents
- Champagne: `#D7C39A` — dark-surface secondary accents
- Bronze: `#6D532C` — accessible interactive accent on light surfaces and primary CTA base
- Bronze hover: `#59421F` — deeper interaction state

Metal tones are not a third text hierarchy. Light brass/champagne must not be used for small text on light backgrounds.

## Contrast policy

WCAG 2.2 AA is the floor:

- ordinary text >= 4.5:1
- large text >= 3:1
- focus indicators and meaningful UI boundaries must remain visible

Decorative metallic rules may be lower contrast because they do not carry information. Text, controls and errors may not.

## Shape language

Quiet luxury here means restraint, not excessive softness.

- small radius: 0.4rem
- medium radius: 0.8rem
- large radius: 1.2rem
- buttons: architectural rounded rectangle, not generic pill by default
- cards: subtle radius and one strong compositional edge/rule
- avoid nested rounded cards inside rounded cards

## Spacing and composition

- preserve generous whitespace, but never at the cost of unclear hierarchy
- section rhythm should alternate editorial openness with denser proof/process bands
- primary content containers remain approximately 78rem; cinematic sections may use 92rem
- copy measures: body 60–72 characters where practical; lead copy 38–48rem
- use asymmetric grids where imagery/founder storytelling benefits from it

## Imagery

Sana is the human differentiator. Founder photography should feel observational and confident rather than over-staged.

Property/lifestyle imagery should:

- feel distinctly Melbourne where possible
- prioritise architecture, material, light and lived-in detail
- avoid generic stock-agent handshakes and key handovers
- preserve original photographs; do not AI-rebuild Sana or misrepresent properties

Cinematic video is optional enhancement, never required for comprehension or conversion.

### Media authenticity and sourcing

- first choice for people and service proof: genuine, approved Sana/team/client/property media with documented consent
- first choice for location atmosphere: correctly identified Melbourne imagery from an approved licensed source, stored
  on the chosen SP_REBIRTH asset origin rather than hotlinked
- generated media may support mood boards, textures or clearly non-evidentiary atmosphere, but must not fabricate Sana,
  a client, a managed property, an inspection, a result or a testimonial
- record creator/source/licence and download date for every stock asset retained for production review
- produce responsive AVIF/WebP/JPEG derivatives with explicit dimensions; keep an email-compatible PNG/SVG logo master
  separate from web-only formats
- do not add imagery merely to fill space. Each visual should establish person, place, process, proof or useful context

### Video contract

- the primary founder video should be a real 45–60 second Sana introduction, not an AI avatar or generic stock montage
- use a simple structure: owner problem, Sana's operating approach, observable promise, low-pressure next step
- add accurate captions/transcript, poster image, keyboard-accessible controls and a non-video path to the same content
- licensed drone/property B-roll may support the founder narrative but must not imply portfolio ownership or a service
  result
- never autoplay audible media; defer optional video, preserve the current static hero and skip motion for reduced-motion
  users
- validate mobile data cost, poster rendering, captions, controls, LCP/INP and layout stability before release

## Motion

Motion should signal polish, not demand attention.

- 160–240ms for hover/focus transitions
- no scroll-jacking
- no mandatory entrance animation before content can be read
- honour `prefers-reduced-motion`
- background video must not load/play for reduced-motion users

## Copy / visual hierarchy

The page hierarchy is:

1. visitor situation / desired outcome
2. Sana's approach and differentiator
3. credible proof
4. process / what happens next
5. low-friction action

Avoid generic blocks such as “Goals-driven / Responsive / Proactive” unless they are connected to observable behaviour or proof.

## CTA hierarchy

Primary:

- Request a rental appraisal
- Discuss switching property managers

Secondary:

- Call Sana
- Explore Sana's approach
- Read a relevant resource

Do not create five competing primary CTAs on one viewport.

## Proof hierarchy

Strongest to weakest:

1. verified current client reviews
2. independently sourced performance evidence with date/source context
3. professional credentials / founder identity
4. process evidence (what Sana actually does)
5. marketing claims

Never manufacture testimonials, review counts, performance numbers or guarantees.

### Source-driven review treatment

- place the Trustindex carousel after the homepage journey choices, where proof can answer doubt without competing with
  the hero's primary action
- frame the vendor widget inside the warm limestone system; do not restyle individual review text into fake editorial
  testimonials
- keep a visible Google source link outside the vendor script so the section remains coherent when JavaScript or a
  content blocker prevents the carousel from loading
- rating, count, reviewer names, dates, avatars and comments must remain source-driven; never repeat them as undated
  marketing copy
- do not put the review carousel on every page or add a floating badge unless later measurement shows a genuine user need
- do not emit self-serving review or aggregate-rating schema for the business's own reviews
- allow only the exact third-party hosts the live widget actually requires, and re-audit those hosts before production
- test desktop, mobile, keyboard, zoom, screen-reader semantics, third-party failure and performance before release

## Accessibility details

- visible skip link
- persistent keyboard focus states
- minimum usable touch target around 44px
- forms use real labels, not placeholder-only labels
- mobile navigation remains complete
- decorative images use empty alt; meaningful images use factual alt
- 200% text zoom must not break navigation or forms

## Design anti-patterns

Do not:

- make everything black + gold
- use gold for paragraph text on ivory
- use huge serif type on every section
- use generic icon grids as filler
- add fake counters
- add auto-rotating testimonials
- use excessive glassmorphism
- hide navigation on mobile
- turn founder-led warmth into influencer-style personal branding
- use unverified suburb/market claims for SEO
