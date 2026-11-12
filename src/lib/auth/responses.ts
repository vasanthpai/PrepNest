import { clerkConfigured } from "@/lib/auth/clerk";
import { featureEnabled, getConfig } from "@/lib/runtime-env";

/**
 * The response an auth route returns instead of running, or null when it may run:
 * 404 while the `auth` flag is off (the route doesn't exist yet), 503 when the Clerk keys are
 * missing (e.g. a build without secrets).
 */
export function authUnavailable(): Response | null {
  if (!featureEnabled("auth")) return new Response(null, { status: 404 });
  if (!clerkConfigured(getConfig())) {
    return new Response("Sign-in isn't configured in this environment.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    });
  }
  return null;
}
