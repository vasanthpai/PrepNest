# Roadmap

PrepNest is a **tech learning platform**: a free tech blog, quizzes and timed assessments, and
tech courses. It's a portfolio project built in public, version by version, with a production-style
workflow and free-tier hosting.

Legend: ✅ done · 🚧 in progress · ⏳ planned

## Release process (every version)

```
feature/vX.Y-name → PR → CI green → merge to main → auto-deploy to staging → manual test
→ release PR (drafted by release-please from v0.3) → tag vX.Y.0 → approval → production deploy → GitHub Release
```

## v0.1 Foundation & pipeline ✅ (released 2026-10-09)

| #   | Step                                                                           | Status |
| --- | ------------------------------------------------------------------------------ | ------ |
| 1   | Install tools (Node 24, Git, gh, VS Code)                                      | ✅     |
| 2   | Astro project, strictest TypeScript, git, feature branch                       | ✅     |
| 3   | React islands and Tailwind CSS                                                 | ✅     |
| 4   | Cloudflare adapter, wrangler staging and production environments               | ✅     |
| 5   | ESLint, Prettier, `astro check`, LF line endings                               | ✅     |
| 6   | Vitest and money helpers                                                       | ✅     |
| 7   | Folder structure, `site.ts`, `features.ts` (feature flags)                     | ✅     |
| 8   | Env validation (zod), `.dev.vars.example`, typed Cloudflare env                | ✅     |
| 9   | Provider interfaces (Email, Payment, Storage) + fakes for tests                | ✅     |
| 10  | Design system (identity, tokens, light/dark), base layout, home, `/api/health` | ✅     |
| 11  | Docs: README, architecture, decision records, release process                  | ✅     |
| 12  | `ci.yml`, PR title check, first PR                                             | ✅     |
| 13  | Branch protection, Dependabot, CodeQL, secret scanning, templates, merge       | ✅     |
| 14  | Cloudflare token, GitHub Secrets and Environments                              | ✅     |
| 15  | `deploy-staging.yml`, first staging deploy                                     | ✅     |
| 16  | `deploy-production.yml`, CHANGELOG, tag `v0.1.0`, production deploy            | ✅     |

## v0.2 Blog ✅ (released 2026-10-12)

| #   | Step                                                            | Status |
| --- | --------------------------------------------------------------- | ------ |
| 1   | Content collection (MDX + schema), blog helpers, 3 sample posts | ✅     |
| 2   | Post page: article layout, typography, code highlighting        | ✅     |
| 3   | Blog index with pagination, topic and tag pages                 | ✅     |
| 4   | SEO: `<Seo>` component, canonical, Open Graph, structured data  | ✅     |
| 5   | Sitemap, robots.txt, RSS                                        | ✅     |
| 6   | Pagefind search                                                 | ✅     |
| 7   | Playwright e2e tests in CI                                      | ✅     |
| 8   | Preview deploy per PR                                           | ✅     |
| 9   | Lighthouse CI budgets                                           | ✅     |
| 10  | Blog flag on in staging → release v0.2.0                        | ✅     |
| 11  | Google Search Console verification → patch release v0.2.1       | ✅     |

## v0.3 Database & auth 🚧

| #   | Step                                                                                | Status |
| --- | ----------------------------------------------------------------------------------- | ------ |
| 1   | release-please drafts release PRs (tagging stays manual)                            | 🚧     |
| 2   | Neon project with `dev`, `staging`, `main` branches; ADR                            | ⏳     |
| 3   | Drizzle schema (`users`, `webhook_events`), data layer, tests on PGlite             | ⏳     |
| 4   | Migrations in CI and deploy pipelines; database check in health and smoke test      | ⏳     |
| 5   | Clerk (Google + email), `auth` flag, sign-in and sign-up pages; Clerk JS only there | ⏳     |
| 6   | Auth middleware, `/dashboard`, user row created on first sign-in                    | ⏳     |
| 7   | Clerk webhook: verified signatures, each event processed once                       | ⏳     |
| 8   | Privacy page and account deletion (needed once real people sign up)                 | ⏳     |
| 9   | Analytics: Cloudflare Web Analytics + server-side product events                    | ⏳     |
| 10  | Sign-in journey e2e tests in CI                                                     | ⏳     |
| 11  | `auth` flag on staging → release v0.3.0                                             | ⏳     |

Decisions: two Clerk applications (staging and production) so test sign-ups never mix with real
ones; PR previews share the staging database (migrations must be backward-compatible).

## v0.4 Email capture ⏳

`topics` (JavaScript, React, DevOps, …) · `subscribers`, `lead_magnets` · R2 storage provider ·
Resend email provider · signup form + Turnstile · double opt-in · free cheat-sheet PDFs · unsubscribe

## v0.5 Quizzes & assessments ⏳

Questions with code blocks · quizzes embedded in blog posts · timed assessments (server timer, palette,
mark for review, autosave, survives refresh, auto-submit) · server-side scoring (answers never sent
before submit) · topic-wise results · admin CSV import · unit + e2e tests · **"Explain my mistake"**
(AI, Cloudflare Workers AI behind a provider interface; signed-in users, daily limit, cached)

## v0.6 Payments (Razorpay test mode) ⏳

`products`, `product_items`, `orders`, `enrollments` · prices from DB only · checkout · signature
check · idempotent webhook → enrollment · `hasAccess()` · receipt email · demo legal pages · tests

## v0.7 Courses ⏳

`courses`, `lessons`, `lesson_progress` · sales page · player (unlisted YouTube, gated) · signed R2
URLs for PDFs · progress tracking · tests

## v0.8 AI ⏳

"Ask the blog": answers built only from our articles, with links (vector search over posts) ·
AI-drafted quiz questions from an article, reviewed by an admin before publishing · study plan from
topic-wise results · per-user limits, spend limits, AI answers labelled

## v1.0 Portfolio launch ⏳

Sentry · rate limiting · security headers + CSP · security review · uptime monitoring · backup/restore
and rollback drills · demo data + demo login · mobile Lighthouse 90+ · polished README ·
custom domain · legal pages reviewed (terms, refunds, grievance contact)
