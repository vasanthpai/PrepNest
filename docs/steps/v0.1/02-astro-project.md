# v0.1 step 2: Astro project, strictest TypeScript, git

**Ticket:** — · **Branch:** `main`, then `feature/v0.1-foundation` · **Commits:** `fae3ed3`, `c72a92e`

## Goal

Generate a minimal Astro project, make the first commit on `main`, then branch for v0.1 work.

## What changed

| File            | Change                                                  |
| --------------- | ------------------------------------------------------- |
| (scaffold)      | `npm create astro` minimal template (Astro 7)           |
| `tsconfig.json` | `astro/tsconfigs/strictest` + `@/*` path alias          |
| `.nvmrc`        | Pins Node 24 (CI reads this)                            |
| `package.json`  | `name: prepnest`, `engines.node: >=24`                  |
| `.gitignore`    | Ignores build output, `.dev.vars`, `.env*`, test output |
| `README.md`     | Short project intro                                     |
| `docs/setup.md` | Local setup guide                                       |

## Why

- `strictest` catches bugs like unchecked `array[0]` access early.
- Secrets are git-ignored from day one, before any secrets exist.
- `main` holds only the scaffold; all v0.1 work arrives via a pull request.

## Validation

- [x] `npm run build` → `[build] Complete!`
- [x] Local site at http://localhost:4321
- [x] `main` and `feature/v0.1-foundation` pushed to GitHub
