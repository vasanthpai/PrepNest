# Architecture Decision Records (ADRs)

An ADR is a short note about one important decision: the situation, what we chose, what it costs,
and what we rejected. ADRs are never edited after they're accepted. If a decision changes, a new ADR
**supersedes** the old one, so the history of reasoning stays visible.

## Index

| #                                           | Decision                                                | Status   | Date       |
| ------------------------------------------- | ------------------------------------------------------- | -------- | ---------- |
| [0001](0001-record-decisions.md)            | Record architecture decisions                           | Accepted | 2026-10-09 |
| [0002](0002-astro-on-cloudflare-workers.md) | Astro on Cloudflare Workers                             | Accepted | 2026-10-05 |
| [0003](0003-money-as-integer-paise.md)      | Store money as integer paise                            | Accepted | 2026-10-09 |
| [0004](0004-feature-flags-as-code.md)       | Feature flags as code                                   | Accepted | 2026-10-09 |
| [0005](0005-provider-interfaces.md)         | Outside services behind interfaces, with fakes          | Accepted | 2026-10-09 |
| [0006](0006-validate-env-at-build.md)       | Validate configuration with zod, failing the build      | Accepted | 2026-10-09 |
| [0007](0007-syntax-design-system.md)        | "Syntax" design system with self-hosted fonts           | Accepted | 2026-10-09 |
| [0008](0008-pin-typescript-6.md)            | Pin TypeScript to 6.0 for now                           | Accepted | 2026-10-07 |
| [0009](0009-branching-and-releases.md)      | Feature branches, tagged releases, gated production     | Accepted | 2026-10-09 |
| [0010](0010-generate-cloudflare-types.md)   | Generate Cloudflare types on install, don't commit them | Accepted | 2026-10-09 |

## Template

```markdown
# NNNN. Title in the imperative ("Use X for Y")

- **Status:** Proposed | Accepted | Superseded by [NNNN](NNNN-....md)
- **Date:** YYYY-MM-DD
- **Ticket:** #n

## Context

What situation forces a decision? Constraints, requirements, what we know.

## Decision

What we chose, stated plainly.

## Consequences

What becomes easier, what becomes harder, what we must now do.

## Alternatives considered

- **Option**: why not.
```

## When to write one

Write an ADR when a choice is **hard to reverse**, **affects many files**, or **someone will ask
"why?"** later: a framework, a database, a data format, a security rule, a process.
