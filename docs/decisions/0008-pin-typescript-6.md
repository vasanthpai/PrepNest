# 0008. Pin TypeScript to 6.0 for now

- **Status:** Accepted (temporary: revisit when tooling supports TypeScript 7)
- **Date:** 2026-10-07
- **Ticket:** v0.1 step 5 (before ticketing)

## Context

TypeScript 7 (the native rewrite) is the latest release, but `typescript-eslint` supports
`typescript < 6.1` and `@astrojs/check` supports `^5 || ^6`. Installing TypeScript 7 breaks linting
and type checking.

## Decision

Pin `typescript` to `~6.0` in `package.json`. TypeScript 6 also stopped auto-loading `@types/*`, so
Node types are referenced explicitly, and only in `vitest.config.ts`.

## Consequences

- Lint and type check work today.
- We miss TypeScript 7's speed for now.
- Dependabot will propose upgrades; we upgrade once `typescript-eslint` and `@astrojs/check`
  support 7, in a new ADR superseding this one.

## Alternatives considered

- **TypeScript 7 without type-aware linting**: loses lint rules we rely on.
- **`--legacy-peer-deps`**: hides real incompatibilities; rejected.
