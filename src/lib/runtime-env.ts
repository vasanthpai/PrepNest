import { env } from "cloudflare:workers";
import { type AppConfig, parseEnv } from "@/config/env";
import { type FeatureFlag, isFeatureEnabled } from "@/config/features";

/**
 * Server-only access to validated configuration.
 *
 * Reads the Cloudflare `env` (wrangler vars + secrets) once, validates it, and caches the result.
 * Works at request time and during the build (pre-rendered pages run in workerd too).
 */
let cached: AppConfig | undefined;

export function getConfig(): AppConfig {
  cached ??= parseEnv(env);
  return cached;
}

/** Is a feature enabled in the environment this code is running in? */
export function featureEnabled(flag: FeatureFlag): boolean {
  return isFeatureEnabled(flag, getConfig().APP_ENV);
}
