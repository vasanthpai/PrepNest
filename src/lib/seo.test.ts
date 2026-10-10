import { describe, expect, it } from "vitest";
import { buildSeo, canonicalUrl, ogLocale, type SeoInput, serializeJsonLd } from "@/lib/seo";

const SITE = "https://prepnest-production.prepnest.workers.dev";

const base: SeoInput = {
  site: SITE,
  path: "/",
  description: "Free tech articles, hands-on quizzes and practical courses.",
  image: { path: "/og/default.png", alt: "PrepNest", width: 1200, height: 630 },
  siteName: "PrepNest",
  tagline: "Learn it. Quiz it. Ship it.",
  locale: "en-IN",
  author: { name: "Vasantha Pai", url: "https://github.com/vasanthpai" },
};

const meta = (out: ReturnType<typeof buildSeo>, key: string) =>
  out.meta.filter((m) => m.name === key || m.property === key).map((m) => m.content);

describe("canonicalUrl", () => {
  it.each([
    ["/", `${SITE}/`],
    ["/blog", `${SITE}/blog`],
    ["/blog/", `${SITE}/blog`],
    ["/blog/my-post?utm_source=x#top", `${SITE}/blog/my-post`],
    // Build-time paths with build.format "file"
    ["/index.html", `${SITE}/`],
    ["/blog.html", `${SITE}/blog`],
    ["/blog/my-post.html", `${SITE}/blog/my-post`],
    ["/blog/topic/react.html", `${SITE}/blog/topic/react`],
  ])("%s → %s", (path, expected) => {
    expect(canonicalUrl(SITE, path)).toBe(expected);
  });
});

describe("ogLocale", () => {
  it("converts BCP 47 to Open Graph format", () => {
    expect(ogLocale("en-IN")).toBe("en_IN");
  });
});

describe("buildSeo: home page", () => {
  const out = buildSeo(base);

  it("recognises the home page from its build-time path too", () => {
    const built = buildSeo({ ...base, path: "/index.html" });
    expect(built.canonical).toBe(`${SITE}/`);
    expect(built.jsonLd[0]?.["@type"]).toBe("WebSite");
  });

  it("uses 'Name: tagline' as the title", () => {
    expect(out.title).toBe("PrepNest: Learn it. Quiz it. Ship it.");
  });

  it("has absolute canonical, og:url and image URLs", () => {
    expect(out.canonical).toBe(`${SITE}/`);
    expect(meta(out, "og:url")).toEqual([`${SITE}/`]);
    expect(meta(out, "og:image")).toEqual([`${SITE}/og/default.png`]);
    expect(meta(out, "twitter:card")).toEqual(["summary_large_image"]);
  });

  it("describes the site with WebSite structured data", () => {
    expect(out.jsonLd).toHaveLength(1);
    expect(out.jsonLd[0]).toMatchObject({ "@type": "WebSite", name: "PrepNest", url: `${SITE}/` });
  });

  it("has no article tags", () => {
    expect(meta(out, "article:published_time")).toEqual([]);
  });
});

describe("buildSeo: article", () => {
  const out = buildSeo({
    ...base,
    path: "/blog/why-useeffect-runs-twice/",
    title: "Why useEffect runs twice in development",
    type: "article",
    article: {
      publishedAt: new Date("2026-09-28"),
      section: "React",
      tags: ["hooks", "strict-mode"],
    },
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Articles", path: "/blog" },
      { name: "React", path: "/blog/topic/react" },
      { name: "Why useEffect runs twice in development", path: "/blog/why-useeffect-runs-twice" },
    ],
  });

  it("appends the site name to the page title, but shares the bare title", () => {
    expect(out.title).toBe("Why useEffect runs twice in development · PrepNest");
    expect(meta(out, "og:title")).toEqual(["Why useEffect runs twice in development"]);
  });

  it("marks it as an article with dates, section and every tag", () => {
    expect(meta(out, "og:type")).toEqual(["article"]);
    expect(meta(out, "article:published_time")).toEqual(["2026-09-28T00:00:00.000Z"]);
    expect(meta(out, "article:modified_time")).toEqual(["2026-09-28T00:00:00.000Z"]);
    expect(meta(out, "article:tag")).toEqual(["hooks", "strict-mode"]);
  });

  it("emits BlogPosting and BreadcrumbList structured data", () => {
    expect(out.jsonLd.map((d) => d["@type"])).toEqual(["BlogPosting", "BreadcrumbList"]);
    expect(out.jsonLd[0]).toMatchObject({
      headline: "Why useEffect runs twice in development",
      datePublished: "2026-09-28T00:00:00.000Z",
      author: { "@type": "Person", name: "Vasantha Pai" },
      mainEntityOfPage: `${SITE}/blog/why-useeffect-runs-twice`,
    });
    const crumbs = out.jsonLd[1]?.["itemListElement"] as { position: number; item: string }[];
    expect(crumbs.map((c) => c.position)).toEqual([1, 2, 3, 4]);
    expect(crumbs[2]?.item).toBe(`${SITE}/blog/topic/react`);
  });

  it("uses updatedAt as the modified time when present", () => {
    const updated = buildSeo({
      ...base,
      type: "article",
      title: "T",
      path: "/blog/t",
      article: {
        publishedAt: new Date("2026-09-28"),
        updatedAt: new Date("2026-10-05"),
        section: "React",
        tags: [],
      },
    });
    expect(meta(updated, "article:modified_time")).toEqual(["2026-10-05T00:00:00.000Z"]);
  });
});

describe("serializeJsonLd", () => {
  it("can't be used to close the script tag", () => {
    const json = serializeJsonLd({ headline: "</script><script>alert(1)</script>" });
    expect(json).not.toContain("<");
    expect(JSON.parse(json)).toEqual({ headline: "</script><script>alert(1)</script>" });
  });
});
