# v0.1 step 13: Branch protection, Dependabot, security scanning, templates and first merge

**Ticket:** [#10](https://github.com/vasanthpai/PrepNest/issues/10) · **Branch:** `feature/v0.1-foundation` ·
**Commit:** `chore: add Dependabot, issue and PR templates, CODEOWNERS and security policy` ·
**PR:** [#8](https://github.com/vasanthpai/PrepNest/pull/8)

## Goal

Make the release process enforceable on GitHub, automate dependency and security checks, and
merge the v0.1 foundation through the full process.

## What changed

**In the repository**

| File                               | Change                                                                      |
| ---------------------------------- | --------------------------------------------------------------------------- |
| `.github/dependabot.yml`           | Weekly npm + Actions updates, grouped, conventional titles, TS 7 held back  |
| `.github/pull_request_template.md` | What / why / how tested / checklist                                         |
| `.github/ISSUE_TEMPLATE/`          | Feature/step and bug forms; private security link                           |
| `.github/CODEOWNERS`               | Owner for all files; sensitive paths listed                                 |
| `SECURITY.md`                      | Private vulnerability reporting                                             |
| `docs/github-setup.md`             | New: every GitHub setting, why, and how to recreate it                      |
| `docs/ci-cd.md`, `README.md`       | Protection and Dependabot sections; docs map (CI/CD row was missing, fixed) |

**On GitHub** (applied with the GitHub API, documented in [github-setup.md](../../github-setup.md))

| Area           | Setting                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| Merge          | Rebase merge only; delete branch after merge; auto-merge allowed                                         |
| Ruleset `main` | PR required, both checks required and up to date, linear history, no force push/deletion, no bypass      |
| Ruleset tags   | `v*` tags can't be deleted or moved                                                                      |
| Security       | Secret scanning + push protection, Dependabot alerts + security updates, private vulnerability reporting |

## Why

- Documented rules are suggestions; **rulesets make them enforced**, including for the owner.
- **Immutable release tags** make "redeploy the previous tag" a trustworthy rollback.
- **Push protection** stops the most common real-world leak: an API key committed by mistake.

## Issues hit and fixes

| Problem                                                      | Cause                                                             | Fix                                     |
| ------------------------------------------------------------ | ----------------------------------------------------------------- | --------------------------------------- |
| CodeQL: "languages you selected are not present"             | CodeQL detects languages from `main`, which only had the scaffold | Enable CodeQL right after merging PR #8 |
| README docs-map edits silently didn't apply (step 12 and 13) | Text replacement didn't match after Prettier re-aligned the table | Insert rows by line; verify with `grep` |

## Proof it works

| Test                               | Result                                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `GET /repos/…/rules/branches/main` | deletion, non_fast_forward, required_linear_history, pull_request (rebase), required_status_checks (2) |
| Direct push of a commit to `main`  | ❌ `GH013 … Changes must be made through a pull request` (main unchanged)                              |

## After the merge

| Check                                | Result                                                                 |
| ------------------------------------ | ---------------------------------------------------------------------- |
| PR #8 merged with "Rebase and merge" | ✅ 2026-10-09 by the maintainer; `main` linear, every step commit kept |
| Issues #1–#7                         | ✅ Closed automatically by the `Closes #N` lines                       |
| CI on `main` (`8daf9c4`)             | ✅ Passed                                                              |
| CodeQL default setup                 | ✅ Enabled (JavaScript/TypeScript + Actions) once `main` had the code  |
| Dependabot                           | Opened 2 PRs within minutes; both exposed problems (below)             |

## Dependabot follow-ups ([#13](https://github.com/vasanthpai/PrepNest/issues/13))

| PR                                                 | Problem                                                                      | Resolution                                                                                                            |
| -------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| #12 `sharp`, `wrangler`, `@cloudflare/vite-plugin` | CI failed: committed `worker-configuration.d.ts` stale after Wrangler update | Generate types on `npm install`, stop committing them ([ADR 0010](../../decisions/0010-generate-cloudflare-types.md)) |
| #11 `@types/node` 24 → 26                          | Types for a newer Node than we run                                           | Closed; Dependabot ignores `@types/node` majors (they follow `.nvmrc`)                                                |

## Validation

- [x] `main` protected by the ruleset, both checks required
- [x] Direct pushes to `main` rejected
- [x] PR #8 merged with "Rebase and merge" by the maintainer; issues #1–#7 closed
- [x] CI passes on `main` after the merge; CodeQL enabled
