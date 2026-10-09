# v0.1 step 15: Deploy staging automatically, with smoke test

**Ticket:** [#16](https://github.com/vasanthpai/PrepNest/issues/16) · **Branch:** `feature/v0.1-deploy` ·
**Commit:** `ci: deploy staging after CI passes on main, with smoke test`

## Goal

Every commit on `main` that passes CI deploys to the staging Worker automatically, and a smoke test
proves the live site works. PrepNest's first live URL.

## What changed

| File                                   | Change                                                                             |
| -------------------------------------- | ---------------------------------------------------------------------------------- |
| `.github/workflows/deploy-staging.yml` | New: after CI succeeds on a push to `main` → build → deploy → smoke test → summary |
| `scripts/smoke-test.ts`                | New: checks `/api/health`, `/`, `/favicon.svg` on a live URL, with retries         |
| `package.json`                         | `smoke` script                                                                     |
| `eslint.config.js`                     | `scripts/**` may print with `console.log`                                          |
| `docs/ci-cd.md`, `docs/setup.md`       | Deploy staging section, smoke test, troubleshooting                                |

## Why

- **`workflow_run` after CI** instead of `push`: deploys never race CI and never ship a failing commit.
- **Exact commit:** checks out the SHA CI tested.
- **Fork protection:** runs only for `push` events in this repository. A fork PR from a branch named
  `main` also completes "CI on main"; without this check it would run with our deploy secrets.
- **Smoke test** turns "upload finished" into "site verified": right environment, right version,
  `noindex` on staging, no caching on the health endpoint.
- The smoke script runs with Node 24's built-in TypeScript support: no build step, no dependency.

## Issues hit and fixes

| Problem                                                    | Cause                                                                                | Fix                                            |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------- |
| `Cannot find module 'cloudflare:workers'` after `git pull` | Pulling the commit that untracked `worker-configuration.d.ts` deletes the local copy | `npm run cf-typegen`; added to troubleshooting |

## Proof before merging

| Test                                                         | Result                                                              |
| ------------------------------------------------------------ | ------------------------------------------------------------------- |
| Smoke test vs local preview (`--env local`)                  | ✓ health, ✓ home (noindex), ✓ favicon → exit 0                      |
| Smoke test with wrong env/version                            | ✗ `env=local (want production)`, ✗ `noindex in production` → exit 1 |
| `CLOUDFLARE_ENV=staging` build + `wrangler deploy --dry-run` | Bindings `ASSETS`, `APP_ENV="staging"` only; 150 KiB gzip upload    |

## First live deploy (PR #17 merged, 2026-10-09)

| Check                                   | Result                                                          |
| --------------------------------------- | --------------------------------------------------------------- |
| CI on `main` → Deploy staging triggered | ✅ automatically, run `37932900719`                             |
| Steps                                   | ✅ checkout, install, build, deploy, smoke test, summary        |
| Live URL                                | **https://prepnest-staging.prepnest.workers.dev**               |
| Smoke test (in the workflow)            | ✓ health `env=staging version=0.0.1`, ✓ home noindex, ✓ favicon |
| `/api/health` (checked independently)   | `{"status":"ok","env":"staging","version":"0.0.1",…}`           |
| Home page                               | HTTP 200, 10.5 KB, 0.7 s; staging banner; `noindex, nofollow`   |
| `wrangler deployments list`             | Version recorded by Cloudflare (usable for emergency rollback)  |

## Validation

- [x] Smoke test passes and fails correctly (local)
- [x] Dry run shows the staging config
- [x] Merging deploys staging automatically after CI passes
- [x] Smoke test passes against the live staging URL
- [x] Environments panel shows `staging` with the live URL
