# v0.1 step 10: Syntax design system, base layout, home page and /api/health

**Ticket:** [#5](https://github.com/vasanthpai/PrepNest/issues/5) · **Branch:** `feature/v0.1-foundation` ·
**Commit:** `feat: add Syntax design system, base layout, home page and health endpoint`

## Goal

Build the chosen visual identity and the first real pages, with light/dark mode and a health
endpoint for deploy checks.

## Decision

Three directions were mocked up with the same real content in light and dark
([comparison page](https://claude.ai/artifact/CPLcnZBwWNFpybZr2AK9qN)): Blueprint, **Syntax**,
Flashcard. **Syntax** was chosen: colour carries meaning (one syntax colour per topic) and the body
font is designed for readability. Details: [design-system.md](../../design-system.md).

## What changed

| File                             | Change                                                                                        |
| -------------------------------- | --------------------------------------------------------------------------------------------- |
| `src/styles/global.css`          | Theme tokens (light/dark), fonts, `dark:` variant, `.btn` components, base styles             |
| `src/config/topics.ts`           | New: 6 starter topics, each with a syntax colour                                              |
| `src/config/version.ts`          | New: `APP_VERSION` from `package.json`                                                        |
| `src/layouts/BaseLayout.astro`   | New: meta, no-flash theme script, `noindex` outside production, skip link                     |
| `src/components/*.astro`         | New: `Logo`, `SiteHeader`, `SiteFooter`, `ThemeToggle`, `EnvBanner`, `TopicChip`              |
| `src/pages/index.astro`          | Real home page: hero, topics, what's coming, quiz preview, built in public                    |
| `src/pages/api/health.ts`        | New: `GET /api/health`, server-rendered, `cache-control: no-store`                            |
| `src/lib/health.ts`              | New: `buildHealth()` pure function (tested)                                                   |
| `public/favicon.svg`             | New brand favicon; `favicon.ico` (Astro logo) removed                                         |
| `src/components/HelloIsland.tsx` | Removed (temporary check from step 3)                                                         |
| `package.json`                   | `@fontsource-variable/bricolage-grotesque`, `@fontsource-variable/atkinson-hyperlegible-next` |
| `docs/design-system.md`          | New: tokens, rules, type, components, theme, performance budget                               |

## Why

- **Semantic tokens** (`bg-surface`, `text-muted`) switch theme by themselves, so components never
  need two sets of colours.
- **Pages read flags:** the "What you'll find here" cards say "Coming in v0.x" until a feature's
  flag is on, then "Live now". No code change needed at release time.
- **`noindex` outside production** keeps the staging copy out of Google.
- **Health logic is a pure function** so it's unit-tested; the route stays a thin wrapper.

## Issues hit and fixes

| Problem                                                     | Cause                                                             | Fix                                                                                         |
| ----------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Logo rendered as `prep{nest }`                              | Prettier moved `}` to a new line; a line break renders as a space | Logo parts in an `inline-flex` container, where whitespace between children is ignored      |
| Code-comment colour below WCAG AA (3.5:1 light, 4.4:1 dark) | Mockup colours were picked by eye                                 | Measured every token; comment colour adjusted to `#666c78` / `#858c9a` (≥ 4.5:1 everywhere) |

## Proof it works

| Check                                | Result                                                                |
| ------------------------------------ | --------------------------------------------------------------------- |
| `GET /api/health` (preview, workerd) | `200`, `cache-control: no-store`, `{"status":"ok","env":"local",...}` |
| Fonts loaded by the home page        | 2 files (Latin subsets): 41 KB + 34 KB                                |
| JavaScript on the home page          | ~0.5 KB inline (theme toggle); React not loaded                       |
| `CLOUDFLARE_ENV=staging` build       | Staging banner, `noindex`, footer `staging`                           |
| `CLOUDFLARE_ENV=production` build    | No banner, indexable, footer `production`                             |

## Validation

- [x] `npm test` → 11 files, 84 tests passed
- [x] lint, format:check, typecheck, build pass
