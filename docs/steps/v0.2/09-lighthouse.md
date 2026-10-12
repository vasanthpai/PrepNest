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

| Problem                                                                                     | Cause                                                                                                                                                                                                              | Fix                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| First local run: 170 KB JS, 4 third-party requests, best practices 0.82, LCP 3.2 s          | Kaspersky injects an http:// script into every page                                                                                                                                                                | Measured with that domain blocked; CI (no antivirus) is the source of truth; documented                                                                                                                                                                            |
| FCP ~1.97 s                                                                                 | Render-blocking CSS request                                                                                                                                                                                        | CSS inlined: ~1.81 s (trade-off documented)                                                                                                                                                                                                                        |
| **CI: CLS 0.127 on the home page** ("Latest articles" pushed down; cause "Web font loaded") | Text first renders in a fallback font, then the web font swaps in with different metrics. Not reproducible on Windows (Arial present, so the metric-matched fallback fits); Linux CI and **Android** have no Arial | Astro Fonts API (preload + metric-matched fallbacks) with `font-display: optional`: the font is used only if it arrives within ~100 ms, else the fallback stays and nothing jumps. Verified: real fonts on a normal connection; CLS 0.000 with fonts delayed 1.5 s |
| CI Lighthouse reports artifact was empty                                                    | `upload-artifact` skips hidden folders (`.lighthouseci/`)                                                                                                                                                          | `include-hidden-files: true`                                                                                                                                                                                                                                       |
| **Headline read "Quiz it.Ship it." (live since v0.1.0)**                                    | Astro dropped the line break between `it.` and the next `<span>`                                                                                                                                                   | `{" "}` after `it.`; glued-words test now also catches a sentence glued to the next ("it.Ship") and was shown to fail before the fix                                                                                                                               |
| My file edit turned `\b` into backspace characters                                          | Two escaping layers (tool call + Python string)                                                                                                                                                                    | Rewrote the file with the editor tool; scanned the repo: 0 control characters                                                                                                                                                                                      |

## Proof the budgets bite

A temporary React counter on the home page → **217 KB JavaScript**; failed `script.size`,
`total.size` and LCP (plus the antivirus-related checks). Removed afterwards.

## CI result (GitHub Linux runner, mobile, slow 4G, median of 3)

| Page      | Perf | A11y | Best practices | SEO  | LCP    | CLS   | TBT  | JS     | Total  | 3rd-party |
| --------- | ---- | ---- | -------------- | ---- | ------ | ----- | ---- | ------ | ------ | --------- |
| `/`       | 1.00 | 1.00 | 1.00           | 1.00 | 1.51 s | 0.000 | 0 ms | 0 KB   | 130 KB | 0         |
| `/blog`   | 1.00 | 1.00 | 1.00           | 1.00 | 1.51 s | 0.000 | 0 ms | 0 KB   | 124 KB | 0         |
| Article   | 1.00 | 1.00 | 1.00           | 1.00 | 1.51 s | 0.000 | 0 ms | 0 KB   | 132 KB | 0         |
| `/search` | 1.00 | 1.00 | 1.00           | 1.00 | 1.66 s | 0.000 | 0 ms | 4.8 KB | 126 KB | 0         |

## Validation

- [x] Budgets pass locally (except antivirus-caused checks) with real headroom
- [x] A deliberate regression fails the budgets
- [x] Lighthouse passes in CI: 100 in all four categories on every page; CLS 0.127 → 0.000
- [x] Lighthouse added as a required check on `main`
