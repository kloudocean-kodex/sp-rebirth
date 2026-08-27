import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sanity from '@sanity/astro';
import { defineConfig } from 'astro/config';

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET || 'production';

if (!projectId) {
  console.warn('[SP_REBIRTH] PUBLIC_SANITY_PROJECT_ID is not set. Configure Sanity before production builds.');
}

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://www.sanapatel.com.au',
  adapter: cloudflare({
    session: false,
    prerenderEnvironment: 'workerd',
  }),
  integrations: [
    sanity({
      projectId: projectId || 'replace-me',
      dataset,
      apiVersion: '2026-08-27',
      useCdn: true,
      studioBasePath: '/studio',
      stega: {
        studioUrl: '/studio',
      },
    }),
    react(),
  ],
  trailingSlash: 'always',
  compressHTML: true,
});
