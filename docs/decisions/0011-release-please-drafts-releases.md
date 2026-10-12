# 0011. Draft releases with release-please; keep tagging manual

- **Status:** Accepted
- **Date:** 2026-10-12
- **Ticket:** [#39](https://github.com/vasanthpai/PrepNest/issues/39)

## Context

Releases v0.1.0 to v0.2.1 had a hand-written release PR: move the CHANGELOG notes, run
`npm version`, commit `chore(release): vX.Y.Z`. Every commit on `main` already follows Conventional
Commits (enforced on PR titles, merged with rebase), so the version bump and the notes can be
derived from history instead of typed.

Two constraints from ADR 0009 stay: a person decides **when** to release (merges, pushes the tag)
and **approves** production.

## Decision

Use [release-please](https://github.com/googleapis/release-please) (`release-please.yml`, runs on
every push to `main`) to keep one release PR, `chore(release): vX.Y.Z`, up to date: version in
`package.json` and the lockfile, and a new CHANGELOG section from `feat`, `fix`, `perf` and `revert`
commits.

- **It only drafts** (`skip-github-release: true`). The maintainer merges the PR, pushes the tag,
  and approves production, exactly as before. `deploy-production.yml` still creates the GitHub
  Release.
- After a release, `deploy-production.yml` relabels the merged PR `autorelease: pending` →
  `autorelease: tagged`. release-please otherwise thinks the release never happened and stops
  opening release PRs.
- **Token:** a fine-grained personal access token (`RELEASE_PLEASE_TOKEN`), limited to this
  repository. Pull requests opened with the default `GITHUB_TOKEN` don't trigger workflows, so the
  required checks would never run and the PR could never be merged.
- **Pre-1.0 versions:** `feat` → minor, `fix` → patch, breaking change → minor
  (`bump-minor-pre-major`).
- `CHANGELOG.md` is excluded from Prettier, because release-please writes its own Markdown style.

## Consequences

- No more hand-written version bumps; the notes match what was actually merged.
- **Commit messages are now release notes.** A vague `feat:` subject becomes a vague CHANGELOG line.
  The release PR can still be edited before merging (release-please rewrites it on the next push
  to `main`, so edit last).
- The release PR collects **everything** merged since the last tag. There's no releasing one fix
  without the features merged before it; unfinished features stay safe behind flags (ADR 0004).
- The token expires (1 year) and must be renewed; the workflow fails with a clear message if the
  secret is missing.
- Releases v0.1.0 to v0.2.1 keep their hand-written "Keep a Changelog" style; newer sections look
  slightly different (linked headings, commit links).

## Alternatives considered

- **Keep writing release PRs by hand:** works, but repetitive and easy to forget a line.
- **Let release-please tag and publish:** fewer steps, but the tag would deploy to production as
  soon as the PR merges, removing the deliberate "tag when ready" moment.
- **GitHub App instead of a personal token:** better for a team (not tied to one person), more
  setup. Worth switching to if the project gets more maintainers.
- **changesets:** designed for publishing npm packages, and needs a changeset file per PR.
