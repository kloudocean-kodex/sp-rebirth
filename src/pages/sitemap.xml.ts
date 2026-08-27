import type { APIRoute } from 'astro';
import { INDEXED_PATHS, SITE } from '@/config/site';

export const GET: APIRoute = ({ site }) => {
  const isProduction = import.meta.env.PUBLIC_DEPLOY_ENV === 'production';

  if (!isProduction) {
    return new Response('Not found', {
      status: 404,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store',
        'x-robots-tag': 'noindex, nofollow',
      },
    });
  }

  const origin = site ?? new URL(SITE.url);
  const urls = INDEXED_PATHS.map(
    (path) => `<url><loc>${new URL(path, origin).toString()}</loc></url>`,
  ).join('');

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(body, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
