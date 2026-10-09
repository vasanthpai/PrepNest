# 0004. Feature flags as code

- **Status:** Accepted
- **Date:** 2026-10-09
- **Ticket:** [#2](https://github.com/vasanthpai/PrepNest/issues/2)

## Context

We want to merge and deploy unfinished features safely, test them on staging, then release to
production separately, and turn a broken feature off quickly.

## Decision

Flags live in a typed table in `src/config/features.ts`: one on/off value per environment
(`local`, `staging`, `production`). Code reads them with `featureEnabled(flag)`. A unit test enforces
the **promotion rule**: a flag can't be on in production unless it's on in staging.

## Consequences

- Deploying code and releasing a feature are separate decisions.
- Changing a flag is a reviewed PR that goes through CI: auditable, but takes minutes, not seconds.
- No extra service, cost or network call; flags are free and type-checked (unknown flag names
  don't compile, a missing environment doesn't compile).
- No per-user targeting or percentage rollouts. If needed later, a new ADR can introduce a flag
  service behind the same `featureEnabled()` function.

## Alternatives considered

- **Hosted flag service (LaunchDarkly, Unleash, Flagsmith)**: instant toggles and targeting, but
  cost, another dependency and a network call per request.
- **Environment variables per flag**: no type safety, easy to forget one environment.
- **Long-lived feature branches**: painful merges; the problem flags exist to avoid.
