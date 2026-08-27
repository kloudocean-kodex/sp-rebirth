import type {APIRoute} from 'astro';

const paths = [
  '/',
  '/about/',
  '/lease/',
  '/for-renters/',
  '/sale/',
  '/contact/',
  '/rental-providers/',
  '/rental-appraisal/',
  '/switch-property-managers/',
];

export const GET: APIRoute = ({site}) => {
  const origin = site ?? new URL('https://www.sanapatel.com.au');
  const urls = paths
    .map((path) => `<url><loc>${new URL(path, origin).toString()}</loc></url>`)
    .join('');

  const body = `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(body, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
