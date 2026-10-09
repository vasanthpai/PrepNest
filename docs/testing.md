# Testing

## Test pyramid

| Layer           | Tool                     | What it covers                                  | Added in |
| --------------- | ------------------------ | ----------------------------------------------- | -------- |
| **Unit**        | Vitest                   | Pure logic: money, scoring, validation, helpers | v0.1     |
| **Integration** | Vitest + Cloudflare pool | Code that needs Workers APIs, DB, webhooks      | v0.3     |
| **End-to-end**  | Playwright               | Real browser flows: read a post, take a quiz    | v0.2     |

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
