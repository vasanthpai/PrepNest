# v0.1 step 16: Production deploy workflow and v0.1.0 release

**Ticket:** [#18](https://github.com/vasanthpai/PrepNest/issues/18) ·
**Branches:** `feature/v0.1-production-deploy`, then `release/v0.1.0` ·
**Commits:** `ci: deploy production from release tags after approval`, `chore(release): v0.1.0`

## Goal

Release v0.1.0 to production through the full process, and make rollback a documented, tested
procedure.

## What changed

| File                                      | Change                                                                                        |
| ----------------------------------------- | --------------------------------------------------------------------------------------------- |
| `.github/workflows/deploy-production.yml` | New: verify → approval → deploy → smoke test → GitHub Release; manual run on a tag = rollback |
| `docs/release-process.md`                 | Step-by-step rollback (redeploy previous tag; emergency `wrangler rollback`)                  |
| `docs/ci-cd.md`                           | Deploy production section                                                                     |
| `CHANGELOG.md`, `package.json`            | Release PR: `[0.1.0]` section, version `0.1.0`                                                |

## Why

- **Verify before approval:** a mistyped tag, a tag on a non-`main` commit, a version mismatch or a
  missing changelog fails fast, before anyone is asked to approve.
- **Approval gates the secret:** the production token is only released to the job after approval.
- **The release is published only after the smoke test passes**, so a GitHub Release always means
  "this is live and verified".
- **Rollback reuses the same workflow** on an older tag (no new release), so it is tested every
  time a normal release runs.

## Proof before merging

| Test                                                        | Result                                                        |
| ----------------------------------------------------------- | ------------------------------------------------------------- |
| Release-notes extraction on a sample CHANGELOG (3 versions) | Correct section for each; missing version → workflow fails    |
| Last section followed by link references                    | Fixed: extraction stops at `[x.y.z]: …` lines                 |
| `wrangler rollback --name`, `deployments list --name`       | Both exist in the installed Wrangler; staging versions listed |

## Release (2026-10-09)

| Step                                   | Result                                                                                                |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| PR #19 (production workflow) merged    | ✅ staging redeployed automatically                                                                   |
| PR #20 `chore(release): v0.1.0` merged | ✅ staging reported `version: 0.1.0` (release candidate)                                              |
| Tag `v0.1.0`                           | ✅ annotated, by Vasantha Pai, on `ff631b9 chore(release): v0.1.0`                                    |
| Verify release                         | ✅ tag on `main`, version matches, CHANGELOG section present                                          |
| Approval                               | ✅ approved by @vasanthpai: "v0.1.0 checked on staging"                                               |
| Deploy + smoke test                    | ✅ health `env=production version=0.1.0`, home indexable, favicon                                     |
| GitHub Release                         | ✅ [v0.1.0](https://github.com/vasanthpai/PrepNest/releases/tag/v0.1.0), latest, notes from CHANGELOG |
| Independent check                      | No banner, no robots meta, footer `v0.1.0 · production`, 200 in 0.57 s                                |
| Milestone v0.1                         | ✅ closed (17/17)                                                                                     |

**Caught by the process:** the first `git log` before tagging showed the PR #19 commit, not the
release commit (PR #20 wasn't merged yet). Checking before tagging, plus the workflow's
version check, mean a wrong tag can't reach production.

## Validation

- [x] Notes extraction and verify checks tested locally
- [x] Production waits for approval, then deploys; smoke test `env=production`, `version=0.1.0`
- [x] Production page: no banner, indexable
- [x] GitHub Release `v0.1.0` published with CHANGELOG notes
- [x] Milestone v0.1 closed
