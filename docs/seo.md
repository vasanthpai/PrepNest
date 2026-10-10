# SEO and link previews

What every page tells search engines and social apps, and how to check it.
Logic: `src/lib/seo.ts` (pure, tested) · rendering: `src/components/Seo.astro` · used by `BaseLayout`.

## Site URL per environment

| Environment | Site URL                                           | Set by                               |
| ----------- | -------------------------------------------------- | ------------------------------------ |
| local       | `http://localhost:4321`                            | `CLOUDFLARE_ENV` unset               |
| staging     | `https://prepnest-staging.prepnest.workers.dev`    | `CLOUDFLARE_ENV=staging` at build    |
| production  | `https://prepnest-production.prepnest.workers.dev` | `CLOUDFLARE_ENV=production` at build |

Defined once in `src/config/urls.ts` and passed to Astro's `site` option in `astro.config.mjs`.
An unknown `CLOUDFLARE_ENV` fails the build.

## What every page has

| Tag                                                                            | Example                                                 |
| ------------------------------------------------------------------------------ | ------------------------------------------------------- |
| `<title>`                                                                      | `Why useEffect runs twice in development · PrepNest`    |
| `<meta name="description">`                                                    | The post's `description` (50–160 characters)            |
| `<link rel="canonical">`                                                       | Absolute, no trailing slash, no query: `…/blog/my-post` |
| `og:type`, `og:title`, `og:description`, `og:url`, `og:site_name`, `og:locale` | Link previews (WhatsApp, LinkedIn, Slack, Facebook)     |
| `og:image` (+ width, height, alt)                                              | `/og/default.png`, 1200×630                             |
| `twitter:card` = `summary_large_image` (+ title, description, image)           | Previews on X                                           |
| `theme-color` (light and dark)                                                 | Browser UI colour on phones                             |

**Articles** add `og:type=article`, `article:published_time`, `article:modified_time`,
`article:section` (topic) and one `article:tag` per tag.

## Structured data (JSON-LD)

| Page       | Types                                                             |
| ---------- | ----------------------------------------------------------------- |
| Home       | `WebSite`                                                         |
| Article    | `BlogPosting` + `BreadcrumbList` (Home › Articles › Topic › Post) |
| Topic page | `BreadcrumbList`                                                  |

JSON-LD is serialized with `<` escaped, so content can never close the `<script>` tag (tested).

## Who may index what

| Page                                 | Production        | Staging / local     | Why                              |
| ------------------------------------ | ----------------- | ------------------- | -------------------------------- |
| Home, posts, blog index, topic pages | indexable         | `noindex, nofollow` | Real landing pages               |
| Tag pages                            | `noindex, follow` | `noindex, nofollow` | Thin pages; links still followed |

Pass `indexable={false}` to `BaseLayout` to mark a page `noindex, follow` in production.

## Sitemap, robots.txt and RSS

| File           | Production                                 | Staging / local                   | Source                                       |
| -------------- | ------------------------------------------ | --------------------------------- | -------------------------------------------- |
| `/robots.txt`  | `Allow: /` + `Sitemap: …/sitemap.xml`      | `Disallow: /`                     | `src/lib/robots.ts`                          |
| `/sitemap.xml` | Home, blog index pages, topic pages, posts | Same (but robots blocks crawling) | `src/lib/sitemap.ts`, `blogSitemapEntries()` |
| `/rss.xml`     | All visible articles, newest first         | Only when the `blog` flag is on   | `src/pages/[feed].xml.ts`                    |

- **Custom sitemap, not `@astrojs/sitemap`:** we need `lastmod` from post dates, must leave out
  `noindex` tag pages, and want the exact same URLs as the canonicals (shared `canonicalUrl()`).
  The trade-off: a **new indexable route must be added to the sitemap by hand** (`blogSitemapEntries`
  or `sitemap.xml.ts`).
- `lastmod` is each page's newest change: a post's `updatedAt ?? publishedAt`; for index and topic
  pages, their newest post.
- The RSS feed is linked from `<head>` (`rel="alternate"`, so readers auto-detect it) and the footer.

## The link preview image

`public/og/default.png` (1200×630, ~70 KB) is rendered from `scripts/og/default.html` with a headless
browser, using the real fonts and Syntax colours. The template is excluded from Prettier because
reformatting its pre-formatted code would change the image. A render command arrives with
Playwright in v0.2 step 7. Per-article images are a possible later improvement.

## Checking a page

- **View source** of a built page (`npm run build`, then open `dist/client/…html`) and look in `<head>`.
- **Live, after deploy:** paste a production URL into the
  [Rich Results Test](https://search.google.com/test/rich-results) (structured data) and the
  [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) or
  [opengraph.xyz](https://www.opengraph.xyz/) (previews).
- Staging pages are `noindex` on purpose; use production URLs for search tools.

## Gotcha found while building this

With `build.format: "file"`, Astro reports build-time paths as `/index.html` and
`/blog/my-post.html`. Using them directly made every canonical URL point at the `.html` file.
`publicPath()` normalises them, and tests cover those inputs.
