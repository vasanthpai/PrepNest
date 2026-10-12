# v0.2 step 10: Release the blog (staging, then v0.2.0 to production)

**Ticket:** [#31](https://github.com/vasanthpai/PrepNest/issues/31) · **Branches:** `feature/v0.2-blog`
(staging flag), then `release/v0.2.0` · **PRs:** [#23](https://github.com/vasanthpai/PrepNest/pull/23), release PR

## Goal

Release the blog with the feature-flag flow from ADR 0004: staging first, production in a tagged
release.

## The flow

```
blog flag: local ──► staging (on the feature branch; PR previews show it)
        PR #23 merged ──► staging deploy (automatic) ──► checklist on staging
        release PR: production flag on, CHANGELOG [0.2.0], version 0.2.0
        merge ──► tag v0.2.0 ──► approval ──► production ──► GitHub Release
```

## Staging (after PR #23 merged, `72c0080`)

Deploy staging ran automatically; smoke test passed (health, home, favicon, **og:image**).
Checklist in a real browser at 360px:

| Check                                                              | Result |
| ------------------------------------------------------------------ | ------ |
| Staging banner; headline "Learn it. Quiz it. Ship it."             | ✓      |
| Latest articles (3), Blog → Articles, topic bar                    | ✓      |
| Article: highlighted code, focusable tables, linked topic and tags | ✓      |
| Search "parseInt"                                                  | ✓      |
| Dark mode persists after reload                                    | ✓      |
| Footer `source · rss · v0.1.0 · staging`                           | ✓      |
| `og:image` on the staging domain loads                             | ✓      |
| `Disallow: /` and `noindex, nofollow`                              | ✓      |
| Fits 360px                                                         | ✓      |

Production during this time: still v0.1.0, `/blog` 404.

## Release PR checks (production build)

| Check                      | Result                                                                 |
| -------------------------- | ---------------------------------------------------------------------- |
| Pages                      | 15 (home, blog, 3 posts, 3 topics, 6 tags, search)                     |
| `robots.txt`               | `Allow: /` + production sitemap                                        |
| Sitemap                    | 8 URLs, 0 tag pages                                                    |
| Robots meta                | Home, blog, posts, topics indexable; tags and search `noindex, follow` |
| Canonicals                 | `https://prepnest-production.prepnest.workers.dev/…`, no `.html`       |
| Banner / footer            | No banner; `v0.2.0`                                                    |
| RSS                        | 3 items                                                                |
| Release verify (simulated) | `package.json` = 0.2.0; CHANGELOG `[0.2.0]` present; notes extract     |

## Validation

- [x] Staging checklist passed
- [x] Production build verified before tagging
- [ ] Tag `v0.2.0`, approval, production deploy, smoke test, GitHub Release
- [ ] Live checks on production: Rich Results Test, link preview, sitemap
- [ ] Milestone v0.2 closed
