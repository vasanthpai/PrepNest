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

## Validation

- [x] Notes extraction and verify checks tested locally
- [ ] Production waits for approval, then deploys; smoke test `env=production`, `version=0.1.0`
- [ ] Production page: no banner, indexable
- [ ] GitHub Release `v0.1.0` published with CHANGELOG notes
- [ ] Milestone v0.1 closed
