import { describe, expect, it } from "vitest";
import { blogPostSchema } from "@/features/blog/schema";

const valid = {
  title: "Why useEffect runs twice",
  description:
    "React Strict Mode mounts components twice in development to expose missing cleanup.",
  topic: "react",
  tags: ["hooks"],
  publishedAt: "2026-09-28",
};

const issuesFor = (input: Record<string, unknown>) => {
  const result = blogPostSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join("."));
};

describe("blogPostSchema", () => {
  it("accepts a valid post and fills defaults", () => {
    const post = blogPostSchema.parse({ ...valid, tags: undefined });
    expect(post.publishedAt).toBeInstanceOf(Date);
    expect(post.tags).toEqual([]);
    expect(post.draft).toBe(false);
  });

  it("rejects an unknown topic and lists the valid ones", () => {
    const result = blogPostSchema.safeParse({ ...valid, topic: "cobol" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toMatch(/Unknown topic\. Use one of: .*react/);
  });

  it.each([
    ["title too short", { title: "Short" }, "title"],
    ["description too short for search engines", { description: "Too short." }, "description"],
    ["description too long for search engines", { description: "x".repeat(161) }, "description"],
    ["tag not lowercase-hyphenated", { tags: ["Strict Mode"] }, "tags.0"],
    ["more than 5 tags", { tags: ["a", "b", "c", "d", "e", "f"] }, "tags"],
    ["not a date", { publishedAt: "someday" }, "publishedAt"],
    ["updated before published", { updatedAt: "2026-01-01" }, "updatedAt"],
  ])("rejects %s", (_case, override, path) => {
    expect(issuesFor({ ...valid, ...override })).toContain(path);
  });
});
