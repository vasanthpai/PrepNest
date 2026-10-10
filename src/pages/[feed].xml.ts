import rss from "@astrojs/rss";
import type { APIRoute, GetStaticPaths } from "astro";
import { findTopic } from "@/config/topics";
import { site as siteConfig } from "@/config/site";
import { getBlogForBuild, rssItems } from "@/features/blog";

/**
 * /rss.xml: the article feed. A dynamic route only so that nothing is built when the blog is off
 * (a static rss.xml.ts would always exist, empty).
 */
export const getStaticPaths = (async () => {
  const { enabled } = await getBlogForBuild();
  return enabled ? [{ params: { feed: "rss" } }] : [];
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error("astro.config.mjs must set `site`.");
  const { posts } = await getBlogForBuild();
  return rss({
    title: `${siteConfig.name} articles`,
    description: siteConfig.description,
    site,
    // Our URLs have no trailing slash (astro.config.mjs); keep feed links the same.
    trailingSlash: false,
    items: rssItems(posts, (slug) => findTopic(slug)?.label ?? slug),
    customData: `<language>${siteConfig.locale.toLowerCase()}</language>`,
  });
};
