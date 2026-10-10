# Testing

## Test pyramid

| Layer           | Tool                     | What it covers                                  | Added in |
| --------------- | ------------------------ | ----------------------------------------------- | -------- |
| **Unit**        | Vitest                   | Pure logic: money, scoring, validation, helpers | v0.1     |
| **Integration** | Vitest + Cloudflare pool | Code that needs Workers APIs, DB, webhooks      | v0.3     |
| **End-to-end**  | Playwright + axe         | Real browser: pages, journeys, accessibility    | v0.2     |

Most tests should be unit tests: they are fast (milliseconds) and pinpoint the broken function.

## Conventions

- Test files sit **next to the code** they test: `money.ts` → `money.test.ts`.
  In feature folders: `src/features/<name>/service.test.ts`.
- Import test functions explicitly: `import { describe, expect, it } from "vitest"`.
- Use the `@/` alias in imports, just like app code.
- One `describe` per function; test names read as sentences: `"rejects negative amounts"`.
- Use `it.each` tables for many input/output pairs (see `src/lib/money.test.ts`).
- Always test the **failure cases** (invalid input, edge cases), not only the happy path.
- Use **fakes** from `src/lib/providers/fakes/` instead of real email, payment or storage
  services (see [providers.md](providers.md)).
- **Contract tests** (`*.contract.ts`) define behaviour every implementation of an interface must
  have. They aren't run on their own; each implementation's test file calls them.
- **Check rendered text, not just source.** In `.astro` templates, whitespace between two `{…}`
  expressions on separate lines is dropped, so build strings in one expression
  (`countLabel()`, template strings). Browser tests (step 7) scan pages for glued words.
- Type-level rules can be tested with `// @ts-expect-error`: `npm run typecheck` fails if the
  line stops being an error.

## Running tests

```bash
npm test               # run once (what CI runs)
npm run test:watch     # re-run on save while you work
npx vitest run money   # only test files whose path matches "money"
```

In VS Code, the **Vitest** extension shows a beaker icon in the sidebar to run or debug single tests.

## Configuration

`vitest.config.ts`:

- `environment: "node"` — unit tests don't need a browser or the Workers runtime.
- `resolve.alias` — makes `@/…` imports work inside tests.
- `include` — only `src/**/*.test.ts(x)` files are treated as tests.

The config is deliberately separate from Astro's: loading the Cloudflare adapter would start
`workerd` for every test run and slow it down for no benefit.

## Browser tests (Playwright)

```bash
npm run build          # the tests run against the real build (astro preview, workerd)
npm run test:e2e       # phone (360×780) and desktop (1280×800)
npm run test:e2e:ui    # interactive runner: watch tests click through the site
npx playwright show-report   # after a failure: screenshots and step-by-step traces
```

| File                        | What it checks                                                                                                                                                   |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `e2e/pages.spec.ts`         | **Every page in the sitemap** (+ search, a tag page): 200, no console errors or third-party requests, fits the viewport, no glued words, one canonical, one `h1` |
| `e2e/accessibility.spec.ts` | axe-core, WCAG 2.1 A/AA, key pages in light and dark                                                                                                             |
| `e2e/journeys.spec.ts`      | Home → article → topic → tag; search and click-through; `?q=` links; dark mode survives reload                                                                   |
| `e2e/seo.spec.ts`           | Article metadata and JSON-LD, robots.txt, RSS links, preview image                                                                                               |
| `e2e/helpers.ts`            | `watchForProblems`, `gluedWords`, `horizontalOverflow`, `sitemapPaths`                                                                                           |

- New indexable pages are tested automatically, because `pages.spec.ts` reads the built sitemap.
- Prefer role- and label-based locators (`getByRole`, `getByLabel`): they also prove the page is
  accessible.
- `helpers.ts` ignores requests and errors from **antivirus software** on a developer machine
  (Kaspersky injects a script into every page). This never happens in CI.
- The suite was proven to fail on a real regression: reintroducing the footer's "© 2026PrepNest"
  bug failed every page test with `"2026PrepNest"` in the message.
