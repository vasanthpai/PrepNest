import type { APIRoute } from "astro";
import { buildRobotsTxt } from "@/lib/robots";
import { getConfig } from "@/lib/runtime-env";

/** /robots.txt: production may be crawled; staging and local may not. Built at build time. */
export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error("astro.config.mjs must set `site`.");
  return new Response(buildRobotsTxt(getConfig().APP_ENV, site), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
};
