import { describe, expect, it } from "vitest";
import { buildRobotsTxt } from "@/lib/robots";
import { buildSitemapXml, escapeXml } from "@/lib/sitemap";

const SITE = "https://prepnest-production.prepnest.workers.dev";

describe("escapeXml", () => {
  it("escapes the five XML special characters", () => {
    expect(escapeXml(`a&b<c>"d'`)).toBe("a&amp;b&lt;c&gt;&quot;d&apos;");
  });
});

describe("buildSitemapXml", () => {
  const xml = buildSitemapXml(SITE, [
    { path: "/" },
    { path: "/blog", lastModified: new Date("2026-10-09") },
    { path: "/blog/my-post.html", lastModified: new Date("2026-09-28T15:30:00Z") },
    { path: "/blog" },
  ]);

  it("is a sitemaps.org urlset", () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  });

  it("uses the same absolute URLs as canonicals, without .html", () => {
    expect(xml).toContain(`<loc>${SITE}/blog/my-post</loc>`);
    expect(xml).not.toContain(".html");
  });

  it("adds lastmod as a date when known", () => {
    expect(xml).toContain(`<loc>${SITE}/blog</loc><lastmod>2026-10-09</lastmod>`);
    expect(xml).toContain(`<loc>${SITE}/</loc></url>`);
  });

  it("lists each URL once", () => {
    expect(xml.match(new RegExp(`<loc>${SITE}/blog</loc>`, "g"))).toHaveLength(1);
  });
});

describe("buildRobotsTxt", () => {
  it("lets crawlers in on production and points at the sitemap", () => {
    const txt = buildRobotsTxt("production", SITE);
    expect(txt).toContain("Allow: /");
    expect(txt).toContain(`Sitemap: ${SITE}/sitemap.xml`);
    expect(txt).not.toContain("Disallow");
  });

  it.each(["staging", "local"] as const)("blocks everything on %s", (env) => {
    const txt = buildRobotsTxt(env, "https://prepnest-staging.prepnest.workers.dev");
    expect(txt).toContain("Disallow: /");
    expect(txt).not.toContain("Sitemap:");
  });
});
