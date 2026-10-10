# CI/CD

GitHub Actions workflows live in `.github/workflows/`. CI is the gate in the
[release process](release-process.md): nothing reaches `main` unless it passes.

## Workflows

| Workflow              | File                    | Runs on                        | Purpose                                              | Since           |
| --------------------- | ----------------------- | ------------------------------ | ---------------------------------------------------- | --------------- |
| **CI**                | `ci.yml`                | Every PR, every push to `main` | Lint, format, types, tests, build; **browser tests** | v0.1 (e2e v0.2) |
| **PR title**          | `pr-title.yml`          | PR opened / edited / updated   | Title follows Conventional Commits                   | v0.1            |
| **Deploy staging**    | `deploy-staging.yml`    | Push to `main`                 | Build, migrate, deploy, smoke test                   | v0.1 step 15    |
| **Deploy production** | `deploy-production.yml` | Tag `v*`                       | Approval, migrate, deploy, smoke, release            | v0.1 step 16    |
| **CodeQL**            | GitHub default setup    | PRs, `main`, weekly            | Security analysis of the code                        | v0.1            |
| **Dependabot**        | `dependabot.yml`        | Weekly                         | PRs for dependency and action updates                | v0.1            |

## CI: what each check catches

| Step       | Command                | Catches                                                                   |
| ---------- | ---------------------- | ------------------------------------------------------------------------- |
| Install    | `npm ci`               | Lockfile out of sync with `package.json`; also generates Cloudflare types |
| Lint       | `npm run lint`         | Bugs, unused code, React hooks misuse, accessibility issues               |
| Formatting | `npm run format:check` | Unformatted files, Windows line endings                                   |
| Type check | `npm run typecheck`    | Type errors in `.ts`, `.tsx`, `.astro`                                    |
| Unit tests | `npm test`             | Broken logic (money, flags, config, providers, …)                         |
| Build      | `npm run build`        | Build errors, **invalid environment config** (fails the pre-render)       |

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

## Deploy staging

`deploy-staging.yml` runs when **CI succeeds on a push to `main`** (or by hand: Actions → Deploy
staging → Run workflow).

```
merge to main ──► CI (on main) ──success──► Deploy staging
                                              ├─ check out the exact commit CI tested
                                              ├─ npm ci → build (CLOUDFLARE_ENV=staging)
                                              ├─ (v0.3) migrate the staging database
                                              ├─ wrangler deploy → live URL
                                              ├─ smoke test the live URL
                                              └─ summary + GitHub deployment record
```

| Design choice                             | Why                                                                             |
| ----------------------------------------- | ------------------------------------------------------------------------------- |
| Triggered by `workflow_run` after CI      | Never deploys a commit that failed CI, and never runs in parallel with it       |
| Only for `push` events in this repository | A fork PR from a branch named `main` would otherwise match and get our secrets  |
| Checks out `workflow_run.head_sha`        | Deploys exactly the commit CI tested, even if `main` moved since                |
| `cancel-in-progress: false`               | Deploys queue; a half-finished deploy is never cancelled                        |
| `environment: staging`                    | Supplies the Cloudflare credentials; records the deployment and URL             |
| Smoke test with retries                   | A deploy is done when the live site answers correctly, not when the upload ends |

### Smoke test

`npm run smoke -- --url <base-url> --env <env> --version <x.y.z>` checks:

| Check              | Passes when                                                                     |
| ------------------ | ------------------------------------------------------------------------------- |
| `GET /api/health`  | 200, `status: ok`, the expected `env` and `version`, `cache-control: no-store`  |
| `GET /`            | 200, home content present, `noindex` outside production (and not in production) |
| `GET /favicon.svg` | 200                                                                             |

It retries up to 10 times, 3 seconds apart, while the new version reaches every Cloudflare location.
Run it against any environment by hand, e.g. after a rollback.

## Deploy production

`deploy-production.yml` runs when a **release tag** `vX.Y.Z` is pushed (see
[release-process.md](release-process.md)), or by hand on a tag for a rollback.

| Job                        | What it does                                                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Verify release**         | Fails unless: it's a tag, the tag commit is on `main`, `package.json` version = tag, CHANGELOG has `## [X.Y.Z]`         |
| **Deploy to production**   | Waits for **approval** (environment `production`), then build → deploy → smoke test (`env=production`, `version=X.Y.Z`) |
| **Publish GitHub Release** | Creates the release from the CHANGELOG section. Skipped for manual redeploys (rollbacks)                                |

The production token is only released to the deploy job **after** approval, and the environment
only accepts runs from `v*` tags, so a branch can never deploy to production.

## End-to-end tests job

The `End-to-end tests` job in `ci.yml` runs in parallel with the quality job:

```
npm ci → restore cached browsers → playwright install --with-deps --no-shell chromium
       → npm run build → npm run test:e2e (phone + desktop) → on failure: upload report
```

- Browsers (~150 MB) are cached by lockfile hash; system libraries install each run.
- One retry in CI: a test that passes on retry is marked **flaky** in the report, which should be fixed, not ignored.
- On failure, download **playwright-report** from the run's Artifacts and open `index.html`: each
  failed test has a screenshot and a full trace (every click, network request and DOM snapshot).
- `End-to-end tests` is a **required check** on `main` ([github-setup.md](github-setup.md)).
