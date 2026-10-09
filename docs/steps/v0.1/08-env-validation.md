# v0.1 step 8: Environment validation and typed Cloudflare env

**Ticket:** [#3](https://github.com/vasanthpai/PrepNest/issues/3) · **Branch:** `feature/v0.1-foundation` ·
**Commit:** `feat: validate environment config and generate Cloudflare env types`

## Goal

Validate configuration once with clear errors, give every Cloudflare variable a type, and document
every variable for every environment.

## What changed

| File                        | Change                                                                        |
| --------------------------- | ----------------------------------------------------------------------------- |
| `src/config/env.ts`         | New: zod `envSchema`, `parseEnv` (errors name variables, never values)        |
| `src/config/env.test.ts`    | New: 6 tests incl. "secret values never appear in errors"                     |
| `src/lib/runtime-env.ts`    | New: `getConfig()` (validated, cached), `featureEnabled(flag)`                |
| `src/middleware.ts`         | New: validates config on every request and pre-rendered page                  |
| `worker-configuration.d.ts` | New, generated: typed `env` (`APP_ENV: "local" \| "staging" \| "production"`) |
| `.dev.vars.example`         | New: template for local secrets, grouped by version                           |
| `package.json`              | `zod` dependency, `cf-typegen` script                                         |
| `docs/environments.md`      | New: environments, where values live, full variable reference                 |

## Why

- **Fail fast:** the middleware also runs while pre-rendering pages at build time, so a bad
  config breaks `npm run build`, and later the CI deploy, before anything reaches users.
- **One door for config:** features call `getConfig()` / `featureEnabled()`, never `env` directly.
  Validation and caching live in one place.
- **Secrets never logged:** errors list variable names and rules only. A test proves a
  secret-looking value is not in the message.
- **Generated types are committed** so CI can type-check without running wrangler.

## Proof it works

| Scenario                                    | Result                                                                                             |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `APP_ENV` set to `"prod"` in wrangler.jsonc | `npm run build` fails: `APP_ENV: Invalid option: expected one of "local"\|"staging"\|"production"` |
| Error message                               | Does **not** contain the bad value                                                                 |
| `CLOUDFLARE_ENV=staging npm run build`      | Output config has `APP_ENV: "staging"`, worker `prepnest-staging`                                  |

## Validation

- [x] `npm test` → 5 files, 44 tests passed
- [x] lint, format:check, typecheck, build pass
- [x] Wrong `APP_ENV` fails the build with a clear message
