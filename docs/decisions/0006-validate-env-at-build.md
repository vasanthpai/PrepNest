# 0006. Validate configuration with zod, failing the build

- **Status:** Accepted
- **Date:** 2026-10-09
- **Ticket:** [#3](https://github.com/vasanthpai/PrepNest/issues/3)

## Context

Three environments, each with its own variables and secrets. A missing or misspelled value
should never reach users as a confusing runtime bug, and secret values must never appear in logs.

## Decision

Every variable is declared in one zod schema (`src/config/env.ts`). `getConfig()` validates the
Cloudflare `env` once and caches it. `src/middleware.ts` calls it for every request **and every
pre-rendered page during the build**, so bad config fails `npm run build` and therefore the deploy.
Error messages list variable names and rules, never values (tested).

## Consequences

- Misconfiguration is caught before anything ships.
- One place documents every variable ([environments.md](../environments.md)).
- Adding a variable takes a few steps (schema, wrangler/secret, types, docs); there's a checklist.

## Alternatives considered

- **Read `env` directly where needed**: no validation, errors surface late and far away.
- **Validate lazily per feature**: misconfiguration discovered only when that feature is used.
