import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Automated accessibility checks (axe-core, WCAG 2.1 A and AA) in light and dark mode.
 * Automated tools find roughly a third to a half of accessibility issues; keyboard and
 * screen-reader checks still happen by hand.
 */
const PAGES = [
  "/",
  "/blog",
  "/blog/map-parseint-returns-nan",
  "/blog/topic/react",
  "/search?q=parseInt",
];

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`${colorScheme} mode`, () => {
    test.use({ colorScheme });

    for (const path of PAGES) {
      test(`${path} has no WCAG 2.1 AA violations`, async ({ page }) => {
        await page.goto(path, { waitUntil: "networkidle" });
        if (path.startsWith("/search")) await page.locator("#search-results li").first().waitFor();

        const { violations } = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();

        const summary = violations.map(
          (v) =>
            `${v.id} (${v.impact}): ${v.help}\n    ${v.nodes.map((n) => n.target.join(" ")).join("\n    ")}`,
        );
        expect(summary, "accessibility violations").toEqual([]);
      });
    }
  });
}
