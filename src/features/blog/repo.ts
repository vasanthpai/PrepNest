import { type CollectionEntry, getCollection } from "astro:content";
import { isFeatureEnabled } from "@/config/features";
import { postsToBuild } from "@/features/blog/service";
import { getConfig } from "@/lib/runtime-env";

export type BlogEntry = CollectionEntry<"blog">;

/** All posts in the content collection, unfiltered. Pages use the service functions on top. */
export async function getAllPosts(): Promise<BlogEntry[]> {
  return getCollection("blog");
}

/**
 * What every blog route builds from: whether the blog is on in this environment, and the posts
 * visible here (newest first). Routes return no paths when `enabled` is false, so the URLs
 * don't exist at all.
 */
export async function getBlogForBuild(): Promise<{ enabled: boolean; posts: BlogEntry[] }> {
  const { APP_ENV } = getConfig();
  const enabled = isFeatureEnabled("blog", APP_ENV);
  return { enabled, posts: postsToBuild(await getAllPosts(), APP_ENV, new Date(), enabled) };
}
