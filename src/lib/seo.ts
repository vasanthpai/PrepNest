/**
 * Everything a page tells search engines and social apps, built as plain data so it can be
 * unit-tested. `src/components/Seo.astro` renders the result into <head>.
 * Guide: docs/seo.md
 */

export interface SeoImage {
  /** Path under the site, e.g. "/og/default.png". */
  path: string;
  alt: string;
  width: number;
  height: number;
}

export interface SeoArticle {
  publishedAt: Date;
  updatedAt?: Date | undefined;
  /** Topic label, e.g. "React". */
  section: string;
  tags: readonly string[];
}

export interface Breadcrumb {
  name: string;
  path: string;
}

export interface SeoInput {
  site: string | URL;
  /** Path of the current page, e.g. "/blog/my-post". Query strings never reach the canonical. */
  path: string;
  /** Page title without the site name; omit on the home page. */
  title?: string | undefined;
  description: string;
  type?: "website" | "article";
  image: SeoImage;
  article?: SeoArticle | undefined;
  breadcrumbs?: readonly Breadcrumb[] | undefined;
  siteName: string;
  tagline: string;
  /** BCP 47, e.g. "en-IN". */
  locale: string;
  author: { name: string; url: string };
}

export interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}

export interface SeoOutput {
  title: string;
  canonical: string;
  meta: MetaTag[];
  jsonLd: Record<string, unknown>[];
}

/**
 * The public path of a page. During the build Astro reports file paths ("/index.html",
 * "/blog/my-post.html", because of `build.format: "file"`), but the site serves them as "/" and
 * "/blog/my-post". Also drops trailing slashes, query strings and hashes.
 */
export function publicPath(path: string): string {
  const pathname = new URL(path, "https://x.invalid").pathname
    .replace(/\/index\.html$/, "/")
    .replace(/\.html$/, "");
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
}

/** Absolute canonical URL of a page (see publicPath). */
export function canonicalUrl(site: string | URL, path: string): string {
  return `${new URL(site).origin}${publicPath(path)}`;
}

/** "en-IN" → "en_IN" (Open Graph's locale format). */
export function ogLocale(locale: string): string {
  return locale.replace("-", "_");
}

export function buildSeo(input: SeoInput): SeoOutput {
  const type = input.type ?? "website";
  const canonical = canonicalUrl(input.site, input.path);
  const title = input.title
    ? `${input.title} · ${input.siteName}`
    : `${input.siteName}: ${input.tagline}`;
  const shareTitle = input.title ?? title;
  const imageUrl = new URL(input.image.path, input.site).href;

  const meta: MetaTag[] = [
    { name: "description", content: input.description },
    { property: "og:type", content: type },
    { property: "og:site_name", content: input.siteName },
    { property: "og:title", content: shareTitle },
    { property: "og:description", content: input.description },
    { property: "og:url", content: canonical },
    { property: "og:locale", content: ogLocale(input.locale) },
    { property: "og:image", content: imageUrl },
    { property: "og:image:width", content: String(input.image.width) },
    { property: "og:image:height", content: String(input.image.height) },
    { property: "og:image:alt", content: input.image.alt },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: shareTitle },
    { name: "twitter:description", content: input.description },
    { name: "twitter:image", content: imageUrl },
    { name: "twitter:image:alt", content: input.image.alt },
  ];

  const jsonLd: Record<string, unknown>[] = [];
  const publisher = {
    "@type": "Organization",
    name: input.siteName,
    url: canonicalUrl(input.site, "/"),
  };

  if (type === "article" && input.article) {
    const { publishedAt, updatedAt, section, tags } = input.article;
    meta.push(
      { property: "article:published_time", content: publishedAt.toISOString() },
      { property: "article:modified_time", content: (updatedAt ?? publishedAt).toISOString() },
      { property: "article:section", content: section },
      ...tags.map((tag) => ({ property: "article:tag", content: tag })),
    );
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: input.title ?? input.siteName,
      description: input.description,
      datePublished: publishedAt.toISOString(),
      dateModified: (updatedAt ?? publishedAt).toISOString(),
      author: { "@type": "Person", name: input.author.name, url: input.author.url },
      publisher,
      mainEntityOfPage: canonical,
      url: canonical,
      image: imageUrl,
      articleSection: section,
      keywords: tags.join(", "),
      inLanguage: input.locale,
    });
  } else if (publicPath(input.path) === "/") {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: input.siteName,
      url: canonical,
      description: input.description,
      inLanguage: input.locale,
      publisher,
    });
  }

  if (input.breadcrumbs && input.breadcrumbs.length > 0) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: input.breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: canonicalUrl(input.site, crumb.path),
      })),
    });
  }

  return { title, canonical, meta, jsonLd };
}

/**
 * JSON for a <script type="application/ld+json"> tag. `<` is escaped so text like "</script>"
 * inside a title can never close the tag early (an HTML injection risk).
 */
export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
