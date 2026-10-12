# v0.2 step 9: Lighthouse CI with performance budgets

**Ticket:** [#33](https://github.com/vasanthpai/PrepNest/issues/33) · **Branch:** `feature/v0.2-blog` ·
**Commit:** `ci: add Lighthouse checks with performance budgets`

## Goal

Measure every pull request with Lighthouse (mobile, slow 4G) and fail CI when a score or budget is missed.

## What changed

| File                                                                 | Change                                                                                         |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `lighthouserc.json`                                                  | New: 4 pages × 3 runs; score thresholds, Core Web Vitals, byte budgets, 0 third-party requests |
| `.github/workflows/ci.yml`                                           | New job **Lighthouse** (`lhci autorun`, reports as artifact + temporary link)                  |
| `astro.config.mjs`                                                   | `inlineStylesheets: "always"` (measured improvement)                                           |
| `package.json`                                                       | `@lhci/cli`; `lighthouse` script                                                               |
| `.gitignore`, `.prettierignore`, `tsconfig.json`, `eslint.config.js` | Ignore `.lighthouseci/`                                                                        |
| `docs/performance.md`                                                | New: budgets with measured values and reasons, decisions, local runs                           |

## Measured (local, antivirus blocked; mobile, slow 4G, median of 3)

| Page      | Perf | A11y | SEO  | LCP    | CLS  | TBT  | JS     | Total  |
| --------- | ---- | ---- | ---- | ------ | ---- | ---- | ------ | ------ |
| `/`       | 0.98 | 1.00 | 1.00 | 1.82 s | 0.00 | 0 ms | 0 KB   | 133 KB |
| `/blog`   | 0.98 | 1.00 | 1.00 | 1.81 s | 0.00 | 0 ms | 0 KB   | 127 KB |
| Article   | 0.98 | 1.00 | 1.00 | 1.81 s | 0.00 | 0 ms | 0 KB   | 135 KB |
| `/search` | 0.98 | 1.00 | 1.00 | 1.81 s | 0.00 | 0 ms | 4.8 KB | 129 KB |

## Issues hit and fixes

| Problem                                                                            | Cause                                               | Fix                                                                                     |
| ---------------------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------- |
| First local run: 170 KB JS, 4 third-party requests, best practices 0.82, LCP 3.2 s | Kaspersky injects an http:// script into every page | Measured with that domain blocked; CI (no antivirus) is the source of truth; documented |
| FCP ~1.97 s                                                                        | Render-blocking CSS request                         | CSS inlined: ~1.81 s (trade-off documented)                                             |

## Proof the budgets bite

A temporary React counter on the home page → **217 KB JavaScript**; failed `script.size`,
`total.size` and LCP (plus the antivirus-related checks). Removed afterwards.

## Validation

- [x] Budgets pass locally (except antivirus-caused checks) with real headroom
- [x] A deliberate regression fails the budgets
- [ ] Lighthouse passes in CI
- [ ] Lighthouse added as a required check
