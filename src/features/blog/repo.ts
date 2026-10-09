import { getCollection } from "astro:content";
import type { BlogPost } from "@/features/blog/service";

/** All posts in the content collection, unfiltered. Pages use the service functions on top. */
export async function getAllPosts(): Promise<BlogPost[]> {
  return getCollection("blog");
}
