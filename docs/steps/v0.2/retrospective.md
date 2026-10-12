# v0.2 retrospective

**Released:** v0.2.0 on 2026-10-12 · **Live:** <https://prepnest-production.prepnest.workers.dev/blog> ·
**Milestone:** 12 issues and PRs, all closed

## What we built

A blog with MDX articles, topics, tags, search, SEO and feeds, and three new quality gates that now
run on every pull request: browser tests with accessibility checks, a live preview URL, and
Lighthouse budgets. Final CI score: **100 / 100 / 100 / 100** on every measured page.

## What went well

- **Every new gate found real bugs on its first run.** The browser tests found contrast and keyboard
  problems; CodeQL found a sanitiser bypass; Lighthouse in CI found text jumping as fonts loaded.
  None had been caught by unit tests or code review.
- **Testing on a real phone mattered.** The missing WhatsApp preview image was found by hand on a
  phone, then turned into an automated smoke check.
- **The feature-flag release worked as designed:** blog on in previews and staging first, production
  only in the tagged release, with production untouched until then.
- **Measuring before deciding:** inlined CSS and the font strategy were kept because the numbers
  improved, with trade-offs written down.

## What we learned

| Lesson                                                                                | Where it came from                                                                       | Now                                                                                 |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Astro drops whitespace between `{…}`/text and a following element across a line break | "3articles", "© 2026PrepNest", "Quiz it.Ship it." (two were live since v0.1.0)           | Single-string expressions or `{" "}`; e2e glued-words check (numbers and sentences) |
| Test the output, not only the function                                                | Canonicals ended in `.html` while all unit tests passed                                  | Inspect built HTML; e2e checks canonicals                                           |
| Contrast must be measured on the actual background, including tints                   | Chips at 3.6–4.0:1 on their 12% tint                                                     | Darker light tokens; axe in CI                                                      |
| Metric-matched font fallbacks depend on which fonts the device has                    | CLS 0.127 on Linux CI, not reproducible on Windows (Arial)                               | `font-display: optional` + preload; CI is the reference                             |
| Deleting tags is not sanitising                                                       | CodeQL: `<<b>script>` → `<script>`                                                       | Escape everything except an allow-list                                              |
| Previews need their own site URL                                                      | Preview links had no image (pointed at live staging)                                     | `PREVIEW_PR` → own address; workflow asserts it                                     |
| Escaping layers corrupt code                                                          | `\b` and `\u0000` became control characters in files                                     | Write such code with the editor tool; scan for control chars                        |
| Local antivirus distorts browser measurements                                         | Kaspersky: 174 KB injected JS, http request, LCP +1 s                                    | Measure in CI; block the domain for local numbers                                   |
| Defaults change across tool versions                                                  | `upload-artifact` skipped `.lighthouseci/` silently; Wrangler moved its generated config | Verify artifacts and generated files, don't assume                                  |

## Numbers

| Metric                           | v0.1         | v0.2                                      |
| -------------------------------- | ------------ | ----------------------------------------- |
| Unit tests                       | 84           | 201                                       |
| Browser tests                    | 0            | 56 (phone + desktop, incl. WCAG 2.1 AA)   |
| Required checks on `main`        | 2            | 5                                         |
| Lighthouse (CI, mobile, slow 4G) | not measured | 100 in all categories; LCP 1.5 s; CLS 0   |
| JavaScript on content pages      | ~0.5 KB      | 0 KB (search page 4.8 KB)                 |
| Page weight                      | ~84 KB       | 124–132 KB (CSS inlined, fonts preloaded) |
| Monthly cost                     | ₹0           | ₹0                                        |

## Carry into v0.3

- **Database migrations** run in the deploy pipelines; previews share staging's database, so
  migrations must stay backward-compatible.
- **release-please** to draft the CHANGELOG from commit messages.
- Add database-backed pages to the sitemap and e2e page list deliberately (custom sitemap trade-off).
- Keep each Dependabot group PR small and merge it weekly.
