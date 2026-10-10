# v0.2 step 4: SEO, link previews and structured data

**Ticket:** [#26](https://github.com/vasanthpai/PrepNest/issues/26) · **Branch:** `feature/v0.2-blog` ·
**Commit:** `feat: add SEO metadata, link previews and structured data`

## Goal

Every page tells search engines and social apps what it is: canonical URL, description, Open Graph
and Twitter cards, and structured data for articles.

## What changed

| File                                               | Change                                                                      |
| -------------------------------------------------- | --------------------------------------------------------------------------- |
| `src/config/urls.ts`                               | New: site URL per environment, `siteUrlFor(CLOUDFLARE_ENV)`                 |
| `astro.config.mjs`                                 | `site` set per environment (unknown env fails the build)                    |
| `src/lib/seo.ts`                                   | New: `publicPath`, `canonicalUrl`, `buildSeo`, `serializeJsonLd` (19 tests) |
| `src/components/Seo.astro`                         | New: renders title, canonical, meta tags, JSON-LD                           |
| `src/layouts/BaseLayout.astro`                     | Uses `Seo`; `theme-color`; `indexable` prop (`noindex, follow`)             |
| Post, topic, tag pages                             | Article data, breadcrumbs; tag pages not indexed in production              |
| `public/og/default.png`, `scripts/og/default.html` | New: 1200×630 link-preview image and its template                           |
| `.prettierignore`                                  | `scripts/og/` (pre-formatted image template)                                |
| `docs/seo.md`                                      | New: what each page emits, indexing rules, how to check                     |

## Why

- **Per-environment absolute URLs:** canonical and `og:url` must point at the environment the page is
  served from; one map in `urls.ts` feeds both Astro and the SEO code.
- **Pure `buildSeo`:** tag logic is unit-tested (titles, canonicals, article tags, JSON-LD shapes,
  escaping); the component only renders.
- **Tag pages `noindex, follow`:** one-article tag pages would compete with the articles in search.

## Issues hit and fixes

| Problem                                                                                         | Cause                                                                        | Fix                                                       |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------- |
| Every canonical ended in `.html` (`…/index.html`, `…/my-post.html`); home had no `WebSite` data | Build-time `Astro.url.pathname` is the file path with `build.format: "file"` | `publicPath()` normalises; tests for build paths          |
| Test page `__site-check.ts` was never built                                                     | Astro ignores files starting with `_`                                        | Used a normal file name                                   |
| Preview image: headline wrapped, background code overlapped, `=>` drawn as `⇒`                  | First layout; font ligatures                                                 | Smaller nowrap headline, code bottom-right, ligatures off |

The `.html` canonical bug passed every unit test and would have shipped; it was caught by inspecting
the built HTML. Lesson: test the output, not only the function.

## Proof it works (production build)

| Page                    | Canonical                         | JSON-LD                         | Robots            |
| ----------------------- | --------------------------------- | ------------------------------- | ----------------- |
| `/`                     | `…workers.dev/`                   | `WebSite`                       | indexable         |
| `/blog`                 | `…/blog`                          | none                            | indexable         |
| `/blog/why-useeffect-…` | `…/blog/why-useeffect-runs-twice` | `BlogPosting`, `BreadcrumbList` | indexable         |
| `/blog/topic/react`     | `…/blog/topic/react`              | `BreadcrumbList`                | indexable         |
| `/blog/tag/hooks`       | `…/blog/tag/hooks`                | none                            | `noindex, follow` |

`og:url` equals the canonical on every page. Staging builds: every page `noindex, nofollow` and URLs
on the staging domain.

## Validation

- [x] Every page: one absolute canonical for its environment, title, description, `og:*`, `twitter:*`
- [x] Posts: `og:type=article`, times, valid `BlogPosting` + `BreadcrumbList`
- [x] lint, format, typecheck, tests (154), build pass
- [ ] Live check with the Rich Results Test after the v0.2.0 production release
