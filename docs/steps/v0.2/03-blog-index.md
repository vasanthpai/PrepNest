# v0.2 step 3: Blog index, topic and tag pages

**Ticket:** [#25](https://github.com/vasanthpai/PrepNest/issues/25) · **Branch:** `feature/v0.2-blog` ·
**Commit:** `feat: add blog index, topic and tag pages`

## Goal

Make the blog browsable: an index with pagination, topic and tag pages, links between them, and
the latest articles on the home page.

## What changed

| File                                                                                | Change                                                                   |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `src/pages/blog/[...page].astro`                                                    | New: `/blog`, `/blog/page/2`, … (10 per page)                            |
| `src/pages/blog/topic/[topic].astro`                                                | New: one page per topic with posts                                       |
| `src/pages/blog/tag/[tag].astro`                                                    | New: one page per tag                                                    |
| `src/features/blog/components/PostCard.astro`                                       | New: whole card clickable through one title link                         |
| `src/features/blog/components/PostList.astro`, `Pagination.astro`, `TopicBar.astro` | New: grid with empty state; prev/next; topic filter with counts          |
| `src/features/blog/repo.ts`                                                         | `getBlogForBuild()`: flag + visible posts, shared by every blog route    |
| `src/features/blog/service.ts`                                                      | `blogPageUrl`, `topicUrl`, `tagUrl`, `topicsWithPosts`, `POSTS_PER_PAGE` |
| `src/lib/pagination.ts`, `src/lib/text.ts`                                          | New: `paginate`/`allPages`; `countLabel` ("1 article", "3 articles")     |
| `src/components/TopicChip.astro`                                                    | Optional link, count, current-page ring                                  |
| Post page, home page                                                                | Topic chip and tags link; "All articles"; "Latest articles" on home      |
| `src/components/SiteFooter.astro`                                                   | Fixed `© 2026PrepNest` (missing space, live since v0.1.0)                |

## Why

- **One rule for every blog route** (`getBlogForBuild`): the flag check and visibility can't drift
  apart between pages.
- **One link per card:** screen readers announce a clean list of article titles instead of three
  links per card; the title link's `::after` makes the whole card clickable.
- **Page 1 is `/blog`**, not `/blog/page/1`, so it has one canonical URL (matters for SEO, step 4).
- **Topic order comes from config**, so the topic bar doesn't reshuffle as posts are added.

## Issues hit and fixes

| Problem                                               | Cause                                                                                                     | Fix                                                             |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| "3articles", "1article about React", "© 2026PrepNest" | Astro drops whitespace between two `{…}` expressions on separate lines; Prettier creates such line breaks | `countLabel()` and template strings: one expression, one string |
| Same bug in the footer since v0.1.0 (production)      | Same cause, missed because v0.1 checks didn't read rendered text                                          | Fixed here; ships in v0.2.0                                     |
| Card meta showed "2 Oct 2026· 2 min read"             | Same cause                                                                                                | Explicit `{" · "}` separator                                    |
| Current topic looked like the others                  | No visual state                                                                                           | `current` ring + `aria-current="page"`                          |
| Git Bash turned `/` into `C:/Program Files/Git/`      | MSYS path conversion of arguments starting with `/`                                                       | `MSYS_NO_PATHCONV=1` for the check script                       |

**How the whitespace bugs were found:** by scanning every page's rendered text for words glued to
numbers. Code review missed them; the screenshot and the scan didn't. This check becomes a
Playwright test in step 7.

## Proof it works

| Check (real browser, 360×780)                     | Result                              |
| ------------------------------------------------- | ----------------------------------- |
| 14 pages (home, index, 3 posts, 3 topics, 6 tags) | HTTP 200, fit 360px, light and dark |
| Links per card                                    | Exactly 1 everywhere                |
| Keyboard Tab to the first card                    | Card shows a 2px focus outline      |
| All 14 internal links                             | 200, no redirects                   |
| Rendered text scan for glued words                | None on any page                    |
| Staging build (`blog` off)                        | 0 blog pages, no "Latest articles"  |

## Validation

- [x] All routes build locally; none when the flag is off
- [x] Pages fit 360px in light and dark (measured)
- [x] One link per card; visible keyboard focus
- [x] lint, format, typecheck, tests (135), build pass
