import { describe, expect, it } from "vitest";
import type { BlogPostData } from "@/features/blog/schema";
import {
  type BlogPost,
  isVisible,
  postsByTag,
  postsByTopic,
  postsToBuild,
  postUrl,
  publishedPosts,
  readingTimeMinutes,
  tagCounts,
} from "@/features/blog/service";

const NOW = new Date("2026-10-09T12:00:00Z");

function post(id: string, data: Partial<BlogPostData> = {}): BlogPost {
  return {
    id,
    data: {
      title: `Post ${id}`,
      description: "A description long enough to pass the schema rules for search engines.",
      topic: "javascript",
      tags: [],
      publishedAt: new Date("2026-10-01"),
      draft: false,
      ...data,
    },
  };
}

const live = post("live");
const draft = post("draft", { draft: true });
const scheduled = post("scheduled", { publishedAt: new Date("2026-12-01") });

describe("isVisible", () => {
  it("shows everything locally, including drafts and scheduled posts", () => {
    for (const p of [live, draft, scheduled]) expect(isVisible(p, "local", NOW)).toBe(true);
  });

  it.each(["staging", "production"] as const)("hides drafts and future posts on %s", (env) => {
    expect(isVisible(live, env, NOW)).toBe(true);
    expect(isVisible(draft, env, NOW)).toBe(false);
    expect(isVisible(scheduled, env, NOW)).toBe(false);
  });

  it("shows a scheduled post once its date arrives", () => {
    expect(isVisible(scheduled, "production", new Date("2026-12-01T00:00:00Z"))).toBe(true);
  });
});

describe("publishedPosts", () => {
  it("returns visible posts newest first, ties by id", () => {
    const posts = [
      post("b", { publishedAt: new Date("2026-10-01") }),
      post("c", { publishedAt: new Date("2026-10-05") }),
      post("a", { publishedAt: new Date("2026-10-01") }),
      draft,
    ];
    expect(publishedPosts(posts, "production", NOW).map((p) => p.id)).toEqual(["c", "a", "b"]);
  });

  it("does not modify the input array", () => {
    const posts = [post("old", { publishedAt: new Date("2026-01-01") }), live];
    const before = posts.map((p) => p.id);
    publishedPosts(posts, "production", NOW);
    expect(posts.map((p) => p.id)).toEqual(before);
  });
});

describe("postsToBuild", () => {
  it("builds no pages when the blog flag is off", () => {
    expect(postsToBuild([live, draft], "local", NOW, false)).toEqual([]);
  });

  it("builds the visible posts when the flag is on", () => {
    expect(postsToBuild([live, draft, scheduled], "staging", NOW, true).map((p) => p.id)).toEqual([
      "live",
    ]);
  });
});

describe("filters", () => {
  const posts = [
    post("r1", { topic: "react", tags: ["hooks", "strict-mode"] }),
    post("r2", { topic: "react", tags: ["hooks"] }),
    post("j1", { topic: "javascript", tags: ["arrays"] }),
  ];

  it("filters by topic", () => {
    expect(postsByTopic(posts, "react").map((p) => p.id)).toEqual(["r1", "r2"]);
    expect(postsByTopic(posts, "devops")).toEqual([]);
  });

  it("filters by tag", () => {
    expect(postsByTag(posts, "hooks").map((p) => p.id)).toEqual(["r1", "r2"]);
  });

  it("counts tags, most used first, ties alphabetical", () => {
    expect(tagCounts(posts)).toEqual([
      { tag: "hooks", count: 2 },
      { tag: "arrays", count: 1 },
      { tag: "strict-mode", count: 1 },
    ]);
  });
});

describe("readingTimeMinutes", () => {
  it.each([
    [undefined, 1],
    ["", 1],
    ["word ".repeat(220), 1],
    ["word ".repeat(221), 2],
    ["word ".repeat(1100), 5],
  ])("%#: returns %i minute(s)", (body, minutes) => {
    expect(readingTimeMinutes(body)).toBe(minutes);
  });
});

describe("postUrl", () => {
  it("builds the URL from the file name", () => {
    expect(postUrl({ id: "deploy-is-not-release" })).toBe("/blog/deploy-is-not-release");
  });
});
