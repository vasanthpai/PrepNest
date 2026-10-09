# v0.1 step 6: Vitest and money helpers

**Ticket:** [#1](https://github.com/vasanthpai/PrepNest/issues/1) · **Branch:** `feature/v0.1-foundation` ·
**Commit:** `test: add Vitest and money helpers with unit tests`

## Goal

Add Vitest as the unit test runner, with real first tests for the money helpers every paid
feature will use.

## What changed

| File                    | Change                                                                          |
| ----------------------- | ------------------------------------------------------------------------------- |
| `vitest.config.ts`      | New: Node environment, `@/` alias, test file pattern                            |
| `src/lib/money.ts`      | New: `Paise` type, `assertPaise`, `rupeesToPaise`, `paiseToRupees`, `formatINR` |
| `src/lib/money.test.ts` | New: 18 tests covering valid input, invalid input, rounding, formatting         |
| `package.json`          | `vitest`, `@types/node` dev dependencies; `test`, `test:watch` scripts          |
| `docs/testing.md`       | New: test pyramid, conventions, how to run                                      |
| `docs/setup.md`         | Test scripts in the table and the pre-commit checklist                          |

## Why

- **Integer paise:** `19.99 * 100` is `1998.9999999999998` in JavaScript. Storing integers avoids
  rounding bugs in prices, orders and refunds.
- **Branded `Paise` type:** TypeScript rejects a plain `number` where `Paise` is expected, so you
  can't pass rupees by mistake. Values only become `Paise` through `assertPaise` / `rupeesToPaise`.
- **Reject, don't round:** `rupeesToPaise(19.999)` throws instead of silently changing a price.
- **Separate Vitest config:** unit tests run in plain Node (about 150 ms), without starting `workerd`.

## Design decisions

| Decision                                     | Alternative              | Why this one                                |
| -------------------------------------------- | ------------------------ | ------------------------------------------- |
| `formatINR` drops `.00` for whole rupees     | Always 2 decimals        | `₹499` reads better on price cards          |
| Shows 2 decimals otherwise (`₹12,34,567.50`) | Intl default (`.5`)      | Money should never show 1 decimal place     |
| Tests co-located with code                   | Separate `tests/` folder | Easy to find; moves with the feature folder |

## Issues hit and fixes

| Problem                                                       | Cause                                                            | Fix                                                                             |
| ------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `formatINR` showed `₹12,34,567.5`                             | `Intl` drops trailing zeros by default                           | Separate formatter with exactly 2 decimals when there are paise                 |
| `astro check`: `Cannot find name 'node:url'` in vitest config | TypeScript 6 no longer auto-loads `@types/*`; Node types missing | `@types/node@^24` + `/// <reference types="node" />` in `vitest.config.ts` only |

## Validation

- [x] `npm test` → 1 file, 18 tests passed
- [x] `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm run build` pass
