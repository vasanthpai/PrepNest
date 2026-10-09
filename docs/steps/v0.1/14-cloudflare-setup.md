# v0.1 step 14: Cloudflare account, API token, GitHub environments and secrets

**Ticket:** [#15](https://github.com/vasanthpai/PrepNest/issues/15) · **Branch:** `feature/v0.1-deploy` ·
**Commit:** `docs: document Cloudflare setup and GitHub environments`

## Goal

Connect GitHub to Cloudflare so the deploy workflows (steps 15–16) can deploy, with production
credentials released only after approval.

## What was set up

| Where      | What                                                                                     | By                               |
| ---------- | ---------------------------------------------------------------------------------------- | -------------------------------- |
| GitHub     | Environment `staging`: deployments only from `main`                                      | GitHub API                       |
| GitHub     | Environment `production`: deployments only from `v*` tags; required reviewer @vasanthpai | GitHub API                       |
| Cloudflare | Free account; `workers.dev` subdomain                                                    | Maintainer                       |
| Cloudflare | API token `prepnest-github-actions` (Edit Cloudflare Workers template)                   | Maintainer                       |
| GitHub     | `CLOUDFLARE_API_TOKEN` secret + `CLOUDFLARE_ACCOUNT_ID` variable on both environments    | Maintainer (`gh`, hidden prompt) |
| Local      | `npx wrangler login`                                                                     | Maintainer                       |

**Docs:** `docs/cloudflare-setup.md` (new); environments section in `docs/github-setup.md`; credential
rows in `docs/environments.md`.

## Why

- **Environment secrets, not repository secrets:** a job only gets the token when it runs in that
  environment, and for production only after approval.
- **Token from a template:** it can deploy Workers and nothing else (no DNS, billing or account settings).
- **Token never in chat, files or command lines:** `gh secret set` reads it from a hidden prompt, so it
  isn't in shell history either.

## Also in this step

- **Dependabot PR #12** (`sharp`, `wrangler`, `@cloudflare/vite-plugin`) merged after the ADR 0010
  fix: CI green on rebase. The first dependency update through the full process.

## Validation

- [x] `npx wrangler whoami`: logged in; scopes include `workers (write)`
- [x] `gh secret list --env staging|production`: `CLOUDFLARE_API_TOKEN` present in both
- [x] `CLOUDFLARE_ACCOUNT_ID` in both environments matches the account from `wrangler whoami`
- [x] `production`: required reviewer `vasanthpai`, deploy policy `tag v*`
- [ ] Token verified by a real deploy (step 15)
