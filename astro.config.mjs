import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sanity from '@sanity/astro';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
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

  return {
    site: env.PUBLIC_SITE_URL || 'https://www.sanapatel.com.au',
    adapter: cloudflare({
      session: false,
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
  };
});
