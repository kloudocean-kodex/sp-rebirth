import type { APIRoute } from "astro";
import { INTERNAL_PATH_PREFIXES, SITE } from "@/config/site";

export const GET: APIRoute = ({ site }) => {
  const isProduction = import.meta.env.PUBLIC_DEPLOY_ENV === "production";
  const origin = site ?? new URL(SITE.url);

  const body = isProduction
    ? [
        "User-agent: *",
        "Allow: /",
        ...INTERNAL_PATH_PREFIXES.map((path) => `Disallow: ${path}`),
        "",
        `Sitemap: ${new URL("/sitemap.xml", origin).toString()}`,
        "",
      ].join("\n")
    : ["User-agent: *", "Disallow: /", ""].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
};
