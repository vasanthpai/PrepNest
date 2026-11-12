# 0012. Neon Postgres with Drizzle, over HTTP, one branch per environment

- **Status:** Accepted
- **Date:** 2026-11-12
- **Ticket:** [#54](https://github.com/vasanthpai/PrepNest/issues/54)

## Context

v0.3 adds accounts, and later versions add quizzes, progress, orders and enrollments: relational
data with constraints and transactions. It must run on the free tier, be reachable from Cloudflare
Workers, and keep local, staging and production data apart. Previews (one per pull request) are
versions of the staging Worker, so they see staging's secrets.

## Decision

- **Neon** (serverless Postgres), free plan, region AWS Singapore (closest to India).
  Measured from India: first query ~1.3 s while an idle database wakes up, then ~230 ms.
- **One Neon branch per environment**, all from the default branch:

  | Neon branch      | Used by                     | Connection string lives in                                       |
  | ---------------- | --------------------------- | ---------------------------------------------------------------- |
  | default (`main`) | production                  | Worker secret (pooled) + GitHub `production` env secret (direct) |
  | `staging`        | staging **and PR previews** | Worker secret (pooled) + GitHub `staging` env secret (direct)    |
  | `dev`            | your machine                | `.dev.vars` (pooled)                                             |

- **Pooled** connection strings for the app (many short-lived requests), **direct** ones for
  migrations (one long session, step 4).
- **Driver: `@neondatabase/serverless` over HTTP.** Each query is one `fetch`, which Workers
  support natively; no TCP sockets or connection lifecycle per request.
- **Query layer and migrations: Drizzle ORM + drizzle-kit** (step 3): schema in TypeScript,
  SQL-like queries with types inferred from the schema, plain SQL migration files reviewed in PRs,
  small runtime, works with the Neon HTTP driver.
- Connection strings are never printed: `src/lib/db/connection-string.ts` describes and redacts
  them, and `npm run db:ping` uses it.

## Consequences

- Real Postgres everywhere (constraints, transactions, JSON), no local database to install.
- **Previews share the staging database.** A pull request's code can read and write staging data,
  and migrations must stay backward-compatible (expand, then contract: release process §8).
  Previews never run migrations; only the staging and production deploys do.
- The HTTP driver has no interactive transactions (begin, read, decide, write). Multi-statement
  transactions are sent as one batch (`sql.transaction([...])`). If a feature needs interactive
  transactions, use the driver's WebSocket `Pool` for that code path, or Cloudflare Hyperdrive.
- Cold starts: the first request after the database idles is ~1 s slower. Acceptable for a
  portfolio site; a paid plan can keep compute warm.
- Unit tests stay database-free; data-layer tests run on PGlite (Postgres compiled to
  WebAssembly, in memory) from step 3, so CI needs no database secrets.
- Free-plan limits (storage, compute hours, branches) are Neon's to change; check
  <https://neon.com/pricing> before relying on a number.

## Alternatives considered

- **Cloudflare D1 (SQLite):** free and closest to Workers, but SQLite semantics and no
  branch-per-environment workflow; Postgres skills transfer further.
- **Supabase:** Postgres plus auth and storage; the free plan pauses inactive projects, and we
  already chose Clerk for auth.
- **Hyperdrive + any Postgres over TCP:** faster repeated queries, more setup; revisit if latency
  becomes a problem.
- **Prisma:** popular, but a heavier client and a schema language of its own; Drizzle stays closer
  to SQL.
- **A Neon branch per pull request:** full isolation for previews, but more workflow code and
  branch limits; rejected for now (v0.3 decision 3A).
