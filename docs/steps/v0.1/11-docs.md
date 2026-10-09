# v0.1 step 11: README, architecture decision records and release process

**Ticket:** [#6](https://github.com/vasanthpai/PrepNest/issues/6) · **Branch:** `feature/v0.1-foundation` ·
**Commit:** `docs: add README, decision records, release process and contributing guide`

## Goal

Write down the reasoning and the process before automating it in CI/CD (steps 12–16).

## What changed

| File                       | Change                                                                                         |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| `docs/decisions/README.md` | New: what ADRs are, index, template, when to write one                                         |
| `docs/decisions/0001–0009` | New: 9 decision records for choices already made                                               |
| `docs/release-process.md`  | New: plan → develop → PR → staging → release → rollback → hotfix → migrations                  |
| `CONTRIBUTING.md`          | New: branch names, commit format, PR checklist, code rules                                     |
| `CHANGELOG.md`             | New: Keep a Changelog format; v0.1 work collected under `Unreleased`                           |
| `README.md`                | Full rewrite: status, Mermaid architecture and pipeline diagrams, stack, quick start, docs map |
| `docs/architecture.md`     | Links to the decision records                                                                  |

## Decisions recorded

| ADR  | Decision                                            |
| ---- | --------------------------------------------------- |
| 0001 | Record architecture decisions                       |
| 0002 | Astro on Cloudflare Workers                         |
| 0003 | Store money as integer paise                        |
| 0004 | Feature flags as code                               |
| 0005 | Outside services behind interfaces, with fakes      |
| 0006 | Validate configuration with zod, failing the build  |
| 0007 | "Syntax" design system with self-hosted fonts       |
| 0008 | Pin TypeScript to 6.0 for now (temporary)           |
| 0009 | Feature branches, tagged releases, gated production |

## Process decisions made in this step

- **Merge strategy: "Rebase and merge".** Keeps `main` linear and every conventional commit,
  which the changelog is built from. Enforced by branch protection in step 13.
- **Rollback ladder:** flag off → redeploy previous tag → `wrangler rollback` (emergency).
- **Migrations are never rolled back**; they're written expand-then-contract instead.
- **CHANGELOG starts now:** notes collect under `Unreleased` and move under a version at release.

## Validation

- [x] Every ADR has Context, Decision, Consequences, Alternatives considered
- [x] Release process covers a normal release, a hotfix and a rollback
- [x] `npm run format:check` passes on all docs
