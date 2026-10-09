import type { APIRoute } from "astro";
import { APP_VERSION } from "@/config/version";
import { buildHealth } from "@/lib/health";
import { getConfig } from "@/lib/runtime-env";

// Rendered on every request (not at build time), so it proves the Worker is running.
export const prerender = false;

export const GET: APIRoute = () => {
  const report = buildHealth({ env: getConfig().APP_ENV, version: APP_VERSION, now: new Date() });
  return Response.json(report, { headers: { "cache-control": "no-store" } });
};
