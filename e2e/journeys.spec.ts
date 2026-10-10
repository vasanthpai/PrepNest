import { expect, test } from "@playwright/test";

/** What a reader actually does: browse, read, filter, search, switch theme. */

test("browse from the home page to an article, its topic and a tag", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "All articles →" }).click();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Articles");

  await page.getByRole("link", { name: /map\(parseInt\)/ }).click();
  await expect(page).toHaveURL(/\/blog\/map-parseint-returns-nan$/);
  await expect(page.locator("pre").first()).toBeVisible();

  await page.getByRole("link", { name: "JavaScript" }).first().click();
  await expect(page).toHaveURL(/\/blog\/topic\/javascript$/);
  await expect(page.getByText("1 article about JavaScript.")).toBeVisible();

  await page.getByRole("link", { name: /map\(parseInt\)/ }).click();
  await page.getByRole("link", { name: "#arrays" }).click();
  await expect(page).toHaveURL(/\/blog\/tag\/arrays$/);
});

test("search finds an article and opens it", async ({ page }) => {
  await page.goto("/search");
  await expect(page.getByLabel("What do you want to learn?")).toBeFocused();
  await page.getByLabel("What do you want to learn?").fill("parseInt");

  await expect(page.getByRole("status")).toHaveText("1 result for “parseInt”");
  await expect(page).toHaveURL(/\?q=parseInt$/);
  await page.locator("#search-results a").first().click();
  await expect(page).toHaveURL(/\/blog\/map-parseint-returns-nan$/);
});

test("a search link with ?q= shows results straight away", async ({ page }) => {
  await page.goto("/search?q=flags");
  await expect(page.locator("#search-results a").first()).toHaveAttribute(
    "href",
    "/blog/deploy-is-not-release",
  );
});

test("dark mode stays on after a reload", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Dark mode" });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");

  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(18, 20, 25)");
});
