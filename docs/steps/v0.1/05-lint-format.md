# v0.1 step 5: ESLint, Prettier, type checking, LF line endings

**Ticket:** — · **Branch:** `feature/v0.1-foundation` · **Commit:** `4533635`

## Goal

Automatic quality gates: ESLint (bugs, a11y), Prettier (style), `astro check` (types), LF everywhere.

## What changed

| File                      | Change                                                                   |
| ------------------------- | ------------------------------------------------------------------------ |
| `eslint.config.js`        | ESLint 10 flat config: typescript-eslint, astro, react-hooks, jsx-a11y-x |
| `.prettierrc.json`        | Prettier with astro + tailwind plugins, width 100                        |
| `.prettierignore`         | Skips build output and lockfile                                          |
| `.gitattributes`          | `* text=auto eol=lf`, binaries marked                                    |
| `.vscode/settings.json`   | Format on save, ESLint fix on save, LF                                   |
| `.vscode/extensions.json` | Recommended extensions                                                   |
| `astro.config.mjs`        | `imageService: "compile"`                                                |
| `package.json`            | `lint`, `lint:fix`, `format`, `format:check`, `typecheck` scripts        |

## Why

- Each tool has one job; `eslint-config-prettier` stops ESLint and Prettier fighting.
- LF line endings stop Windows-vs-Linux CI format failures.
- `imageService: "compile"`: images are optimised at build time instead of via the Cloudflare
  Images binding (a separate product with its own limits).

## Version decisions (dry-run caught these)

| Package                    | Decision              | Reason                                                    |
| -------------------------- | --------------------- | --------------------------------------------------------- |
| `typescript`               | pinned `~6.0`         | TS 7 not yet supported by typescript-eslint / astro check |
| `eslint-plugin-jsx-a11y-x` | instead of `jsx-a11y` | `jsx-a11y` does not support ESLint 10 yet                 |

## Validation

- [x] `npm run lint` → no problems
- [x] `npm run format:check` → all files formatted
- [x] `npm run typecheck` → 0 errors, 0 warnings, 0 hints
- [x] `git ls-files --eol` → no CRLF files
