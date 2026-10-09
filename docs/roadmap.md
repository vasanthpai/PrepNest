# Roadmap

PrepNest is a **tech learning platform**: a free tech blog, quizzes and timed assessments, and
tech courses. It's a portfolio project built in public, version by version, with a production-style
workflow and free-tier hosting.

Legend: ✅ done · 🚧 in progress · ⏳ planned

## Release process (every version)

```
feature/vX.Y-name → PR → CI green → merge to main → auto-deploy to staging → manual test
→ release PR (CHANGELOG) → tag vX.Y.0 → approval → production deploy → GitHub Release
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

## v0.2 Blog ⏳

MDX content collections (topic, tags, date) · list, post, topic and tag pages · SEO meta, Open Graph,
JSON-LD · sitemap, robots.txt, RSS · Pagefind search · 3 sample tech posts · unit tests for helpers ·
Playwright smoke test in CI · preview deploys per PR · Lighthouse CI

## v0.3 Database & auth ⏳

Neon (dev / staging / main branches) · Drizzle + migrations in the deploy pipeline · `users`,
`webhook_events` · Clerk (Google + email) · auth middleware, `/dashboard` · verified, idempotent
Clerk webhook + tests · release-please for automated changelog

## v0.4 Email capture ⏳

`topics` (JavaScript, React, DevOps, …) · `subscribers`, `lead_magnets` · R2 storage provider ·
Resend email provider · signup form + Turnstile · double opt-in · free cheat-sheet PDFs · unsubscribe

## v0.5 Quizzes & assessments ⏳

Questions with code blocks · quizzes embedded in blog posts · timed assessments (server timer, palette,
mark for review, autosave, survives refresh, auto-submit) · server-side scoring (answers never sent
before submit) · topic-wise results · admin CSV import · unit + e2e tests

## v0.6 Payments (Razorpay test mode) ⏳

`products`, `product_items`, `orders`, `enrollments` · prices from DB only · checkout · signature
check · idempotent webhook → enrollment · `hasAccess()` · receipt email · demo legal pages · tests

## v0.7 Courses ⏳

`courses`, `lessons`, `lesson_progress` · sales page · player (unlisted YouTube, gated) · signed R2
URLs for PDFs · progress tracking · tests

## v1.0 Portfolio launch ⏳

Sentry · rate limiting · security headers + CSP · security review · uptime monitoring · backup/restore
and rollback drills · demo data + demo login · mobile Lighthouse 90+ · polished README
