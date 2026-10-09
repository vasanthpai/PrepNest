# Architecture

PrepNest is an Astro app deployed as a single **Cloudflare Worker**. Most pages are pre-rendered
to static HTML at build time; only routes that need the server (APIs, login, quizzes, payments)
run code per request.

> This document grows with the project. Decision records (ADRs) are added in v0.1 step 11.

## Runtime overview

```
 Browser (phone / laptop)
    │  HTTPS
    ▼
 Cloudflare edge (nearest data centre, e.g. Mumbai / Chennai)
    ├─ Static assets (HTML, CSS, JS, images) ── served directly, no Worker CPU used
    └─ Worker (Astro server routes)
          ├─ Neon Postgres (v0.3)      via Drizzle
          ├─ Clerk (v0.3)              auth
          ├─ Resend (v0.4)             email        ─┐
          ├─ Cloudflare R2 (v0.4)      file storage  ├─ through provider interfaces
          └─ Razorpay (v0.6)           payments     ─┘
```

## Folder structure

```
src/
├─ config/        # App-wide configuration (no business logic)
│  ├─ app-env.ts  #   AppEnv type: local | staging | production
│  ├─ env.ts      #   zod schema for env vars and secrets
│  ├─ features.ts #   Feature flags per environment
│  └─ site.ts     #   Brand, navigation, links
├─ features/      # One folder per product feature (see src/features/README.md)
├─ lib/           # Shared, feature-independent helpers
│  ├─ money.ts        #   Integer paise helpers
│  ├─ runtime-env.ts  #   getConfig(), featureEnabled(): validated config (server only)
│  └─ providers/      #   Interfaces for email, payment, storage + fakes (see providers.md)
├─ components/    # Shared UI components
├─ layouts/       # Page layouts (v0.1 step 10)
├─ pages/         # Routes: thin, call feature services
├─ styles/        # Tailwind entry and design tokens
└─ middleware.ts  # Runs before every route: config validation (later: auth, headers)
```

## Configuration

| File                     | What it holds                      | Changes when…                        |
| ------------------------ | ---------------------------------- | ------------------------------------ |
| `src/config/site.ts`     | Name, tagline, nav, links          | Branding or navigation changes       |
| `src/config/features.ts` | On/off per feature per environment | A feature is released or rolled back |
| `src/config/env.ts`      | Rules for every env var / secret   | A new variable is added              |
| `wrangler.jsonc`         | Worker names, `APP_ENV`, bindings  | Infrastructure changes               |
| `.dev.vars` / secrets    | API keys (never in Git)            | Keys rotate                          |

Full variable reference and per-environment values: [environments.md](environments.md).

## Feature flags

Deploying code and releasing a feature are separate steps:

```
 code merged (flag off everywhere) ─► local on ─► staging on ─► production on
                                                                     │
                                                       rollback: set back to false
```

- Flags are a typed table: leaving out an environment is a **TypeScript error**.
- A unit test enforces the **promotion rule**: never on in production unless on in staging.
- Navigation items can depend on a flag (`navFor(env)` hides links to unreleased features).
- Flags are code, so changing one goes through a PR, CI and the normal deploy.

## Core rules

- Pages stay thin; business logic lives in `src/features/<name>/service.ts`.
- Outside services only through interfaces in `src/lib/providers/`.
- Anything sold is a **product**; content links to a **topic**.
- Money is integer paise; prices are never trusted from the browser.
- Database changes only through Drizzle migrations, backward-compatible.
- Correct quiz answers never reach the browser before submission.
- Mobile-first: must work on a cheap Android phone on slow data.
