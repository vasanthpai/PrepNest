import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { blogPostSchema } from "@/features/blog/schema";

/**
 * Content collections. Each Markdown/MDX file in src/content/blog becomes a post;
 * its file name (without extension) is the post's id and URL slug.
 */
const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: blogPostSchema,
});

export const collections = { blog };
