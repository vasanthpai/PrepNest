# v0.3 step 3: Database schema and data layer with Drizzle

**Ticket:** [#56](https://github.com/vasanthpai/PrepNest/issues/56) · **Branch:**
`feature/v0.3-data-layer` · **Commit:** `chore: add the users and webhook_events tables with Drizzle`

## Goal

The first two tables and a small, tested data layer, ready for sign-in (step 6) and the Clerk
webhook (step 7). Nothing in the app uses them yet. Guide: [database.md](../../database.md).

## What changed

| File                                              | Change                                                                                                                                |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json`                                    | `drizzle-orm` 0.45.4; dev: `drizzle-kit` 0.31.11, `@electric-sql/pglite` 0.5.16 (all pinned); `db:generate`, `db:check`, `db:migrate` |
| `src/features/users/schema.ts`, `repo.ts`         | `users` table; upsert from Clerk, find by Clerk id, delete                                                                            |
| `src/features/webhooks/schema.ts`, `repo.ts`      | `webhook_events` table; record an event, mark it processed                                                                            |
| `src/lib/db/schema.ts`, `client.ts`, `testing.ts` | All tables in one place; `createDb()` over Neon HTTP; `createTestDb()` on PGlite                                                      |
| `drizzle.config.ts`, `drizzle/0000_init.sql`      | drizzle-kit settings; the first migration (generated, reviewed)                                                                       |
| `scripts/db-migrate.ts`                           | Applies pending migrations, reports how many, never prints the URL                                                                    |
| `docs/database.md`                                | Tables, layout, commands, how to change the schema safely                                                                             |
| `.prettierignore`                                 | `drizzle/` (generated files)                                                                                                          |

Stable Drizzle (0.45) rather than the 1.0 release candidate; upgrading is a later, separate step.

## Design choices

- **One `Database` type for Neon and PGlite.** Repositories take it as their first argument, so
  the exact queries production runs are the ones the tests run.
- **Tests apply the real migrations.** `createTestDb()` runs `drizzle/` on a fresh in-memory
  database for every test: the migration SQL is tested too, and CI needs no database secret.
- **Upsert by Clerk id.** First sign-in and the webhook can arrive in either order; both call the
  same upsert, and the unique `clerk_user_id` makes that safe.
- **Webhook idempotency that survives crashes.** An event is recorded on arrival but only marked
  processed after the work succeeds, so a retry after a failure runs it again while a retry after
  success is skipped.
- **Composite key `(source, id)`** for webhook events, so Razorpay (v0.8) can reuse the table.

## Verified

| Check                                    | Result                                                                                                                                    |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Repository tests on PGlite (9)           | Pass: create, update in place, keep people apart, missing user, delete twice; new, processed, failed-then-retried, same id in two sources |
| `npm run db:check`                       | "Everything's fine"                                                                                                                       |
| `npm run db:migrate` on `dev`, first run | Applied 1 new migration; 1 in total                                                                                                       |
| Same, second run                         | Applied 0; 1 in total (safe to repeat)                                                                                                    |
| Tables on `dev`                          | `users`, `webhook_events`, `drizzle.__drizzle_migrations`                                                                                 |

**Bug found and fixed:** the first `db:migrate` failed with
`relation "drizzle.__drizzle_migrations" does not exist`. My "count if the table exists" query was
one statement, and Postgres resolves every table name before running it. Split into two queries.

## Not in this step

- Staging and production aren't migrated yet: the deploy workflows do that in step 4, using the
  GitHub environment secrets.
- `DATABASE_URL` joins the zod config schema when the app first uses the database (step 4).
