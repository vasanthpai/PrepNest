# v0.1 retrospective

**Released:** v0.1.0 on 2026-10-09 ·
**Live:** <https://prepnest-production.prepnest.workers.dev> ·
**Milestone:** 17 issues and PRs, all closed

## What we built

A deployable foundation and a complete delivery pipeline: strict TypeScript Astro app on Cloudflare
Workers, a "Syntax" design system, config validation, feature flags, provider interfaces, 84 unit
tests, and PR → CI → staging → tag → approval → production with smoke tests, rollback and
security scanning.

## What went well

- **Dry runs before real runs.** Installing tools in a scratch copy first caught TypeScript 7 vs
  typescript-eslint and the ESLint 10 accessibility plugin before they reached the repo.
- **Proving failures, not just successes.** Each guard was tested by breaking it on purpose:
  bad `APP_ENV` fails the build; a lint error fails CI; a bad PR title fails; a direct push to
  `main` is rejected; the smoke test fails on the wrong env or version.
- **Measuring instead of assuming.** Contrast was measured (and the comment colour failed);
  page weight was measured (~84 KB, React not loaded); the deploy was dry-run first.
- **The process caught a human mistake.** Before tagging, `git log` showed the wrong commit;
  the check in the instructions (and the workflow's version check) meant no wrong tag shipped.

## What we learned

| Lesson                                                               | Where it came from                           | Now                                         |
| -------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------- |
| Don't commit generated files                                         | First Wrangler update failed CI (#12)        | ADR 0010: generate on install               |
| Dependency bots need rules, not just enabling                        | `@types/node` 26 proposed for a Node 24 app  | Majors held for `typescript`, `@types/node` |
| `workflow_run` can be triggered by fork PRs on a branch named `main` | Writing the staging deploy                   | Deploy only for `push` events in this repo  |
| Text replacement in formatted tables is fragile                      | README rows silently not added (steps 12–13) | Insert by line; verify with `grep`          |
| Formatters can change rendering (whitespace)                         | Logo showed as `prep{nest }`                 | Layout that ignores whitespace              |
| Windows locks open folders                                           | `EPERM` on `dist/` during build              | Stop dev/preview before building            |
| Pulling a commit that untracks a file deletes it locally             | `cloudflare:workers` types missing           | `npm run cf-typegen`; in troubleshooting    |

## Numbers

| Metric                    | Value                                                               |
| ------------------------- | ------------------------------------------------------------------- |
| Unit tests                | 84 (11 files), ~0.3 s                                               |
| CI run                    | ~30–40 s                                                            |
| Staging deploy (after CI) | ~1–2 min including smoke test                                       |
| Home page                 | ~3 KB HTML + ~5 KB CSS (gzip), ~0.5 KB JS, 2 fonts (~75 KB, cached) |
| Worker upload             | ~150 KB gzip (limit 3 MB)                                           |
| Decision records          | 10                                                                  |
| Monthly cost              | ₹0                                                                  |

## Carry into v0.2

- Add **Playwright** smoke tests in CI and **preview deploys per PR** (planned).
- Keep each Dependabot PR small; read changelogs for anything major.
- Keep writing the ADR at the moment of a decision, not afterwards.
