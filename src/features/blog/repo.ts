import { type CollectionEntry, getCollection } from "astro:content";

export type BlogEntry = CollectionEntry<"blog">;

/** All posts in the content collection, unfiltered. Pages use the service functions on top. */
export async function getAllPosts(): Promise<BlogEntry[]> {
  return getCollection("blog");
}
