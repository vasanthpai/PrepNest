/// <reference types="node" />
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { GOOGLE_VERIFICATION_FILE, googleVerification } from "@/lib/site-verification";

describe("googleVerification", () => {
  it("answers in production with exactly the line Google expects", () => {
    expect(googleVerification("production")).toEqual({
      status: 200,
      body: "google-site-verification: googlef33373e4667df5d9.html",
    });
  });

  it.each(["staging", "local"] as const)("returns 404 on %s (never claims production)", (env) => {
    expect(googleVerification(env).status).toBe(404);
  });

  it("has a route file with that name, minus .html (Astro strips it before matching)", () => {
    const route = GOOGLE_VERIFICATION_FILE.replace(/\.html$/, "");
    expect(existsSync(`src/pages/${route}.ts`)).toBe(true);
  });
});
