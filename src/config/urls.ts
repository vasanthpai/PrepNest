/**
 * Public URL of the site in each environment.
 * No imports on purpose: astro.config.mjs imports this file before path aliases exist.
 */
import type { AppEnv } from "./app-env";

export const SITE_URLS: Record<AppEnv, string> = {
  local: "http://localhost:4321",
  staging: "https://prepnest-staging.prepnest.workers.dev",
  production: "https://prepnest-production.prepnest.workers.dev",
};

/**
 * Site URL for the environment being built. CLOUDFLARE_ENV selects the Wrangler environment at
 * build time (unset = local), so it also selects the URL.
 */
export function siteUrlFor(cloudflareEnv: string | undefined): string {
  const env = cloudflareEnv === undefined || cloudflareEnv === "" ? "local" : cloudflareEnv;
  if (!(env in SITE_URLS)) {
    throw new Error(`Unknown CLOUDFLARE_ENV "${env}". Expected staging, production, or unset.`);
  }
  return SITE_URLS[env as AppEnv];
}
