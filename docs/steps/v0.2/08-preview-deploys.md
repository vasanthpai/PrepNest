# v0.2 step 8: Preview deploy for every pull request

**Ticket:** [#30](https://github.com/vasanthpai/PrepNest/issues/30) · **Branch:** `feature/v0.2-blog` ·
**Commit:** `ci: add a live preview deploy for every pull request`

## Goal

Every pull request gets its own live URL, posted as a comment and refreshed on every push.

## What changed

| Where                           | Change                                                                                                                       |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/preview.yml` | New: build with staging settings → `wrangler versions upload --preview-alias pr-<n>` → smoke test → sticky PR comment        |
| `wrangler.jsonc`                | `preview_urls: true` for staging, `false` for production                                                                     |
| GitHub                          | Environment `preview` (any branch) with `CLOUDFLARE_ACCOUNT_ID` (API) and `CLOUDFLARE_API_TOKEN` (maintainer, hidden prompt) |
| Docs                            | CI/CD (preview section), GitHub and Cloudflare setup (third environment, token rotation)                                     |

## Why

- **Version upload, not deploy:** the PR's code gets a URL while live staging keeps serving `main`.
- **Staging settings:** what you see is what staging will be after the merge.
- **Separate `preview` environment:** `staging` stays `main`-only; previews still get credentials.
- **Injection-safe:** PR number, SHA and URL reach shell commands only through `env:`.

## Issues hit and fixes

| Problem                                                                         | Cause                                                                                                                         | Fix                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Generated config looked like "local" after a staging build                      | Read a leftover file; since the Wrangler update the generated config is `dist/server/wrangler.json` (not `dist/client`)       | Re-checked a fresh build: `name: prepnest-staging`, `preview_urls: true`, `APP_ENV: staging`; production `preview_urls: false`                                                                      |
| **WhatsApp showed no preview image** for a preview link (found on a real phone) | Previews were built with **staging's** site URL, so `og:image` pointed at live staging, which didn't have the image yet (404) | Previews build with their own address (`PREVIEW_PR` → `buildSiteUrl()`, tested); the workflow fails if the built address differs from Cloudflare's; the smoke test now checks that `og:image` loads |

## First run on PR #23

| Check                          | Result                                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Preview workflow               | ✅ build, upload, smoke test, comment                                                                         |
| PR comment                     | One comment: URL `https://pr-23-prepnest-staging.prepnest.workers.dev`, commit, ✅ smoke test                 |
| Preview `/api/health`          | `{"status":"ok","env":"staging","version":"0.1.0"}`, staging banner                                           |
| Preview `/blog`                | 404, **as designed**: previews use staging's flags, and `blog` is still off on staging (turned on in step 10) |
| Live staging after the preview | Unchanged (still `main`; `/blog` 404)                                                                         |
| Second push                    | Same comment updated (no second comment)                                                                      |

## Validation

- [x] Generated configs: staging previews on, production off
- [x] Comment body renders as a table
- [x] PR #23 gets a comment with a working preview URL; a new push updates the same comment
- [x] Smoke test passes against the preview URL
- [x] Live staging unchanged (still serves `main`)
