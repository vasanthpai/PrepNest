import type { AppEnv } from "@/config/app-env";
import type { BlogPostData } from "@/features/blog/schema";

/**
 * The minimum a post needs for the logic below (id = file name = URL slug). Astro's
 * CollectionEntry<"blog"> has this shape; functions are generic so they return the same,
 * richer entries they were given.
 */
export interface BlogPost {
  id: string;
  data: BlogPostData;
  body?: string | undefined;
}

/**
 * Should this post be listed and built in this environment?
 * Local shows everything (drafts and future-dated posts) so writers can preview.
 * Staging and production show only non-draft posts whose publish date has arrived.
 */
export function isVisible(post: BlogPost, env: AppEnv, now: Date): boolean {
  if (env === "local") return true;
  return !post.data.draft && post.data.publishedAt <= now;
}

/** Visible posts, newest first. */
export function publishedPosts<T extends BlogPost>(
  posts: readonly T[],
  env: AppEnv,
  now: Date,
): T[] {
  return posts.filter((post) => isVisible(post, env, now)).sort(newestFirst);
}

/**
 * Posts to build as pages. When the blog feature is off in this environment, nothing is built,
 * so the URLs don't exist at all (not just hidden from the nav).
 */
export function postsToBuild<T extends BlogPost>(
  posts: readonly T[],
  env: AppEnv,
  now: Date,
  blogEnabled: boolean,
): T[] {
  return blogEnabled ? publishedPosts(posts, env, now) : [];
}

export function newestFirst(a: BlogPost, b: BlogPost): number {
  return b.data.publishedAt.getTime() - a.data.publishedAt.getTime() || a.id.localeCompare(b.id);
}

export function postsByTopic<T extends BlogPost>(posts: readonly T[], topic: string): T[] {
  return posts.filter((post) => post.data.topic === topic);
}

export function postsByTag<T extends BlogPost>(posts: readonly T[], tag: string): T[] {
  return posts.filter((post) => post.data.tags.includes(tag));
}

/** Every tag with its number of posts, most used first (ties alphabetical). */
export function tagCounts(posts: readonly BlogPost[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Reading time in whole minutes at ~220 words per minute; at least 1. */
export function readingTimeMinutes(body: string | undefined): number {
  const words = (body ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function postUrl(post: Pick<BlogPost, "id">): string {
  return `/blog/${post.id}`;
}

/** Posts per page on the blog index. */
export const POSTS_PER_PAGE = 10;

/** Page 1 is /blog itself, so it has one canonical URL. */
export function blogPageUrl(page: number): string {
  return page === 1 ? "/blog" : `/blog/page/${page}`;
}

export function topicUrl(slug: string): string {
  return `/blog/topic/${slug}`;
}

export function tagUrl(tag: string): string {
  return `/blog/tag/${tag}`;
}

/**
 * Topics that have at least one of the given posts, with counts, in the order defined in
 * src/config/topics.ts (so the topic bar doesn't reshuffle as posts are added).
 */
export function topicsWithPosts<T extends { slug: string }>(
  topicList: readonly T[],
  posts: readonly BlogPost[],
): (T & { count: number })[] {
  return topicList
    .map((topic) => ({ ...topic, count: postsByTopic(posts, topic.slug).length }))
    .filter((topic) => topic.count > 0);
}
