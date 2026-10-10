import { expect, test } from "@playwright/test";

/** Machine-readable files and metadata (the local build: blog on, crawling disallowed). */

test("an article has article metadata and valid structured data", async ({ page }) => {
  await page.goto("/blog/why-useeffect-runs-twice");
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /\/og\/default\.png$/,
  );

  const types = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) => scripts.map((s) => JSON.parse(s.textContent ?? "{}")["@type"]));
  expect(types).toEqual(["BlogPosting", "BreadcrumbList"]);
});

test("robots.txt keeps non-production builds out of search engines", async ({ request }) => {
  const body = await (await request.get("/robots.txt")).text();
  expect(body).toContain("Disallow: /");
});

test("the RSS feed lists every article with absolute links", async ({ request }) => {
  const response = await request.get("/rss.xml");
  expect(response.headers()["content-type"]).toContain("xml");
  const xml = await response.text();
  const links = [...xml.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>/g)].map((m) => m[1]);
  expect(links).toHaveLength(3);
  for (const link of links) expect(link).toMatch(/^http:\/\/localhost:4321\/blog\/[a-z0-9-]+$/);
});

test("the preview image exists", async ({ request }) => {
  const response = await request.get("/og/default.png");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/png");
});
