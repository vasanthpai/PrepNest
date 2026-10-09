import { z } from "astro/zod";
import { findTopic, topics } from "@/config/topics";

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Front matter rules for every blog post (src/content/blog/*.mdx).
 * A post that breaks these fails `npm run build`, so it can never reach production.
 * Guide for writers: docs/content.md
 */
export const blogPostSchema = z
  .object({
    /** Shown as the page heading and in search results. */
    title: z.string().min(10).max(90),
    /** Meta description and card text. 50–160 characters is what search engines display. */
    description: z.string().min(50).max(160),
    /** One topic from src/config/topics.ts; decides the post's colour and topic page. */
    topic: z.string().refine((slug) => findTopic(slug) !== undefined, {
      message: `Unknown topic. Use one of: ${topics.map((t) => t.slug).join(", ")}`,
    }),
    /** Lowercase, hyphenated, at most 5. */
    tags: z.array(z.string().regex(SLUG, "Tags must be lowercase-with-hyphens")).max(5).default([]),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    /** Drafts are visible only in local development. */
    draft: z.boolean().default(false),
  })
  .refine((post) => !post.updatedAt || post.updatedAt >= post.publishedAt, {
    message: "updatedAt must be on or after publishedAt",
    path: ["updatedAt"],
  });

export type BlogPostData = z.infer<typeof blogPostSchema>;
