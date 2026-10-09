# v0.2 step 2: Post page with typography and code highlighting

**Ticket:** [#24](https://github.com/vasanthpai/PrepNest/issues/24) · **Branch:** `feature/v0.2-blog` ·
**Commit:** `feat: add blog post pages with typography and code highlighting`

## Goal

Render each post at `/blog/<slug>`, comfortable to read on a 360px phone, with code highlighted in
the Syntax colours in both themes.

## What changed

| File                                                              | Change                                                                                   |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `src/pages/blog/[slug].astro`                                     | New: pre-rendered post page; builds only visible posts, none if `blog` is off            |
| `src/features/blog/components/PostHeader.astro`, `PostTags.astro` | New: topic chip, title, description, date, reading time, updated, tags                   |
| `src/features/blog/service.ts`, `repo.ts`                         | `postsToBuild()`; functions generic so pages keep Astro's typed entries                  |
| `src/lib/dates.ts`                                                | New: `formatDate` ("9 Oct 2026", UTC), `isoDate`                                         |
| `src/styles/global.css`                                           | Typography plugin; `prose-pn` tokens; Shiki variables → design tokens; no code ligatures |
| `astro.config.mjs`                                                | Shiki `css-variables` theme; `trailingSlash: "never"`, `build.format: "file"`            |
| `package.json`                                                    | `@tailwindcss/typography`                                                                |
| Tests                                                             | `dates.test.ts`, `postsToBuild` (115 total)                                              |
| `docs/design-system.md`, `docs/architecture.md`                   | Articles, code highlighting, URL format                                                  |

## Why

- **Code colours from design tokens** (Shiki `css-variables`): one source of colour truth; dark mode
  for free; zero JavaScript.
- **No trailing slashes:** with the default directory format, Cloudflare answered `/blog/x` with a
  **307 redirect** to `/blog/x/`. On mobile data every redirect is a full extra round trip. Building
  `blog/x.html` serves `/blog/x` directly.
- **No ligatures in code:** the system font drew `=>` as `⇒` and `===` as `≡` (seen in the
  screenshot). Learners must see exactly what to type.
- **Generic service functions** return the same `CollectionEntry` objects they're given, so the page
  calls `render(post)` without a type cast.

## Issues hit and fixes

| Problem                                                                     | Cause                                                     | Fix                                                                                          |
| --------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `/blog/<slug>` → 307 redirect                                               | Directory-style build (`blog/x/index.html`)               | `build.format: "file"`, `trailingSlash: "never"`                                             |
| Topic chip would stretch full width                                         | Flex column children stretch by default                   | Wrapped in a block                                                                           |
| `=>` rendered as `⇒`                                                        | Font ligatures in the system monospace font               | `font-variant-ligatures: none` on code                                                       |
| Playwright browser download: `self-signed certificate in certificate chain` | Something on this network intercepts some HTTPS downloads | Used the full Chromium that did download (`channel: "chromium"`); certificate checks left on |
| Docs table row landed outside its table                                     | Inserted after the table's closing blank line             | Moved into the table; re-checked output                                                      |

## Proof it works

Measured with a real browser at **360×780**, light and dark:

| Page                             | Fits 360px | Code background (light / dark) | Function colour (light / dark) | JS          |
| -------------------------------- | ---------- | ------------------------------ | ------------------------------ | ----------- |
| `/`                              | ✅         | n/a                            | n/a                            | inline only |
| `/blog/map-parseint-returns-nan` | ✅         | `#eef0f4` / `#0e1015`          | `#0a6fc2` / `#6cb6ff`          | inline only |
| `/blog/why-useeffect-runs-twice` | ✅         | same                           | same                           | inline only |
| `/blog/deploy-is-not-release`    | ✅         | same                           | same                           | inline only |

| Build                | Blog pages | Blog nav link |
| -------------------- | ---------- | ------------- |
| local (`blog` on)    | 3          | shown         |
| staging (`blog` off) | 0          | hidden        |

## Validation

- [x] 3 post pages locally; none when the flag is off
- [x] Code uses syntax colours in both themes; no JavaScript added
- [x] 360px: no sideways page scroll; tables and code scroll in their own box
- [x] lint, format, typecheck, tests (115), build pass
