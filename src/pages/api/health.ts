import type { APIRoute } from "astro";
import { APP_VERSION } from "@/config/version";
import { checkDatabase } from "@/lib/db/check";
import { buildHealth, healthHttpStatus } from "@/lib/health";
import { getConfig } from "@/lib/runtime-env";

// Rendered on every request (not at build time), so it proves the Worker is running.
export const prerender = false;

export const GET: APIRoute = async () => {
  const config = getConfig();
  const report = buildHealth({
    env: config.APP_ENV,
    version: APP_VERSION,
    now: new Date(),
    database: await checkDatabase(config.DATABASE_URL),
  });
  return Response.json(report, {
    status: healthHttpStatus(report),
    headers: { "cache-control": "no-store" },
  });
};
