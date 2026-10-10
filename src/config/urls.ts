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

/**
 * Address of a pull request preview: the staging Worker's preview alias "pr-<n>", e.g.
 * https://pr-23-prepnest-staging.prepnest.workers.dev. Previews are built with staging settings
 * but must use their OWN address for canonical links, link-preview images, sitemap and RSS.
 */
export function previewUrlFor(prNumber: string): string {
  if (!/^[1-9]\d{0,6}$/.test(prNumber)) {
    throw new Error(`PREVIEW_PR must be a pull request number, got "${prNumber}".`);
  }
  const staging = new URL(SITE_URLS.staging);
  return `${staging.protocol}//pr-${prNumber}-${staging.host}`;
}

/**
 * The site URL for a build: a PR preview when PREVIEW_PR is set (preview workflow), otherwise the
 * environment selected by CLOUDFLARE_ENV.
 */
export function buildSiteUrl(env: {
  CLOUDFLARE_ENV?: string | undefined;
  PREVIEW_PR?: string | undefined;
}): string {
  if (env.PREVIEW_PR) {
    if (env.CLOUDFLARE_ENV !== "staging") {
      throw new Error("PREVIEW_PR is only valid together with CLOUDFLARE_ENV=staging.");
    }
    return previewUrlFor(env.PREVIEW_PR);
  }
  return siteUrlFor(env.CLOUDFLARE_ENV);
}
