# Environments and configuration

## The three environments

| Environment  | Runs where                         | Built with                                | Worker name           |
| ------------ | ---------------------------------- | ----------------------------------------- | --------------------- |
| `local`      | Your machine (`npm run dev`)       | `npm run build`                           | `prepnest`            |
| `staging`    | Cloudflare (auto-deploy from main) | `CLOUDFLARE_ENV=staging npm run build`    | `prepnest-staging`    |
| `production` | Cloudflare (deploy on tag `v*`)    | `CLOUDFLARE_ENV=production npm run build` | `prepnest-production` |

The environment is chosen at **build** time. Each environment gets its own build in CI.

## Where values live

| Kind                | Local                     | Staging / production                                | In Git?  |
| ------------------- | ------------------------- | --------------------------------------------------- | -------- |
| Non-secret settings | `wrangler.jsonc` → `vars` | `wrangler.jsonc` → `env.<name>.vars`                | ✅ yes   |
| Runtime secrets     | `.dev.vars`               | `npx wrangler secret put <NAME> --env <name>`       | ❌ never |
| CI / deploy secrets | —                         | GitHub → Settings → Secrets and variables → Actions | ❌ never |

`.dev.vars` is git-ignored. `.dev.vars.example` is the committed template.

## Variable reference

| Variable                       | Secret | Added | Where to get it                      | local            | staging           | production        |
| ------------------------------ | ------ | ----- | ------------------------------------ | ---------------- | ----------------- | ----------------- |
| `APP_ENV`                      | no     | v0.1  | Fixed per environment                | `local`          | `staging`         | `production`      |
| `CLOUDFLARE_API_TOKEN`         | yes    | v0.1  | Cloudflare → My Profile → API Tokens | —                | GitHub env secret | GitHub env secret |
| `CLOUDFLARE_ACCOUNT_ID`        | no     | v0.1  | Cloudflare dashboard sidebar         | —                | GitHub env var    | GitHub env var    |
| `DATABASE_URL`                 | yes    | v0.3  | Neon → Connect → branch              | `.dev.vars`      | wrangler + GitHub | wrangler + GitHub |
| `PUBLIC_CLERK_PUBLISHABLE_KEY` | no     | v0.3  | Clerk → app → Configure → API keys   | `wrangler.jsonc` | `wrangler.jsonc`  | `wrangler.jsonc`  |
| `CLERK_SECRET_KEY`             | yes    | v0.3  | Clerk → app → Configure → API keys   | `.dev.vars`      | wrangler secret   | wrangler secret   |
| `CLERK_WEBHOOK_SIGNING_SECRET` | yes    | v0.3  | Clerk → Webhooks → endpoint          | `.dev.vars`      | wrangler secret   | wrangler secret   |
| `RESEND_API_KEY`               | yes    | v0.4  | Resend → API Keys                    | `.dev.vars`      | wrangler secret   | wrangler secret   |
| `TURNSTILE_SECRET_KEY`         | yes    | v0.4  | Cloudflare → Turnstile               | `.dev.vars`      | wrangler secret   | wrangler secret   |
| `RAZORPAY_KEY_SECRET`          | yes    | v0.8  | Razorpay (test mode) → API Keys      | `.dev.vars`      | wrangler secret   | wrangler secret   |
| `RAZORPAY_WEBHOOK_SECRET`      | yes    | v0.8  | Razorpay → Webhooks                  | `.dev.vars`      | wrangler secret   | wrangler secret   |

"GitHub env secret / var" = stored on the GitHub **environment** (`staging`, `production`), so only jobs running in that environment can read it. Setup: [cloudflare-setup.md](cloudflare-setup.md).
`DATABASE_URL` is in the schema (optional at build time, required by `/api/health` once deployed).
The Clerk keys are too: local and staging use the `PrepNest staging` Clerk application, production
uses `PrepNest production` ([ADR 0013](decisions/0013-clerk-hosted-sign-in.md)). Without
`CLERK_SECRET_KEY`, the sign-in routes answer 503.
The other rows from v0.3 onwards are added to the schema when their step starts.

## Database (Neon)

One Neon project, one branch per environment ([ADR 0012](decisions/0012-neon-postgres-and-drizzle.md)):

| Environment        | Neon branch      | App (`DATABASE_URL`, **pooled**)                        | Migrations (`DATABASE_URL`, **direct**)       |
| ------------------ | ---------------- | ------------------------------------------------------- | --------------------------------------------- |
| local              | `dev`            | `.dev.vars`                                             | `.dev.vars` (pooled is fine locally)          |
| staging + previews | `staging`        | `npx wrangler secret put DATABASE_URL --env staging`    | `gh secret set DATABASE_URL --env staging`    |
| production         | default (`main`) | `npx wrangler secret put DATABASE_URL --env production` | `gh secret set DATABASE_URL --env production` |

- **Get a string:** Neon → your project → **Connect** → choose the branch → **Connection pooling**
  on (app) or off (migrations) → copy. The host of a pooled string contains `-pooler`.
- **Never paste one into chat, an issue or a command line**: it contains the password. The
  `wrangler secret put` and `gh secret set` commands ask for it at a hidden prompt.
- **Check it works:** `npm run db:ping` (uses `.dev.vars`). To check another branch, type its
  string at a hidden prompt: `read -rs DATABASE_URL && export DATABASE_URL && npm run db:ping; unset DATABASE_URL`.
  The script prints the host, database, pooling and latency, never the string.
- **List what's set (names only):** `npx wrangler secret list --env staging`, `gh secret list --env staging`.
- **Rotate a password:** Neon → Roles → reset password, then update every place in the table.

## How validation works

```
 wrangler.jsonc vars + .dev.vars / wrangler secrets
                │
                ▼
   cloudflare:workers `env`  ──►  parseEnv() (zod, src/config/env.ts)
                                       │
                     ┌─────────────────┴──────────────────┐
                  valid: cached typed config        invalid: throws, listing
                  via getConfig()                   variable NAMES (never values)
```

- `src/middleware.ts` calls `getConfig()` for every request **and every pre-rendered page during
  the build**, so a bad config fails `npm run build` (and the CI deploy) before anything ships.
- Server code reads config with `getConfig()` and flags with `featureEnabled("blog")`
  (both in `src/lib/runtime-env.ts`). Never read `env` directly in features.

## Adding a new variable (checklist)

1. Add it to `envSchema` in `src/config/env.ts` (with a zod rule, e.g. `z.url()`).
2. Non-secret: add to `vars` in `wrangler.jsonc` for **each** environment (vars aren't inherited).
   Secret: add a commented line to `.dev.vars.example` and your own `.dev.vars`.
3. Run `npm run cf-typegen` to refresh `worker-configuration.d.ts`.
4. Add a row to the table above.
5. Before deploying: `npx wrangler secret put <NAME> --env staging` (and `production`).

## Generated types

`worker-configuration.d.ts` is generated by `wrangler types` from `wrangler.jsonc` and `.dev.vars`.
It is **not committed** ([ADR 0010](decisions/0010-generate-cloudflare-types.md)): `npm install`
regenerates it automatically (`postinstall`), on your machine and in CI. After changing
`wrangler.jsonc` or adding a secret, run `npm run cf-typegen` to refresh it without reinstalling.
