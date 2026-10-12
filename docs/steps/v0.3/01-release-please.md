# v0.3 step 1: Draft release PRs with release-please

**Ticket:** [#39](https://github.com/vasanthpai/PrepNest/issues/39) · **Branch:** `ci/release-please` ·
**Commits:** `docs: plan v0.3 and add AI and analytics to the roadmap`,
`ci: draft release PRs with release-please`

## Goal

Stop writing the version bump and CHANGELOG by hand, without giving up control of when a release
happens. Decision record: [ADR 0011](../../decisions/0011-release-please-drafts-releases.md).

## How a release works now

```
feat/fix PRs merged to main
   └─► release-please.yml (every push to main) opens or updates "chore(release): vX.Y.Z"
         (package.json + lockfile version, new CHANGELOG section from the commits)
You: review the PR → Rebase and merge → push tag vX.Y.Z → approve production
   └─► deploy-production.yml: deploy → smoke test → GitHub Release
         → labels the release PR "autorelease: tagged" → release-please drafts the next one
```

## What changed

| File                                      | Change                                                                            |
| ----------------------------------------- | --------------------------------------------------------------------------------- |
| `release-please-config.json`              | Node release, tags `vX.Y.Z`, title `chore(release): vX.Y.Z`, CHANGELOG sections   |
| `.release-please-manifest.json`           | Current version: 0.2.1                                                            |
| `.github/workflows/release-please.yml`    | Runs on push to `main`; drafts only (`skip-github-release`); action pinned to SHA |
| `.github/workflows/deploy-production.yml` | After the GitHub Release: relabel the release PR `autorelease: tagged`            |
| `CHANGELOG.md`, `.prettierignore`         | Manual `[Unreleased]` section removed; file excluded from Prettier                |
| `docs/release-process.md`                 | New release PR flow, token setup, how commit types map to CHANGELOG sections      |
| `docs/decisions/0011-…`                   | Why release-please, why it doesn't tag, why a personal token                      |
| `docs/roadmap.md`                         | v0.3 plan; AI in v0.5 and v0.8; analytics, privacy, account deletion in v0.3      |
| Labels                                    | `autorelease: pending`, `autorelease: tagged` created                             |

## Three things that would have broken it

1. **No CI on the release PR.** Pull requests opened with `GITHUB_TOKEN` don't trigger workflows,
   so the required checks would never run and the PR could never merge. Hence the personal token.
2. **No second release PR, ever.** With `skip-github-release`, release-please never sees the
   release, finds a merged PR still labelled `autorelease: pending`, and stops. The production
   workflow now relabels it.
3. **Format check failing on the release PR.** release-please writes `*` bullets and extra blank
   lines; Prettier would reformat them and fail CI. `CHANGELOG.md` is now ignored by Prettier.

## Verified (dry runs, nothing created)

| Run                                                | Result                                                                                                                                                     |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Against this branch                                | Found release v0.2.1 at `c146e01`; `docs`/`ci` commits only → 0 PRs ✓                                                                                      |
| Against a temporary branch with one `feat:` commit | Would open `chore(release): v0.3.0`; `## [0.3.0](…) (2026-10-12)` under **Added**; `package.json` and lockfile 0.2.1 → 0.3.0 ✓ (branch deleted afterwards) |
| Production workflow compatibility                  | `## [0.3.0](…)` matches the `## [x.y.z]` check and the notes extraction ✓                                                                                  |

## Your part

1. Create the token: [release process → Release PR token](../../release-process.md#release-pr-token).
2. `gh secret set RELEASE_PLEASE_TOKEN` (hidden prompt).
3. Merge this PR. The "Release PR" workflow runs on `main` and should finish green with **no** PR
   (only `docs`/`ci` commits since v0.2.1).
4. The first `feat:` merged in step 2 or 3 opens `chore(release): v0.3.0`; leave it open until the
   v0.3 release.
