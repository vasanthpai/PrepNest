# v0.2 step 7: Playwright browser tests and accessibility checks in CI

**Ticket:** [#29](https://github.com/vasanthpai/PrepNest/issues/29) · **Branch:** `feature/v0.2-blog` ·
**Commit:** `test: add Playwright browser tests and accessibility checks to CI`

## Goal

Automate the browser checks done by hand in steps 2–6 and run them on every pull request.

## What changed

| File                                                   | Change                                                                                        |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `playwright.config.ts`                                 | New: phone + desktop projects, `astro preview` web server, traces on failure                  |
| `e2e/*.spec.ts`, `e2e/helpers.ts`                      | New: 28 tests × 2 devices = 56 (pages, accessibility, journeys, SEO)                          |
| `.github/workflows/ci.yml`                             | New job **End-to-end tests** (cached browsers, report artifact on failure)                    |
| `package.json`                                         | `@playwright/test`, `@axe-core/playwright`; `test:e2e`, `test:e2e:ui`                         |
| `src/styles/global.css`                                | Light-mode syntax colours darkened; table scroll wrapper styles                               |
| `src/features/blog/components/ProseTable.astro`        | New: article tables in a labelled, focusable scroll region                                    |
| `src/pages/blog/[slug].astro`, `src/pages/index.astro` | MDX `components={{ table: ProseTable }}`; focusable code region on home                       |
| `eslint.config.js`                                     | `tabindex` allowed on `role="region"`                                                         |
| Docs                                                   | testing (browser tests), CI/CD (e2e job), design system (contrast on tints, scrollable boxes) |

## What the tests found on their first run

| Finding (axe, WCAG 2.1 AA)                                                       | Cause                                                                  | Fix                                                                                                                     |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Colour contrast**: topic chips and the env banner, light mode, 3.6–4.0:1       | v0.1 measured colours on `bg`/`surface`, not on their own 12–20% tints | Light tokens darkened: keyword `#6136d7`, function `#085ca1`, string `#106840`, number `#944300` (all ≥ 4.6:1 on tints) |
| **Scrollable region not keyboard-accessible**: article tables, home code preview | Overflowing boxes that can't take focus                                | Labelled focusable region (`role="region"`, `aria-label`, `tabindex="0"`)                                               |

Dark mode already passed.

## Issues hit and fixes

| Problem                                                                  | Cause                                                                                               | Fix                                               |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Rehype plugin broke the build                                            | Astro 7's default Markdown engine (Sätteri) doesn't run rehype plugins without the legacy processor | MDX component mapping instead                     |
| ESLint `no-noninteractive-tabindex` vs axe `scrollable-region-focusable` | Two tools, opposite advice for bare `tabindex`                                                      | The pattern both accept: labelled `role="region"` |

## Security finding (CodeQL, on this step's push)

| Alert                                                                         | Cause                                                                    | Fix                                                                                          |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| High: `js/incomplete-multi-character-sanitization` in `cleanExcerpt` (step 6) | Deleting tags with one regex can be bypassed: `<<b>script>` → `<script>` | Escape everything except exact `<mark>`/`</mark>`; bypass and "only `<mark>` tags out" tests |

Not exploitable in practice (Pagefind already escapes article text), but the sanitiser itself was
wrong. A first rewrite used NUL-byte placeholders, which ended up as raw NUL characters in the source
file; replaced by splitting on the markers (no placeholders).

## Proof it works

| Check                                                     | Result                                                                 |
| --------------------------------------------------------- | ---------------------------------------------------------------------- |
| Full suite, local (production build)                      | 56 passed (~16 s)                                                      |
| Regression check: footer changed back to "© 2026PrepNest" | Every page test **failed** with `"2026PrepNest"`; restored → 56 passed |
| Keyboard: Tab to the wide table, ArrowRight ×4            | Announced "Table, scrolls sideways"; scrolled 25 of 25 px              |

## Validation

- [x] `npm run test:e2e` passes locally
- [x] A deliberately broken page fails the suite
- [ ] Passes in CI (first run on this commit)
- [ ] `End-to-end tests` added as a required check on `main`
