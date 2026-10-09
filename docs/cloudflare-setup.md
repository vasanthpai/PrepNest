# Cloudflare setup

How PrepNest connects to Cloudflare, and how to recreate it on a new account.

## What exists

| Item        | Value                                                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| Plan        | Workers **Free** (no card on file)                                                                                     |
| Workers     | `prepnest-staging`, `prepnest-production` (created by the first deploy of each)                                        |
| URLs        | staging <https://prepnest-staging.prepnest.workers.dev>, production <https://prepnest-production.prepnest.workers.dev> |
| API token   | `prepnest-github-actions`, from the **Edit Cloudflare Workers** template                                               |
| Local login | `npx wrangler login` (OAuth; stored in your user profile, not the repo)                                                |

## Credentials and where they live

| Name                    | Kind                  | Where                                              | Used by                             |
| ----------------------- | --------------------- | -------------------------------------------------- | ----------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | Secret                | GitHub → Environments → `staging` and `production` | Deploy workflows                    |
| `CLOUDFLARE_ACCOUNT_ID` | Variable (not secret) | GitHub → Environments → `staging` and `production` | Deploy workflows                    |
| Wrangler OAuth login    | Local credential      | Your machine (`wrangler login`)                    | Manual commands, emergency rollback |

**Environment** secrets (not repository secrets) mean a job only receives the token when it runs in
that environment. A production deploy gets the production token only **after approval**.

## GitHub environments

| Environment  | Deploys allowed from | Protection                         |
| ------------ | -------------------- | ---------------------------------- |
| `staging`    | branch `main`        | none: deploys automatically        |
| `production` | tags `v*`            | **Required reviewer:** @vasanthpai |

## Recreating from scratch

1. **Account:** sign up at <https://dash.cloudflare.com/sign-up> (free); skip adding a domain.
2. **Subdomain:** Workers & Pages → choose a `workers.dev` subdomain.
3. **Account ID:** Workers & Pages → right side → Account details → copy.
4. **Token:** Profile → API Tokens → Create Token → _Edit Cloudflare Workers_ → Use template →
   name `prepnest-github-actions` → Account Resources: your account → Zone Resources: all zones from
   your account → Create → copy (shown once).
5. **GitHub** (the token is pasted at a hidden prompt, never on the command line):
   ```bash
   gh secret set CLOUDFLARE_API_TOKEN --env staging --repo vasanthpai/PrepNest
   gh secret set CLOUDFLARE_API_TOKEN --env production --repo vasanthpai/PrepNest
   gh variable set CLOUDFLARE_ACCOUNT_ID --env staging --repo vasanthpai/PrepNest --body "<account-id>"
   gh variable set CLOUDFLARE_ACCOUNT_ID --env production --repo vasanthpai/PrepNest --body "<account-id>"
   ```
6. **Local:** `npx wrangler login`, then `npx wrangler whoami`.

## Rotating the API token

Do this once a year, or immediately if the token may have leaked:

1. Cloudflare → Profile → API Tokens → `prepnest-github-actions` → **Roll** (issues a new value,
   invalidates the old one) → copy.
2. Run the two `gh secret set CLOUDFLARE_API_TOKEN …` commands again with the new value.
3. Re-run the latest staging deploy to confirm it still works.

## Free plan limits that matter

| Limit                 | Free plan         | Our usage                                                     |
| --------------------- | ----------------- | ------------------------------------------------------------- |
| Worker requests       | 100,000 / day     | Static pages don't count (served as assets)                   |
| CPU time per request  | 10 ms             | Server routes are tiny; heavy work stays off the request path |
| Static asset requests | Unlimited, free   | Home page, CSS, fonts                                         |
| Worker script size    | 3 MB (compressed) | Checked on each deploy                                        |
