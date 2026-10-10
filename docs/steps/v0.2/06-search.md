# v0.2 step 6: Article search with Pagefind

**Ticket:** [#28](https://github.com/vasanthpai/PrepNest/issues/28) · **Branch:** `feature/v0.2-blog` ·
**Commit:** `feat: add article search with Pagefind`

## Goal

Readers type a word and jump to the right article, with no server and no third-party service.

## What changed

| File                          | Change                                                                                         |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| `package.json`                | `pagefind` dev dependency; `build` = `astro build && pagefind --site dist/client`              |
| `src/pages/blog/[slug].astro` | `data-pagefind-body`, topic filter; footer `data-pagefind-ignore`                              |
| `src/pages/[search].astro`    | New: search page with live results, `?q=` support, status for screen readers, fallback message |
| `src/lib/search.ts`           | New: `normalizeQuery`, `cleanExcerpt`, `resultUrl`, `resultsMessage` (17 tests)                |
| `src/config/site.ts`          | "Search" nav item (blog flag)                                                                  |
| `docs/search.md`              | New: how it works, cost, safety, local dev                                                     |

## Why

- **Static index, browser search:** fits Cloudflare's free static hosting; no search API, no cost, and
  nobody else sees what readers search for.
- **Index only article bodies:** results are articles, not the home page or lists.
- **Loaded on demand:** nothing is downloaded until someone types on the search page.

## Issues hit and fixes

| Problem                                                                                  | Cause                                                                                                                                                         | Fix                                                                                |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `astro check`: `HTMLAnchorElement` not assignable to `string \| Response` in `.append()` | Cloudflare Workers types declare their own `Element.append` (HTMLRewriter), which merges with the DOM's                                                       | `appendChild()` (DOM-only API)                                                     |
| Browser test saw 7 requests to `…kaspersky-labs.com`                                     | **Kaspersky antivirus on the dev machine** injects a script into every page and intercepts HTTPS (also the cause of the Playwright download errors in step 2) | Not our site: the build has 0 such references. Documented in setup troubleshooting |

## Proof it works (real browser, production build, 360px)

| Query               | Results                                                            |
| ------------------- | ------------------------------------------------------------------ |
| `parseInt`          | 1: map(parseInt) article, "parseInt" highlighted                   |
| `flags`             | 2: deploy-is-not-release first                                     |
| `useEffect cleanup` | 1: useEffect article                                               |
| `kubernetes`        | "No articles match “kubernetes”. Try a shorter or different word." |

| Check                                    | Result                                                      |
| ---------------------------------------- | ----------------------------------------------------------- |
| Result links                             | Clean URLs (`/blog/…`, no `.html`); click opens the article |
| `/search?q=flags` opened directly        | Results shown on load                                       |
| Index blocked (simulates `npm run dev`)  | Friendly message, no error                                  |
| Downloads on first search                | ~90 KB compressed (13 KB JS + 72 KB WASM + ~6 KB index)     |
| Requests from our page to other domains  | 0 (GitHub links in header/footer are links, not loads)      |
| Width, light and dark                    | 360px, no sideways scroll                                   |
| Input focused on load; results announced | Yes (`role="status"`)                                       |

## Validation

- [x] "parseInt" → map(parseInt) first; "flags" → deploy article first
- [x] Clean result URLs with highlighted excerpts
- [x] Fits 360px light/dark; nothing loaded from other domains
- [x] lint, format, typecheck, tests (184), build pass
