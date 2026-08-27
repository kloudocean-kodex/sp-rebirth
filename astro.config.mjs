import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sanity from '@sanity/astro';
import { defineConfig } from 'astro/config';

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET || 'production';

const integrations = [react()];

if (projectId) {
  integrations.unshift(
    sanity({
      projectId,
      dataset,
      apiVersion: '2026-08-27',
      useCdn: true,
      studioBasePath: '/studio',
      stega: {
        studioUrl: '/studio',
      },
    }),
  );
} else {
  console.warn('[SP_REBIRTH] Sanity is intentionally disabled until PUBLIC_SANITY_PROJECT_ID is configured.');
}

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://www.sanapatel.com.au',
  adapter: cloudflare({
    session: false,
    prerenderEnvironment: 'workerd',
  }),
  integrations,
  trailingSlash: 'always',
  compressHTML: true,
});
