import { describe, expect, it } from "vitest";
import { clerkConfigured, clerkSessionCookies, expiredCookie, needsClerk } from "@/lib/auth/clerk";

describe("needsClerk", () => {
  it.each(["/sign-in", "/sign-out", "/dashboard", "/dashboard/settings"])(
    "is true for %s",
    (path) => {
      expect(needsClerk(path)).toBe(true);
    },
  );

  it.each(["/", "/blog", "/blog/some-post", "/dashboards", "/sign-in-help", "/api/health"])(
    "is false for %s (Clerk never touches it)",
    (path) => {
      expect(needsClerk(path)).toBe(false);
    },
  );
});

describe("clerkConfigured", () => {
  it("needs both keys", () => {
    const pk = "pk_test_abc";
    const sk = "sk_test_abc";
    expect(
      clerkConfigured({ APP_ENV: "local", PUBLIC_CLERK_PUBLISHABLE_KEY: pk, CLERK_SECRET_KEY: sk }),
    ).toBe(true);
    expect(clerkConfigured({ APP_ENV: "local", PUBLIC_CLERK_PUBLISHABLE_KEY: pk })).toBe(false);
    expect(clerkConfigured({ APP_ENV: "local", CLERK_SECRET_KEY: sk })).toBe(false);
  });
});

describe("clerkSessionCookies", () => {
  it("finds Clerk's session cookies, with or without a suffix", () => {
    const header =
      "theme=dark; __session=abc; __session_Xy12-z=def; __client_uat=1; __client_uat_Xy12-z=1; __clerk_db_jwt=keep";
    expect(clerkSessionCookies(header)).toEqual([
      "__session",
      "__session_Xy12-z",
      "__client_uat",
      "__client_uat_Xy12-z",
    ]);
  });

  it("ignores everything else, including look-alikes", () => {
    expect(clerkSessionCookies("sessionid=1; my__session=2; __sessions=3")).toEqual([]);
    expect(clerkSessionCookies(null)).toEqual([]);
  });
});

describe("expiredCookie", () => {
  it("deletes the cookie on the root path, Secure only over HTTPS", () => {
    expect(expiredCookie("__session", true)).toBe(
      "__session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure",
    );
    expect(expiredCookie("__session", false)).not.toContain("Secure");
  });
});
