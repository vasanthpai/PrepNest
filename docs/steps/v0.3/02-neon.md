# v0.3 step 2: Connect to Neon Postgres

**Ticket:** [#54](https://github.com/vasanthpai/PrepNest/issues/54) · **Branch:** `feature/v0.3-neon` ·
**Commit:** `chore: connect to Neon Postgres in every environment`

## Goal

A Postgres database for every environment, chosen and documented, and a safe way to check each
connection string works. No tables yet (step 3). Decision record:
[ADR 0012](../../decisions/0012-neon-postgres-and-drizzle.md).

## Done in Neon and GitHub (by hand)

| What                                                       | Where                                  |
| ---------------------------------------------------------- | -------------------------------------- |
| Project in AWS Singapore, Postgres 18                      | Neon                                   |
| Branches: default (production), `staging`, `dev`           | Neon → Branches                        |
| `DATABASE_URL`, `dev`, pooled                              | `.dev.vars`                            |
| `DATABASE_URL`, `staging` and default, pooled              | Worker secrets (`wrangler secret put`) |
| `DATABASE_URL`, `staging` and default, direct (for step 4) | GitHub environment secrets             |

Every value went in through a hidden prompt or straight into `.dev.vars`; none was pasted in chat.
We skipped Neon's "set up with an AI assistant" prompt for the same reason.

## What changed

| File                                                         | Change                                                                      |
| ------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `package.json`                                               | `@neondatabase/serverless` 1.2.0 (pinned); `npm run db:ping`                |
| `src/lib/db/connection-string.ts`                            | Describe a connection string safely; redact secrets from any text           |
| `src/lib/db/connection-string.test.ts`                       | 12 tests: pooled/direct, bad values, messages never contain the value       |
| `scripts/db-ping.ts`                                         | Connects, prints host, database, pooling, server version and latency        |
| `docs/decisions/0012-…`                                      | Neon + Drizzle, HTTP driver, branch per environment, previews share staging |
| `docs/environments.md`, `docs/setup.md`, `.dev.vars.example` | Where each string lives, how to get, check and rotate it                    |

## Verified

`npm run db:ping` against the `dev` branch:

```
Database  neondb on ep-…-pooler.ap-southeast-1.aws.neon.tech
Settings  pooled, user neondb_owner, sslmode require
Server    PostgreSQL 18.6
Latency   first query 1345 ms, second 228 ms
✓ Database reachable
```

The first query wakes the idle database; the second is the normal speed.

Failure cases (run with a broken `DATABASE_URL`; checked that the output contains no password or
connection string):

| Case           | Output                                                                   |
| -------------- | ------------------------------------------------------------------------ |
| Empty          | `✗ DATABASE_URL is not set`                                              |
| Not a URL      | `✗ DATABASE_URL is not a valid URL`                                      |
| Wrong scheme   | `✗ DATABASE_URL must start with postgresql:// or postgres://`            |
| Wrong password | `✗ Query failed: password authentication failed for user 'neondb_owner'` |

That test found a bug: with a one-letter password, redaction replaced every matching letter in the
message ("\*\*\*ostgresql"). Passwords shorter than 6 characters are no longer redacted as text;
whole connection strings always are.

Worker and GitHub secrets were confirmed by name only (`wrangler secret list`, `gh secret list`).
They are first used in step 4 (migrations and the health check).

## Not in this step

- `DATABASE_URL` is not yet in the zod config schema: the app doesn't use it until step 3, and CI
  builds have no database secret.
- Tables, Drizzle and migrations: steps 3 and 4.
