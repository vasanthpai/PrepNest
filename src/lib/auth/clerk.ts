import type { AppConfig } from "@/config/env";

/**
 * Routes that need Clerk. Clerk's middleware runs only for these (never for the static blog), and
 * adds Clerk's browser script only to their HTML (ADR 0013).
 */
const CLERK_PATHS = ["/sign-in", "/sign-out", "/dashboard"] as const;

export function needsClerk(pathname: string): boolean {
  return CLERK_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/** Both keys present. Without the secret (a CI build, a fresh clone) sign-in answers 503. */
export function clerkConfigured(config: AppConfig): boolean {
  return Boolean(config.PUBLIC_CLERK_PUBLISHABLE_KEY && config.CLERK_SECRET_KEY);
}

/**
 * Clerk's session cookies present in a request, to expire on sign-out. Clerk may add a suffix
 * derived from the publishable key (`__session_Ab12…`), so match by prefix.
 */
export function clerkSessionCookies(cookieHeader: string | null): string[] {
  if (!cookieHeader) return [];
  const names = cookieHeader.split(";").map((part) => part.split("=")[0]?.trim() ?? "");
  return names.filter((name) => /^(__session|__client_uat|__refresh)(_[\w-]+)?$/.test(name));
}

/** A Set-Cookie value that deletes the cookie (same path Clerk uses). */
export function expiredCookie(name: string, secure: boolean): string {
  return `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`;
}
