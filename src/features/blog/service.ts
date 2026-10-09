import type { AppEnv } from "@/config/app-env";
import type { BlogPostData } from "@/features/blog/schema";

/** The shape of a post as Astro's content collection returns it (id = file name = URL slug). */
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
export function publishedPosts(posts: readonly BlogPost[], env: AppEnv, now: Date): BlogPost[] {
  return posts.filter((post) => isVisible(post, env, now)).sort(newestFirst);
}

export function newestFirst(a: BlogPost, b: BlogPost): number {
  return b.data.publishedAt.getTime() - a.data.publishedAt.getTime() || a.id.localeCompare(b.id);
}

export function postsByTopic(posts: readonly BlogPost[], topic: string): BlogPost[] {
  return posts.filter((post) => post.data.topic === topic);
}

export function postsByTag(posts: readonly BlogPost[], tag: string): BlogPost[] {
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
