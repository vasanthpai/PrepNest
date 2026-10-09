# v0.1 step 7: Folder structure, site config and feature flags

**Ticket:** [#2](https://github.com/vasanthpai/PrepNest/issues/2) · **Branch:** `feature/v0.1-foundation` ·
**Commit:** `feat: add site config, feature flags and folder structure`

## Goal

The skeleton every later feature plugs into: central site config, feature flags per environment,
and the feature folder convention.

## What changed

| File                     | Change                                                                            |
| ------------------------ | --------------------------------------------------------------------------------- |
| `src/config/app-env.ts`  | New: `AppEnv` type, `isAppEnv`, `parseAppEnv`                                     |
| `src/config/features.ts` | New: flag table, `isFeatureEnabled`, `enabledFeatures`, `findPromotionViolations` |
| `src/config/site.ts`     | New: name, tagline, description, nav (flag-aware), `navFor`                       |
| `src/config/*.test.ts`   | New: 20 tests (38 total in the project)                                           |
| `src/features/README.md` | New: anatomy and rules of a feature folder                                        |
| `docs/architecture.md`   | New: runtime overview, folder structure, config, flags, core rules                |
| `README.md`              | Tech-learning focus instead of exam prep                                          |

## Why

- **Flags separate deploy from release.** Code can reach production switched off; enabling it
  is a reviewed one-line change, and rollback is flipping it back.
- **The promotion rule is a test**, so the release process is enforced by CI, not by memory.
- **`as const satisfies FlagTable`** keeps exact flag names for autocomplete (`FeatureFlag` type)
  while still checking that every flag has all three environments.
- **`navFor` takes the flag check as a parameter** so tests can simulate "flag on" while every
  real flag is still off.
- **The site URL isn't in `site.ts`**: it differs per environment and comes from env config in step 8.

## Flags defined (all off until their version ships)

| Flag         | Version | Turns on                  |
| ------------ | ------- | ------------------------- |
| `blog`       | v0.2    | Blog pages and nav link   |
| `auth`       | v0.3    | Sign-in, dashboard        |
| `newsletter` | v0.4    | Email signup, free PDFs   |
| `quizzes`    | v0.5    | Quizzes and assessments   |
| `payments`   | v0.6    | Checkout and paid access  |
| `courses`    | v0.7    | Courses and course player |

## Validation

- [x] `npm test` → 4 files, 38 tests passed
- [x] `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm run build` pass
- [x] `@ts-expect-error` test proves a missing environment is a compile error
