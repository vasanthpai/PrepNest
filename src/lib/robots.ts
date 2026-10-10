import type { AppEnv } from "@/config/app-env";
import { canonicalUrl } from "@/lib/seo";

/**
 * robots.txt per environment. Only production may be crawled; staging and local tell every
 * crawler to stay out (pages there are also marked noindex).
 */
export function buildRobotsTxt(env: AppEnv, site: string | URL): string {
  if (env !== "production") {
    return [
      "# Not the live site. Nothing here should be indexed.",
      "User-agent: *",
      "Disallow: /",
      "",
    ].join("\n");
  }
  return [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${canonicalUrl(site, "/sitemap.xml")}`,
    "",
  ].join("\n");
}
