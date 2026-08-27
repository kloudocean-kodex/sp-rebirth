import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const isProduction = import.meta.env.PUBLIC_DEPLOY_ENV === 'production';
  const origin = site ?? new URL('https://www.sanapatel.com.au');

  const body = isProduction
    ? [
        'User-agent: *',
        'Allow: /',
        'Disallow: /api/',
        'Disallow: /preview/',
        '',
        `Sitemap: ${new URL('/sitemap.xml', origin).toString()}`,
        '',
      ].join('\n')
    : ['User-agent: *', 'Disallow: /', ''].join('\n');

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=300',
    },
  });
};
