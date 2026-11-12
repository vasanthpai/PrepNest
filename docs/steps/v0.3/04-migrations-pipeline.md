# v0.3 step 4: Migrations in the pipelines; the database in health checks

**Ticket:** [#58](https://github.com/vasanthpai/PrepNest/issues/58) · **Branch:**
`feature/v0.3-migrations-pipeline` · **Commit:**
`ci: migrate the database on deploy and check it in health and smoke tests`

## Goal

Schema changes reach staging and production automatically, before the code that needs them, and
every deploy proves the live app can reach its own database.

## How a deploy works now

```
staging (every merge to main)            production (every release tag)
  build                                    verify tag → [approval]
  migrate  ← GitHub env secret (direct)    build
  deploy                                   migrate  ← GitHub env secret (direct)
  smoke: /api/health database=ok           deploy
         ← Worker secret (pooled)          smoke: /api/health database=ok
```

The two checks prove different secrets: `migrate` uses the GitHub environment secret, and the
smoke test's `database: ok` comes from the live Worker using its own secret.

## What changed

| File                                           | Change                                                                             |
| ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`                     | `db:check`, and fail if `drizzle-kit generate` would create a new migration        |
| `deploy-staging.yml`, `deploy-production.yml`  | `npm run db:migrate` before `wrangler deploy` (production: after approval)         |
| `src/config/env.ts`                            | `DATABASE_URL`: optional, must be `postgresql://`, empty counts as missing         |
| `src/lib/db/check.ts`                          | `checkDatabase()`: `select 1` with an 8 s timeout; never throws; logs redacted     |
| `src/lib/health.ts`, `src/pages/api/health.ts` | New `database` field; `degraded` + HTTP 503 if a deployed environment can't use it |
| `scripts/smoke-test.ts`                        | Outside `local`, requires `database: ok`; a 503 now explains why                   |
| Docs                                           | ci-cd, database, release process, environments                                     |

## Why `DATABASE_URL` is optional in the schema

Worker secrets exist only when the Worker runs on Cloudflare, not while CI builds the site, and the
build validates the config. A required variable would fail every build. Instead, the rule is
enforced where the secret exists: a deployed environment without a working database reports
`degraded` (503), and the smoke test fails the deploy.

| Environment         | `database`       | `status`   | HTTP |
| ------------------- | ---------------- | ---------- | ---- |
| any                 | `ok`             | `ok`       | 200  |
| local               | `not-configured` | `ok`       | 200  |
| staging, production | `not-configured` | `degraded` | 503  |
| any                 | `unreachable`    | `degraded` | 503  |

## Verified

| Check                                                                                        | Result                                             |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Unit tests: health states, `checkDatabase` (ok, failure, timeout, no secret in logs), config | Pass                                               |
| CI migration check on a clean tree                                                           | "Everything's fine", "No schema changes"           |
| Same, after adding a column without generating                                               | Caught: a new `0001_…sql` appeared (then reverted) |
| Local build + preview with `.dev.vars`                                                       | `{"status":"ok","env":"local","database":"ok",…}`  |
| PR preview smoke test (staging Worker secret)                                                | See the PR                                         |

## After merging

- Deploy staging migrates the `staging` branch (first time: `0000_init`) and its smoke test must
  show `database=ok`.
- The next release (v0.3.0) does the same for production.
