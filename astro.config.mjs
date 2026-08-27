import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sanity from '@sanity/astro';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const env = loadEnv(mode, process.cwd(), '');
const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET || 'production';
const studioUrl = env.PUBLIC_SANITY_STUDIO_URL;

const integrations = [react()];

if (projectId) {
  integrations.unshift(
    sanity({
      projectId,
      dataset,
      apiVersion: '2026-08-27',
      useCdn: true,
      stega: studioUrl
        ? {
            studioUrl,
          }
        : undefined,
    }),
  );
} else {
  console.warn('[SP_REBIRTH] Sanity is intentionally disabled until PUBLIC_SANITY_PROJECT_ID is configured.');
}

export default defineConfig({
  site: env.PUBLIC_SITE_URL || 'https://www.sanapatel.com.au',
  adapter: cloudflare({
    prerenderEnvironment: 'workerd',
  }),
  integrations,
  trailingSlash: 'always',
  compressHTML: true,
  vite: {
    optimizeDeps: {
      include: [
        'react/compiler-runtime',
        'lodash/isObject.js',
        'lodash/groupBy.js',
        'lodash/keyBy.js',
        'lodash/partition.js',
        'lodash/sortedIndex.js',
      ],
    },
  },
});
