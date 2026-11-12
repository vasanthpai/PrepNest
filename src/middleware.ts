import { clerkMiddleware } from "@clerk/astro/server";
import { defineMiddleware, sequence } from "astro:middleware";
import { clerkConfigured, needsClerk } from "@/lib/auth/clerk";
import { featureEnabled, getConfig } from "@/lib/runtime-env";

/**
 * Runs before every page and API route, and for every pre-rendered page during the build.
 * Validating config here means a misconfigured environment fails the build or the first
 * request with a clear error, instead of breaking somewhere deep inside a feature.
 */
const validateConfig = defineMiddleware((_context, next) => {
  getConfig();
  return next();
});

const clerk = clerkMiddleware();

/**
 * Clerk only where it's needed: server-rendered auth routes, with the `auth` flag on and both
 * keys configured. Pre-rendered pages (the blog) never reach Clerk, so they stay free of its
 * script and requests (ADR 0013). Routes check `clerkConfigured()` before using `locals.auth`.
 */
const auth = defineMiddleware((context, next) => {
  if (
    context.isPrerendered ||
    !needsClerk(context.url.pathname) ||
    !featureEnabled("auth") ||
    !clerkConfigured(getConfig())
  ) {
    return next();
  }
  return clerk(context, next);
});

export const onRequest = sequence(validateConfig, auth);
