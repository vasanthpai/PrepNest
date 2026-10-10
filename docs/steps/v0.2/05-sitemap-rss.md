# v0.2 step 5: Sitemap, robots.txt and RSS feed

**Ticket:** [#27](https://github.com/vasanthpai/PrepNest/issues/27) · **Branch:** `feature/v0.2-blog` ·
**Commit:** `feat: add sitemap, robots.txt and RSS feed`

## Goal

Help search engines and feed readers find the content: a sitemap with dates, robots.txt per
environment, and an RSS feed.

## What changed

| File                                               | Change                                                                       |
| -------------------------------------------------- | ---------------------------------------------------------------------------- |
| `src/lib/sitemap.ts`, `src/lib/robots.ts`          | New: `buildSitemapXml` (escaping, de-duplication, lastmod), `buildRobotsTxt` |
| `src/features/blog/service.ts`                     | `lastChanged`, `blogSitemapEntries` (no tag pages), `rssItems`               |
| `src/pages/sitemap.xml.ts`, `robots.txt.ts`        | New endpoints, built at build time                                           |
| `src/pages/[feed].xml.ts`                          | New: `/rss.xml` via `@astrojs/rss`; not built when the blog is off           |
| `src/layouts/BaseLayout.astro`, `SiteFooter.astro` | RSS `<link rel="alternate">`; footer "rss" link (blog on only)               |
| Tests                                              | 13 new (167 total)                                                           |
| `docs/seo.md`                                      | Sitemap, robots and RSS section                                              |

## Why

- **Custom sitemap** over `@astrojs/sitemap`: `lastmod` from post dates, no `noindex` tag pages, and
  the same URL function as canonicals. Trade-off documented: new routes must be added by hand.
- **robots per environment:** staging gets `Disallow: /` on top of `noindex`; production advertises
  the sitemap.
- **RSS as a dynamic route** (`[feed].xml.ts` with `getStaticPaths`) so it isn't built at all when the
  blog flag is off. A plain `rss.xml.ts` would always produce a file, empty.
- **`trailingSlash: false`** in the feed, so feed links match our URLs exactly.

## Proof it works

**Production build** (blog flag temporarily on for the check, then restored):

| Check                                      | Result                                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------------------ |
| `robots.txt`                               | `Allow: /` + `Sitemap: https://prepnest-production…/sitemap.xml`                     |
| `sitemap.xml`                              | Valid XML, 8 URLs (home, index, 3 topics, 3 posts), 0 tag pages                      |
| Every sitemap URL vs that page's canonical | All 8 identical                                                                      |
| `lastmod`                                  | `/blog` 2026-10-09 (newest post), React topic 2026-09-28                             |
| `rss.xml`                                  | Valid XML, 3 items, absolute links without trailing slash, categories = topic + tags |

**Staging build:** `robots.txt` = `Disallow: /`; no `rss.xml`; sitemap lists only `/`.

**Served (workerd preview):** `robots.txt` → `text/plain; charset=utf-8`; `sitemap.xml`, `rss.xml` →
`application/xml`. Footer: `source · rss · v0.1.0 · local`.

## Validation

- [x] Production robots allows all + `Sitemap:`; staging/local `Disallow: /`
- [x] Every sitemap URL matches its canonical; no tag pages
- [x] RSS valid with 3 items and absolute links
- [x] lint, format, typecheck, tests (167), build pass
