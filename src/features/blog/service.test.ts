import { describe, expect, it } from "vitest";
import type { BlogPostData } from "@/features/blog/schema";
import {
  type BlogPost,
  blogPageUrl,
  blogSitemapEntries,
  isVisible,
  lastChanged,
  postsByTag,
  postsByTopic,
  postsToBuild,
  postUrl,
  publishedPosts,
  readingTimeMinutes,
  rssItems,
  tagCounts,
  tagUrl,
  topicsWithPosts,
  topicUrl,
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

describe("URLs", () => {
  it("builds the post URL from the file name", () => {
    expect(postUrl({ id: "deploy-is-not-release" })).toBe("/blog/deploy-is-not-release");
  });

  it("uses /blog for page 1 and /blog/page/N after that", () => {
    expect([1, 2, 7].map(blogPageUrl)).toEqual(["/blog", "/blog/page/2", "/blog/page/7"]);
  });

  it("builds topic and tag URLs", () => {
    expect(topicUrl("system-design")).toBe("/blog/topic/system-design");
    expect(tagUrl("feature-flags")).toBe("/blog/tag/feature-flags");
  });
});

describe("topicsWithPosts", () => {
  const topicList = [{ slug: "javascript" }, { slug: "react" }, { slug: "devops" }];

  it("keeps the configured order, counts posts, drops empty topics", () => {
    const posts = [
      post("a", { topic: "react" }),
      post("b", { topic: "javascript" }),
      post("c", { topic: "react" }),
    ];
    expect(topicsWithPosts(topicList, posts)).toEqual([
      { slug: "javascript", count: 1 },
      { slug: "react", count: 2 },
    ]);
  });
});

describe("lastChanged", () => {
  it("prefers updatedAt over publishedAt", () => {
    expect(lastChanged(post("a", { updatedAt: new Date("2026-10-05") }))).toEqual(
      new Date("2026-10-05"),
    );
    expect(lastChanged(post("b"))).toEqual(new Date("2026-10-01"));
  });
});

describe("blogSitemapEntries", () => {
  const posts = [
    post("new", { topic: "react", publishedAt: new Date("2026-10-08") }),
    post("edited", {
      topic: "javascript",
      publishedAt: new Date("2026-09-01"),
      updatedAt: new Date("2026-10-09"),
    }),
    post("old", { topic: "react", publishedAt: new Date("2026-08-01") }),
  ];
  const entries = blogSitemapEntries(posts, ["react", "javascript"], 2);
  const byPath = new Map(entries.map((e) => [e.path, e.lastModified?.toISOString().slice(0, 10)]));

  it("lists index pages, topic pages and posts, but never tag pages", () => {
    expect([...byPath.keys()]).toEqual([
      "/blog",
      "/blog/page/2",
      "/blog/topic/react",
      "/blog/topic/javascript",
      "/blog/new",
      "/blog/edited",
      "/blog/old",
    ]);
  });

  it("dates each page by its newest change", () => {
    expect(byPath.get("/blog")).toBe("2026-10-09");
    expect(byPath.get("/blog/topic/react")).toBe("2026-10-08");
    expect(byPath.get("/blog/edited")).toBe("2026-10-09");
  });

  it("still lists /blog when there are no posts", () => {
    expect(blogSitemapEntries([], []).map((e) => e.path)).toEqual(["/blog"]);
  });
});

describe("rssItems", () => {
  it("maps posts to feed items with topic label and tags as categories", () => {
    const items = rssItems([post("x", { topic: "react", tags: ["hooks"] })], (slug) =>
      slug.toUpperCase(),
    );
    expect(items).toEqual([
      {
        title: "Post x",
        description: "A description long enough to pass the schema rules for search engines.",
        pubDate: new Date("2026-10-01"),
        link: "/blog/x",
        categories: ["REACT", "hooks"],
      },
    ]);
  });
});
