import type { APIRoute } from "astro";
import { topics } from "@/config/topics";
import { blogSitemapEntries, getBlogForBuild, topicsWithPosts } from "@/features/blog";
import { buildSitemapXml, type SitemapEntry } from "@/lib/sitemap";

/** /sitemap.xml: every page we want indexed, with last-modified dates. Built at build time. */
export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error("astro.config.mjs must set `site`.");
  const { enabled, posts } = await getBlogForBuild();
  const entries: SitemapEntry[] = [{ path: "/" }];
  if (enabled) {
    const topicSlugs = topicsWithPosts(topics, posts).map((topic) => topic.slug);
    entries.push(...blogSitemapEntries(posts, topicSlugs));
  }
  return new Response(buildSitemapXml(site, entries), {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
};
