import { defineMiddleware } from "astro:middleware";
import { getConfig } from "@/lib/runtime-env";

/**
 * Runs before every page and API route, and for every pre-rendered page during the build.
 * Validating config here means a misconfigured environment fails the build or the first
 * request with a clear error, instead of breaking somewhere deep inside a feature.
 */
export const onRequest = defineMiddleware((_context, next) => {
  getConfig();
  return next();
});
