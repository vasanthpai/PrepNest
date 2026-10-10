import { describe, expect, it } from "vitest";
import { buildSiteUrl, previewUrlFor, SITE_URLS, siteUrlFor } from "@/config/urls";

describe("siteUrlFor", () => {
  it.each([
    [undefined, SITE_URLS.local],
    ["", SITE_URLS.local],
    ["staging", SITE_URLS.staging],
    ["production", SITE_URLS.production],
  ])("CLOUDFLARE_ENV=%j → %s", (env, url) => {
    expect(siteUrlFor(env)).toBe(url);
  });

  it("rejects an unknown environment", () => {
    expect(() => siteUrlFor("prod")).toThrow(/Unknown CLOUDFLARE_ENV "prod"/);
  });
});

describe("previewUrlFor", () => {
  it("prefixes the staging host with the preview alias", () => {
    expect(previewUrlFor("23")).toBe("https://pr-23-prepnest-staging.prepnest.workers.dev");
  });

  it.each(["", "0", "23a", "../x", "12345678", "-1"])("rejects %j", (pr) => {
    expect(() => previewUrlFor(pr)).toThrow(/PREVIEW_PR must be a pull request number/);
  });
});

describe("buildSiteUrl", () => {
  it("uses the preview address for a PR preview build", () => {
    expect(buildSiteUrl({ CLOUDFLARE_ENV: "staging", PREVIEW_PR: "23" })).toBe(
      "https://pr-23-prepnest-staging.prepnest.workers.dev",
    );
  });

  it("uses the environment URL otherwise", () => {
    expect(buildSiteUrl({ CLOUDFLARE_ENV: "production" })).toBe(SITE_URLS.production);
    expect(buildSiteUrl({})).toBe(SITE_URLS.local);
  });

  it("refuses PREVIEW_PR outside staging builds", () => {
    expect(() => buildSiteUrl({ CLOUDFLARE_ENV: "production", PREVIEW_PR: "23" })).toThrow(
      /only valid together with CLOUDFLARE_ENV=staging/,
    );
  });
});
