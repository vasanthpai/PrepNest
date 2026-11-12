import { clerkClient } from "@clerk/astro/server";
import type { APIRoute } from "astro";
import { clerkSessionCookies, expiredCookie } from "@/lib/auth/clerk";
import { authUnavailable } from "@/lib/auth/responses";

export const prerender = false;

/**
 * Signs out without Clerk's browser script: ends the session at Clerk, deletes Clerk's session
 * cookies, and goes home. POST only (a form button), and Astro rejects cross-site form posts,
 * so another site can't sign people out.
 */
export const POST: APIRoute = async (context) => {
  const unavailable = authUnavailable();
  if (unavailable) return unavailable;

  const { sessionId } = context.locals.auth();
  if (sessionId) {
    try {
      await clerkClient(context).sessions.revokeSession(sessionId);
    } catch (error) {
      // Still clear the cookies below; the session expires on its own at Clerk.
      console.error(`Sign-out: could not revoke session: ${String(error)}`);
    }
  }

  const headers = new Headers({ location: "/", "cache-control": "no-store" });
  const secure = context.url.protocol === "https:";
  for (const name of clerkSessionCookies(context.request.headers.get("cookie"))) {
    headers.append("set-cookie", expiredCookie(name, secure));
  }
  return new Response(null, { status: 303, headers });
};
