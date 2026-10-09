# GitHub repository setup

Settings that live on GitHub rather than in files. Recorded here so they can be reviewed and
recreated. Why: [ADR 0009](decisions/0009-branching-and-releases.md).

## Merge settings

**Settings → General → Pull Requests**

| Setting                             | Value | Why                                                       |
| ----------------------------------- | ----- | --------------------------------------------------------- |
| Allow merge commits                 | ❌    | Keeps history linear                                      |
| Allow squash merging                | ❌    | Would collapse step commits; the changelog needs each one |
| Allow rebase merging                | ✅    | The only merge method                                     |
| Always suggest updating PR branches | ✅    | One click to bring a PR up to date with `main`            |
| Allow auto-merge                    | ✅    | Dependabot PRs can merge themselves once CI passes        |
| Automatically delete head branches  | ✅    | Merged branches don't pile up                             |

## Rulesets

**Settings → Rules → Rulesets**

### `main` (target: default branch)

| Rule                                  | Effect                                                                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Restrict deletions                    | `main` can't be deleted                                                                                                 |
| Block force pushes                    | History on `main` can't be rewritten                                                                                    |
| Require linear history                | No merge commits                                                                                                        |
| Require a pull request before merging | No direct pushes; 0 approvals (you can't approve your own PR); conversations must be resolved; merge method: **rebase** |
| Require status checks to pass         | `Lint, types, tests, build` and `Conventional Commits title`; branch must be **up to date** with `main`                 |
| Bypass list                           | Empty: the rules apply to the owner too                                                                                 |

Verified: a direct push to `main` is rejected with
`GH013: Repository rule violations … Changes must be made through a pull request.`

### `release tags` (target: tags `v*`)

| Rule               | Effect                                         |
| ------------------ | ---------------------------------------------- |
| Restrict deletions | A release tag can't be deleted                 |
| Restrict updates   | A release tag can't be moved to another commit |
| Block force pushes | Same, for force pushes                         |

Creating new tags is allowed. A tag always points at exactly the code that was released, which is
what makes "redeploy the previous tag" a safe rollback.

## Security

**Settings → Advanced Security** (free for public repositories)

| Feature                         | Status | What it does                                                              |
| ------------------------------- | ------ | ------------------------------------------------------------------------- |
| Private vulnerability reporting | ✅     | Researchers report privately (see `SECURITY.md`)                          |
| Dependabot alerts               | ✅     | Warns when a dependency has a known vulnerability                         |
| Dependabot security updates     | ✅     | Opens a fix PR for vulnerable dependencies automatically                  |
| Dependabot version updates      | ✅     | `.github/dependabot.yml`: weekly update PRs                               |
| Secret scanning                 | ✅     | Detects committed API keys and tokens                                     |
| Push protection                 | ✅     | **Blocks** a push that contains a recognised secret                       |
| CodeQL code scanning            | ✅     | Default setup: JavaScript/TypeScript + Actions, on PRs, `main` and weekly |

## In the repository

| File                               | Purpose                                                       |
| ---------------------------------- | ------------------------------------------------------------- |
| `.github/workflows/ci.yml`         | CI checks ([ci-cd.md](ci-cd.md))                              |
| `.github/workflows/pr-title.yml`   | Conventional Commits PR titles                                |
| `.github/dependabot.yml`           | npm + GitHub Actions updates, grouped, weekly (Mon 06:00 IST) |
| `.github/pull_request_template.md` | Every PR: what, why, how tested, checklist                    |
| `.github/ISSUE_TEMPLATE/*.yml`     | Forms for features/steps and bugs; security link              |
| `.github/CODEOWNERS`               | Review requests (sensitive paths listed explicitly)           |
| `SECURITY.md`                      | How to report a vulnerability                                 |

## Environments

**Settings → Environments** (details: [cloudflare-setup.md](cloudflare-setup.md))

| Environment  | Deploys allowed from | Protection rules                  | Secrets / variables                                                 |
| ------------ | -------------------- | --------------------------------- | ------------------------------------------------------------------- |
| `staging`    | branch `main`        | none                              | `CLOUDFLARE_API_TOKEN` (secret), `CLOUDFLARE_ACCOUNT_ID` (variable) |
| `production` | tags `v*`            | Required reviewer **@vasanthpai** | same names, released to a job only after approval                   |

## Labels and milestones

- **Type labels:** `type: feature`, `type: chore`, `type: test`, `type: ci`, `type: docs`,
  `type: bug`; `dependencies` for Dependabot.
- **One milestone per version** (`v0.1 Foundation & pipeline`, …), closed at release.

## Recreating with the GitHub CLI

```bash
R=vasanthpai/PrepNest
gh api -X PATCH repos/$R -F allow_merge_commit=false -F allow_squash_merge=false \
  -F allow_rebase_merge=true -F delete_branch_on_merge=true -F allow_auto_merge=true -F allow_update_branch=true
gh api -X PUT repos/$R/vulnerability-alerts
gh api -X PUT repos/$R/automated-security-fixes
gh api -X PUT repos/$R/private-vulnerability-reporting
# Rulesets: export the JSON from Settings → Rules → Rulesets → ⋯ → Export, then
# gh api -X POST repos/$R/rulesets --input ruleset.json
```
