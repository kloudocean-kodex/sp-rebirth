# SP_REBIRTH Design System

Status: design system v2.1 — 3 September 2026 client-feedback refinement

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

Sana's 3 September 2026 feedback adds a second requirement: the interface must feel **graphically confident without requiring a lot of reading**. Her priority RISE with Sarah Cincotta reference is therefore translated as strong dark/light contrast, founder-led cut-out composition and restrained gold emphasis—not as permission to reproduce that site's navigation depth, content volume or brand devices.

## Typography

### Editorial display — Newsreader

Use for selected h2–h4 headings, pull quotes and editorial emphasis where warmth and human authority matter.

Why:

- designed for continuous on-screen reading
- sophisticated without looking ceremonial
- optical-size axis supports both large display and smaller editorial headings
- variable weights allow fine hierarchy without loading many static files
- real italics are available for occasional editorial emphasis

Rules:

- large editorial display: weight 320–380
- h2: weight 360–430
- h3/h4: weight 430–520
- `font-optical-sizing: auto`
- negative tracking only at large sizes
- avoid all-caps Newsreader

### Direct display / functional — DM Sans

Use for body copy, navigation, labels, buttons, forms and metadata. After Sana's 3 September feedback it may also be used for the homepage hero, direct-contact statements and other short high-impact headings where immediate clarity is more important than editorial mood.

Why:

- clean and contemporary without the strong “software UI” character of Inter
- strong readability for mobile forms and navigation
- a heavier display treatment creates the graphic confidence Sana responded to in the RISE reference without copying its typography

Rules:

- body: 400–450
- navigation/buttons/labels: 600–700
- direct display: 620–700 with tight but legible tracking
- never use ultra-light body copy
- uppercase labels use restrained tracking; avoid wide-spaced luxury clichés
- do not turn every heading into bold sans; preserve contrast between direct and editorial moments

### Loading policy

Phase 1: Google Fonts stylesheet with early preconnect and `display=swap`, limited to the two required families and useful weight ranges.

Phase 2 before production cutover: self-host/subset WOFF2 if the asset pipeline permits it and performance testing demonstrates a worthwhile gain. Do not preload every font. Preload only a proven critical font resource.

Fallbacks must remain visually acceptable so text is always usable before fonts finish loading.

## Colour system

### Core neutrals

- Ink: `#171713` — primary dark surface and highest-emphasis text
- Ink soft: `#45443E` — body copy / secondary text on light surfaces
- Limestone: `#F7F2E8` — primary warm reading background
- Parchment: `#ECE3D5` — section contrast / form surrounds
- Porcelain: `#FFFDF8` — clean white-adjacent reading fields and cards

### Metals

- Brass: `#B89A60` — decorative rules, hairlines, selected dark-surface accents
- Champagne: `#D7C39A` — dark-surface secondary accents and selected high-contrast CTA treatment
- Bronze: `#6D532C` — accessible interactive accent on light surfaces and primary CTA base
- Bronze hover: `#59421F` — deeper interaction state

### 3 September client direction — black / white / golden

The site may intentionally read at first glance as **black + white + gold**, reflecting Sana's explicit preference, while retaining the warm neutrals required for comfortable reading.

Translation rules:

- near-black may dominate the header, hero and selected anchor/contact bands
- porcelain/limestone remain the dominant long-form reading fields
- champagne/brass/gold is one accent family, not a third text hierarchy
- use gold for rules, halos, selected CTAs and framing—not for paragraphs on light backgrounds
- no bright yellow-gold, fake metallic gradients on text or generic “luxury agent” black/gold saturation

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
- organic arches/circles are reserved primarily for founder photography and occasional visual framing; do not turn every card into a blob

## Spacing and composition

- preserve generous whitespace, but never at the cost of unclear hierarchy
- section rhythm should alternate open white/ivory fields with decisive dark anchor bands
- primary content containers remain approximately 78rem; cinematic sections may use 92rem
- copy measures: body 60–72 characters where practical; lead copy 38–48rem
- use asymmetric grids where founder storytelling benefits from it
- a visitor should be able to understand each section from its heading before reading the supporting paragraph
- the homepage must not require exploratory clicking to discover the basic service proposition

## Imagery

Sana is the human differentiator. Founder photography should feel observational and confident rather than over-staged.

Sana explicitly rejected the current website photograph set on 3 September 2026. Those photographs are not the target visual direction for the redesigned primary experience.

Property/lifestyle imagery should:

- feel distinctly Melbourne where possible
- prioritise architecture, material, light and lived-in detail
- avoid generic stock-agent handshakes and key handovers
- preserve original photographs; do not AI-rebuild Sana or misrepresent properties

### Founder cut-out / portrait treatment

The RISE reference clarified a client preference for portrait compositions that break out of ordinary rectangles.

Use:

- real approved Sana portraits designed for clean cut-outs
- arches, circles or restrained organic masks
- simple gold halos/rules or warm graphic fields behind the portrait
- negative space that allows short copy to sit confidently beside the person

Do not:

- generate a synthetic Sana likeness and present it as founder proof
- over-retouch Sana into an artificial/influencer aesthetic
- use another person's portrait as if it were Sana

Until the new founder shoot exists, staging/concept work may use clearly labelled non-evidentiary generated or illustrated placeholders. Those placeholders must be replaced before production.

Cinematic video is optional enhancement, never required for comprehension or conversion.

### Media authenticity and sourcing

- first choice for people and service proof: genuine, approved Sana/team/client/property media with documented consent
- first choice for location atmosphere: correctly identified Melbourne imagery from an approved licensed source, stored on the chosen SP_REBIRTH asset origin rather than hotlinked
- generated media may support mood boards, textures or clearly non-evidentiary concept review, but must not fabricate Sana, a client, a managed property, an inspection, a result or a testimonial
- record creator/source/licence and download date for every stock asset retained for production review
- produce responsive AVIF/WebP/JPEG derivatives with explicit dimensions; keep an email-compatible PNG/SVG logo master separate from web-only formats
- do not add imagery merely to fill space. Each visual should establish person, place, process, proof or useful context

### Video contract

- the primary founder video should be a real 45–60 second Sana introduction, not an AI avatar or generic stock montage
- use a simple structure: owner problem, Sana's operating approach, observable promise, low-pressure next step
- add accurate captions/transcript, poster image, keyboard-accessible controls and a non-video path to the same content
- licensed drone/property B-roll may support the founder narrative but must not imply portfolio ownership or a service result
- never autoplay audible media; defer optional video, preserve the static homepage hero contract and skip motion for reduced-motion users
- validate mobile data cost, poster rendering, captions, controls, LCP/INP and layout stability before release

## Motion

Motion should signal polish, not demand attention.

- 160–240ms for hover/focus transitions
- no scroll-jacking
- no mandatory entrance animation before content can be read
- honour `prefers-reduced-motion`
- background video must not load/play for reduced-motion users

## Copy / visual hierarchy

The primary homepage hierarchy after Sana's 3 September feedback is:

1. what Sana does + where
2. direct contact / appraisal action
3. the owner's situation: manage, appraise/lease, or switch
4. why Sana / visible accountability
5. simple process / what happens next
6. current source-driven proof
7. direct contact again

Avoid generic blocks such as “Goals-driven / Responsive / Proactive” unless they are connected to observable behaviour or proof.

The homepage should remove repeated explanations of the same positioning idea. Supporting high-intent and SEO pages may provide depth for direct entrants without competing in the primary header.

## Navigation hierarchy

Primary global navigation should remain deliberately small:

- Services
- Why Sana
- Reviews
- Call Sana
- Rental Appraisal

Contextual/footer navigation preserves access to switching, About, Resources, renters, selling, privacy and other legitimate supporting routes. Diagnostic GrowthEngine tools remain available as campaign/resource assets but are not primary homepage navigation.

## CTA hierarchy

Primary homepage actions:

- Call Sana
- Request a rental appraisal

Contextual high-intent action:

- Discuss switching property managers

Secondary:

- Read Sana's background
- Read a relevant resource
- Use a diagnostic tool when the visitor deliberately chooses that path

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

- place the Trustindex carousel after the visitor already understands the service and Sana's accountability model
- frame the vendor widget inside the warm limestone system; do not restyle individual review text into fake editorial testimonials
- keep a visible Google source link outside the vendor script so the section remains coherent when JavaScript or a content blocker prevents the carousel from loading
- rating, count, reviewer names, dates, avatars and comments must remain source-driven; never repeat them as undated marketing copy
- do not put the review carousel on every page or add a floating badge unless later measurement shows a genuine user need
- do not emit self-serving review or aggregate-rating schema for the business's own reviews
- allow only the exact third-party hosts the live widget actually requires, and re-audit those hosts before production
- test desktop, mobile, keyboard, zoom, screen-reader semantics, third-party failure and performance before release

## Accessibility details

- visible skip link
- persistent keyboard focus states
- minimum usable touch target around 44px
- forms use real labels, not placeholder-only labels
- mobile navigation remains complete for the primary journey; secondary routes remain reachable without being forced into the menu
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
- hide legitimate supporting routes entirely
- turn founder-led warmth into influencer-style personal branding
- use unverified suburb/market claims for SEO
- copy RISE's exact logo treatment, typography, page layouts, acronym tiles, copy, orange palette or other proprietary brand devices
