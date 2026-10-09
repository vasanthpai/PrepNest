# v0.1 step 4: Cloudflare adapter and wrangler environments

**Ticket:** — · **Branch:** `feature/v0.1-foundation` · **Commit:** `8ec0971`

## Goal

Build PrepNest as a Cloudflare Worker with `staging` and `production` environments.

## What changed

| File               | Change                                                                          |
| ------------------ | ------------------------------------------------------------------------------- |
| `astro.config.mjs` | `@astrojs/cloudflare` adapter; `session: false`                                 |
| `wrangler.jsonc`   | Worker config: `nodejs_compat`, assets, `APP_ENV` var, `env.staging/production` |
| `package.json`     | `@astrojs/cloudflare`, `wrangler`                                               |
| `docs/setup.md`    | "How Cloudflare fits in" section                                                |

## Why

- `astro dev` and `astro preview` run on `workerd`, the same runtime as production.
- The Wrangler environment is chosen at **build** time (`CLOUDFLARE_ENV=staging`), so CI builds per env.
- `session: false`: auth is handled by Clerk, so no `SESSION` KV namespace gets auto-provisioned.

## Issues hit and fixes

| Problem                                  | Cause                                     | Fix                              |
| ---------------------------------------- | ----------------------------------------- | -------------------------------- |
| `EPERM: Permission denied … dist\client` | A preview server still had `dist/` open   | Stop dev/preview before building |
| `Enabling sessions with Cloudflare KV`   | Adapter enables Astro sessions by default | `session: false` in config       |

## Validation

- [x] Build output has no KV namespace binding
- [x] `npm run preview` → HTTP 200 with heading and island
