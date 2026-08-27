/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_SANITY_PROJECT_ID?: string;
  readonly PUBLIC_SANITY_DATASET?: string;
  readonly PUBLIC_SANITY_STUDIO_URL?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
  readonly PUBLIC_GA_MEASUREMENT_ID?: string;
  readonly PUBLIC_GTM_CONTAINER_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
