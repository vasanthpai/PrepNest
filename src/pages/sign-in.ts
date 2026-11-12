import type { APIRoute } from "astro";
import { authUnavailable } from "@/lib/auth/responses";

export const prerender = false;

/**
 * Sends people to Clerk's hosted sign-in page (which links to sign-up), and back to /dashboard
 * afterwards. Someone already signed in goes straight to the dashboard.
 */
export const GET: APIRoute = ({ locals, redirect, url }) => {
  const unavailable = authUnavailable();
  if (unavailable) return unavailable;
  const { userId, redirectToSignIn } = locals.auth();
  if (userId) return redirect("/dashboard", 303);
  return redirectToSignIn({ returnBackUrl: new URL("/dashboard", url).toString() });
};
