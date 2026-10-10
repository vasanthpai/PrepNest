import { expect, test } from "@playwright/test";
import { gluedWords, horizontalOverflow, sitemapPaths, watchForProblems } from "./helpers";

/**
 * Every page we publish, checked the same way. Sitemap pages come from the build automatically;
 * pages that are deliberately not in the sitemap (noindex) are listed here.
 */
const NOT_IN_SITEMAP = ["/search", "/blog/tag/hooks"];
const pages = [...sitemapPaths(), ...NOT_IN_SITEMAP];

for (const path of pages) {
  test(`${path} loads cleanly, fits the screen and reads correctly`, async ({ page }) => {
    const problems = watchForProblems(page);
    const response = await page.goto(path, { waitUntil: "networkidle" });

    expect(response?.status(), "HTTP status").toBe(200);
    expect(problems, "console errors, failed or third-party requests").toEqual([]);
    expect(await horizontalOverflow(page), "pixels wider than the viewport").toBe(0);
    expect(await gluedWords(page), "words glued to numbers").toEqual([]);

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);
    expect(await canonical.getAttribute("href")).not.toContain(".html");
    await expect(page.locator("h1")).toHaveCount(1);
  });
}
