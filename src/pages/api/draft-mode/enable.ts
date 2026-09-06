import type { APIRoute } from "astro";
import { createClient } from "@sanity/client";
import { validatePreviewUrl } from "@sanity/preview-url-secret";
import { perspectiveCookieName } from "@sanity/preview-url-secret/constants";
import { env } from "cloudflare:workers";

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
  const dataset = import.meta.env.PUBLIC_SANITY_DATASET || "production";
  const token = env.SANITY_API_READ_TOKEN;

  if (!projectId || !token) {
    return new Response("Preview is not configured on this environment.", {
      status: 503,
      headers: { "cache-control": "no-store" },
    });
  }

  const previewClient = createClient({
    projectId,
    dataset,
    apiVersion: "2026-08-27",
    useCdn: false,
    token,
    perspective: "drafts",
  });

  const {
    isValid,
    redirectTo = "/",
    studioPreviewPerspective,
  } = await validatePreviewUrl(previewClient, request.url);

  if (!isValid) {
    return new Response("Invalid preview secret.", {
      status: 401,
      headers: { "cache-control": "no-store" },
    });
  }

  const partitioned =
    request.headers.get("sec-fetch-dest") === "iframe" &&
    request.headers.get("sec-fetch-site") === "cross-site";

  cookies.set(perspectiveCookieName, studioPreviewPerspective ?? "drafts", {
    httpOnly: false,
    sameSite: "none",
    secure: true,
    path: "/",
    partitioned,
  });

  return redirect(redirectTo, 307);
};
