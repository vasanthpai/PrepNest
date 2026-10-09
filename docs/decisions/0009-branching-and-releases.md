# 0009. Feature branches, tagged releases, gated production

- **Status:** Accepted
- **Date:** 2026-10-09
- **Ticket:** [#6](https://github.com/vasanthpai/PrepNest/issues/6)

## Context

The project should follow a production-grade workflow while being run by one person: every change
reviewed by CI, a staging copy to test on, deliberate production releases and a fast rollback.

## Decision

- `main` is always deployable. Work happens on `feature/<version>-<name>` branches.
- Changes reach `main` only by pull request with passing CI.
- Every merge to `main` deploys to **staging** automatically.
- A **SemVer tag** (`vX.Y.Z`) on `main` deploys to **production**, after manual approval in the
  GitHub Environment `production`.
- Each release has a CHANGELOG entry and a GitHub Release. Each step has a ticket (GitHub issue).
- Full procedure: [release-process.md](../release-process.md).

## Consequences

- Production only ever runs a tagged, tested commit; rollback = redeploy the previous tag.
- Database migrations must be backward-compatible (expand, then contract), because the previous
  tag must still run against the new schema.
- More ceremony than pushing straight to production, which is intended practice for real teams.
- As a solo developer, GitHub won't let you approve your own PR, so branch protection requires CI
  but not a PR review. Production still needs an explicit deployment approval.

## Alternatives considered

- **Deploy every merge to production**: fast, but no staging check and no release notes.
- **GitFlow (develop/release branches)**: heavy for one person and a continuously deployed site.
