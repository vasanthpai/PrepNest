# Architecture

PrepNest is an Astro app deployed as a single **Cloudflare Worker**. Most pages are pre-rendered
to static HTML at build time; only routes that need the server (APIs, login, quizzes, payments)
run code per request.

> This document grows with the project. The reasons behind each major choice are in the
> [decision records](decisions/README.md).

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
│  ├─ site.ts     #   Brand, navigation, links
│  ├─ topics.ts   #   Tech topics and their syntax colour
│  └─ version.ts  #   App version from package.json
├─ content/blog/  # Blog posts (MDX), validated by src/content.config.ts
├─ features/      # One folder per product feature (see src/features/README.md)
│  └─ blog/       #   schema, service (tested), repo
├─ lib/           # Shared, feature-independent helpers
│  ├─ health.ts       #   /api/health body
│  ├─ money.ts        #   Integer paise helpers
│  ├─ runtime-env.ts  #   getConfig(), featureEnabled(): validated config (server only)
│  └─ providers/      #   Interfaces for email, payment, storage + fakes (see providers.md)
├─ components/    # Shared UI: header, footer, logo, theme toggle, topic chip
├─ layouts/       # BaseLayout: meta tags, theme, header/footer around every page
├─ pages/         # Routes: thin, call feature services
│  ├─ index.astro #   Home (pre-rendered at build time)
│  └─ api/health.ts # Health check (rendered per request)
├─ styles/        # Tailwind entry and design tokens (see design-system.md)
└─ middleware.ts  # Runs before every route: config validation (later: auth, headers)
```

## Pre-rendered vs per-request

| Route                                                       | When it runs                             | Why                                                                        |
| ----------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------- |
| `/`                                                         | Once, at build time                      | Same for everyone: served as a static file, free and instant               |
| `/api/health`                                               | On every request (`prerender = false`)   | Must prove the Worker itself is running                                    |
| `/blog/<slug>`                                              | At build time, one file per visible post | Content changes only on deploy; built only when the `blog` flag is on      |
| `/blog`, `/blog/page/N`, `/blog/topic/<t>`, `/blog/tag/<t>` | At build time                            | Lists change only when posts change; built only when the `blog` flag is on |

**URLs have no trailing slash** (`trailingSlash: "never"`, `build.format: "file"`): pages are built
as `blog/my-post.html` and Cloudflare serves them at `/blog/my-post` directly. `/blog/my-post/`
redirects to it, so each page has one canonical URL and normal links never pay for a redirect.

New pages are pre-rendered by default. Only pages that depend on the visitor (login, quizzes,
checkout) or must be live opt out with `export const prerender = false`.

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
