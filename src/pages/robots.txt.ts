import type { APIRoute } from 'astro';
import { AI_DISCOVERY_USER_AGENTS, INTERNAL_PATH_PREFIXES, SITE } from '../config/site';

function allowedGroup(userAgent: string): string[] {
  return [`User-agent: ${userAgent}`, 'Allow: /', ...INTERNAL_PATH_PREFIXES.map((path) => `Disallow: ${path}`), ''];
}

export function buildRobotsPolicy(isProduction: boolean, origin: URL): string {
  if (!isProduction) return ['User-agent: *', 'Disallow: /', ''].join('\n');

  return [
    ...AI_DISCOVERY_USER_AGENTS.flatMap((userAgent) => allowedGroup(userAgent)),
    ...allowedGroup('*'),
    `Sitemap: ${new URL('/sitemap.xml', origin).toString()}`,
    '',
  ].join('\n');
}

export const GET: APIRoute = ({ site }) => {
  const isProduction = import.meta.env.PUBLIC_DEPLOY_ENV === 'production';
  const origin = site ?? new URL(SITE.url);
  const body = buildRobotsPolicy(isProduction, origin);

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=300',
    },
  });
};
