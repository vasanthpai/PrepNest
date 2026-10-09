# CI/CD

GitHub Actions workflows live in `.github/workflows/`. CI is the gate in the
[release process](release-process.md): nothing reaches `main` unless it passes.

## Workflows

| Workflow              | File                    | Runs on                        | Purpose                                   | Since        |
| --------------------- | ----------------------- | ------------------------------ | ----------------------------------------- | ------------ |
| **CI**                | `ci.yml`                | Every PR, every push to `main` | Lint, format, types, tests, build         | v0.1         |
| **PR title**          | `pr-title.yml`          | PR opened / edited / updated   | Title follows Conventional Commits        | v0.1         |
| **Deploy staging**    | `deploy-staging.yml`    | Push to `main`                 | Build, migrate, deploy, smoke test        | v0.1 step 15 |
| **Deploy production** | `deploy-production.yml` | Tag `v*`                       | Approval, migrate, deploy, smoke, release | v0.1 step 16 |
| **CodeQL**            | GitHub default setup    | PRs, `main`, weekly            | Security analysis of the code             | v0.1         |
| **Dependabot**        | `dependabot.yml`        | Weekly                         | PRs for dependency and action updates     | v0.1         |

## CI: what each check catches

| Step            | Command                    | Catches                                                             |
| --------------- | -------------------------- | ------------------------------------------------------------------- |
| Install         | `npm ci`                   | Lockfile out of sync with `package.json`                            |
| Lint            | `npm run lint`             | Bugs, unused code, React hooks misuse, accessibility issues         |
| Formatting      | `npm run format:check`     | Unformatted files, Windows line endings                             |
| Generated types | `npm run cf-typegen:check` | `wrangler.jsonc` changed without `npm run cf-typegen`               |
| Type check      | `npm run typecheck`        | Type errors in `.ts`, `.tsx`, `.astro`                              |
| Unit tests      | `npm test`                 | Broken logic (money, flags, config, providers, …)                   |
| Build           | `npm run build`            | Build errors, **invalid environment config** (fails the pre-render) |

Run the same checks locally with **`npm run check`** (everything except the build).

## How the workflows are hardened

- **Least privilege:** each workflow declares `permissions:`; CI can only read the code.
- **Actions pinned to commit SHAs** (`actions/checkout@3d3c42e…  # v7.0.1`): a tag can be moved to
  malicious code, a SHA can't. Dependabot opens PRs to update them.
- **`npm ci`**, not `npm install`: installs exactly what's in `package-lock.json`, or fails.
- **Concurrency:** a new push cancels the outdated run for the same branch.
- **Timeouts** on every job, so a stuck run can't burn minutes.
- **Node version from `.nvmrc`**: CI and laptops use the same Node.

## Reading a failed run

1. On the PR, scroll to the checks box → click **Details** next to the red ✗.
2. Expand the step with the red ✗; the error is near the bottom.
3. Reproduce locally with the same command (table above), fix, commit, push. CI re-runs.

To re-run without changes (e.g. a network hiccup): Actions tab → the run → **Re-run failed jobs**.

## Status badge

The README shows the CI status of `main`:

```markdown
[![CI](https://github.com/vasanthpai/PrepNest/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/vasanthpai/PrepNest/actions/workflows/ci.yml)
```

## Required checks and protection

`main` is protected by a ruleset: changes only through pull requests, both CI checks required and
the branch up to date, rebase merge only. Details and every other repository setting:
[github-setup.md](github-setup.md).

## Dependabot PRs

Every Monday 06:00 IST, Dependabot opens grouped PRs (`chore(deps): …`, `ci(deps): …`). They run
CI like any other PR. If green: read the changelog of anything major, then **Rebase and merge**.
TypeScript major updates are held back on purpose ([ADR 0008](decisions/0008-pin-typescript-6.md)).
