import type { APIRoute } from "astro";
import { getConfig } from "@/lib/runtime-env";
import { googleVerification } from "@/lib/site-verification";

/**
 * Google Search Console verification file, served at /googlef33373e4667df5d9.html by the Worker.
 *
 * - Not a static file: Cloudflare redirects static /name.html to /name, and Google may not
 *   follow the redirect.
 * - No ".html" in this file name: with `build.format: "file"`, Astro's router strips ".html"
 *   from the request path before matching, so the route must be the bare name.
 *
 * The file name must match GOOGLE_VERIFICATION_FILE (checked by a unit test).
 */
export const prerender = false;

export const GET: APIRoute = () => {
  const { status, body } = googleVerification(getConfig().APP_ENV);
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
};
