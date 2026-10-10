import { canonicalUrl } from "@/lib/seo";

export interface SitemapEntry {
  /** Site path, e.g. "/blog/my-post". Turned into the same absolute URL as the page's canonical. */
  path: string;
  /** When the page's content last changed. */
  lastModified?: Date | undefined;
}

const XML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

export function escapeXml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => XML_ESCAPES[char] ?? char);
}

/** sitemaps.org XML. Duplicate paths are listed once; order follows the input. */
export function buildSitemapXml(site: string | URL, entries: readonly SitemapEntry[]): string {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const entry of entries) {
    const loc = canonicalUrl(site, entry.path);
    if (seen.has(loc)) continue;
    seen.add(loc);
    const lastmod = entry.lastModified
      ? `<lastmod>${entry.lastModified.toISOString().slice(0, 10)}</lastmod>`
      : "";
    urls.push(`  <url><loc>${escapeXml(loc)}</loc>${lastmod}</url>`);
  }
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}
