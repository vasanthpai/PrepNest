# Performance budget

PrepNest must work on a cheap Android phone on slow mobile data. Lighthouse checks that on every pull
request and **fails CI** when a page misses a score or a budget. Config: `lighthouserc.json`.

## How it's measured

- Lighthouse (via Lighthouse CI) on the production build served by `astro preview` (workerd).
- **Mobile emulation, simulated slow 4G**, 3 runs per page, median.
- Pages: `/`, `/blog`, an article (`/blog/map-parseint-returns-nan`), `/search`.
- `is-crawlable` is skipped: non-production builds are `noindex` on purpose.

## Budgets (CI fails if any is missed)

| Check                    | Budget   | Measured (v0.2 step 9) | Why this limit                                       |
| ------------------------ | -------- | ---------------------- | ---------------------------------------------------- |
| Performance score        | ≥ 0.90   | 0.98                   | Lighthouse's "good" band                             |
| Accessibility score      | = 1.00   | 1.00                   | Complements the axe tests (e2e)                      |
| Best practices score     | ≥ 0.95   | 1.00 in CI             | HTTPS, no console errors, modern APIs                |
| SEO score                | ≥ 0.95   | 1.00                   | Meta, links, crawlable structure                     |
| Largest Contentful Paint | ≤ 2.5 s  | 1.8 s                  | Core Web Vitals "good" threshold                     |
| Cumulative Layout Shift  | ≤ 0.1    | 0.00                   | Core Web Vitals "good" threshold                     |
| Total Blocking Time      | ≤ 200 ms | 0 ms                   | Lab proxy for responsiveness (INP)                   |
| JavaScript transferred   | ≤ 25 KB  | 0–5 KB                 | A React island on a content page (~200 KB) must fail |
| Fonts transferred        | ≤ 100 KB | 74 KB                  | Two variable fonts; a third font family would fail   |
| Total page weight        | ≤ 200 KB | 127–135 KB             | Room for small images; large ones need a decision    |
| Third-party requests     | 0        | 0 in CI                | No trackers, CDNs or widgets sneaking in             |

**Proven:** adding one React counter to the home page shipped 217 KB of JavaScript and failed the
JavaScript, page-weight and LCP budgets.

Changing a budget is a deliberate decision: update `lighthouserc.json` **and** this table in the same PR,
with the reason.

## Decisions made from measurements

| Change                                                                                 | Before → after (slow 4G)                                                       | Trade-off                                                                                                 |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| CSS inlined into HTML (`inlineStylesheets: "always"`)                                  | FCP/LCP ~1.97 s → ~1.81 s; home LCP 2.12 s → 1.82 s                            | ~2 KB more per page (CSS not cached separately); right for first visits from search                       |
| No trailing-slash redirects (v0.2 step 2)                                              | One fewer round trip per internal link                                         | None                                                                                                      |
| System font for code, 2 variable fonts                                                 | 74 KB fonts total, cached after first visit                                    | None                                                                                                      |
| Fonts via Astro Fonts API: preload, metric-matched fallbacks, `font-display: optional` | CI CLS 0.127 → (re-measured in CI); CLS 0.000 locally with fonts delayed 1.5 s | On a slow first visit the page may keep the fallback font (no swap); the font is cached for the next page |

## Running it locally

```bash
npm run build
npm run lighthouse          # collect (3 runs × 4 pages) + check budgets
```

Reports land in `.lighthouseci/` (git-ignored). In CI, each run also gets a temporary public report
link (in the job log) and the `lighthouse-reports` artifact.

**Antivirus caveat:** software that injects scripts into pages (Kaspersky on the dev machine) fails
_best practices_ and _third-party requests_ locally, and slows the other numbers. CI is the source
of truth. To see clean local numbers:
`npx lhci collect --settings.blockedUrlPatterns="*kaspersky-labs.com*"`.
