# Sana final visual polish wave

This branch is the isolated client-review polish wave. It preserves Sana's approved homepage hierarchy and PRIDE wording while testing a progressive cinematic Melbourne hero over the existing static-first fallback.

## Non-negotiable contracts

- Video is decorative, muted, plays inline, and loads only after the page load event on desktop where reduced motion is not requested.
- Mobile and reduced-motion paths remain static and do not request video bytes.
- The exact approved above-fold copy and CTA pair remain unchanged.
- PRIDE stays typography-led; no decorative icon grid is introduced.
- Trustindex remains source-driven with an independent Google fallback.
- Production is not authorized by this wave.

## Current media decision

The repository's existing locally-vendored Pexels Melbourne/Brighton drone footage is used as the immediate cinematic enhancement because it is already part of the project and avoids blocking the client-review wave on a generation vendor. A new AI-generated 8–10 second clip is still a candidate only if it passes temporal-coherence, performance, licensing/provenance and legibility review.

## Video-generation blocker

The connected OpenArt workspace currently has 36 credits. The cheapest available video generation configuration is 50 credits (PixVerse V6, 5s, 540p), while the preferred 10s 1080p configuration is materially more expensive. The connected Runway workspace is authenticated but currently exposes no video-generation models on its plan. Do not fabricate a generated-video result. Continue safely with the existing local footage and static fallback until video-generation entitlement or credits are available.
