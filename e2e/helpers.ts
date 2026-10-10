import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";

/**
 * Hosts allowed to appear even though our pages never reference them.
 * Antivirus software on a developer machine (Kaspersky) injects a script into every page; it is
 * not part of PrepNest and never happens in CI. See docs/setup.md, troubleshooting.
 */
const LOCAL_ENVIRONMENT_NOISE = [/kaspersky-labs\.com/];

const isNoise = (text: string) => LOCAL_ENVIRONMENT_NOISE.some((pattern) => pattern.test(text));

/**
 * Start collecting problems on a page: console errors, uncaught exceptions, failed requests, and
 * requests to other domains. Call before `page.goto`, read the array after.
 */
export function watchForProblems(page: Page): string[] {
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && !isNoise(message.text() + message.location().url)) {
      problems.push(`console error: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => problems.push(`uncaught exception: ${error.message}`));
  page.on("requestfailed", (request) => {
    if (!isNoise(request.url())) problems.push(`request failed: ${request.url()}`);
  });
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname !== "localhost" && !url.protocol.startsWith("data") && !isNoise(url.href)) {
      problems.push(`request to another domain: ${url.href}`);
    }
  });
  return problems;
}

/** Visible text where a number or year is glued to the next word ("3articles", "2026PrepNest"). */
export async function gluedWords(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    let text = document.body.innerText;
    // Code is allowed to look like anything.
    for (const el of document.querySelectorAll<HTMLElement>("pre, code")) {
      text = text.split(el.innerText).join(" ");
    }
    return [...text.matchAll(/\b\d+(?:articles?|results?|PrepNest|min)\b|\b\d{4}[A-Z][a-z]+/g)].map(
      (match) => match[0],
    );
  });
}

/** How many pixels the page is wider than the viewport (0 = fits). */
export async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

/**
 * Paths listed in the built sitemap (dist/client/sitemap.xml). Read at test-collection time, so
 * every indexable page gets its own test automatically.
 */
export function sitemapPaths(): string[] {
  const xml = readFileSync("dist/client/sitemap.xml", "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => new URL(match[1] ?? "/").pathname,
  );
}
