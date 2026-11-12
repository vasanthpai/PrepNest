# 0013. Sign in with Clerk's hosted pages; Clerk only on auth routes

- **Status:** Accepted
- **Date:** 2026-11-12
- **Ticket:** [#60](https://github.com/vasanthpai/PrepNest/issues/60)

## Context

v0.3 adds accounts (Google and email). We chose Clerk (free plan, development instances) so we
never store passwords. The blog has strict budgets: 0 KB of JavaScript on content pages and 0
third-party requests, enforced by Lighthouse CI.

Clerk's Astro integration (`clerk()` in `astro.config.mjs`) injects its loader into **every page**
(Astro `injectScript("page")`), including pre-rendered blog pages. That would load Clerk's
JavaScript from Clerk's servers on every article.

## Decision

- **No `clerk()` integration.** Only Clerk's server middleware (`clerkMiddleware` from
  `@clerk/astro/server`), which reads the keys from the Cloudflare Worker's environment.
- **The middleware runs only for auth routes** (`/sign-in`, `/sign-out`, `/dashboard`), only
  when the `auth` flag is on and both keys exist, and never for pre-rendered pages. It adds
  Clerk's script only to those routes' HTML.
- **Sign-in and sign-up on Clerk's hosted pages** (Account Portal, e.g.
  `perfect-trout-9001.accounts.dev`), branded in the Clerk dashboard. `/sign-in` redirects there
  and Clerk sends people back to `/dashboard`.
- **Sign-out without Clerk's script:** a POST form to `/sign-out`, which revokes the session
  through Clerk's API and deletes Clerk's session cookies. Astro's origin check blocks cross-site
  posts.
- **Two Clerk applications** (development instances): `PrepNest staging` for local, previews and
  staging; `PrepNest production` for production. Test sign-ups never mix with real ones.

| Key                            | Public? | Where                                             |
| ------------------------------ | ------- | ------------------------------------------------- |
| `PUBLIC_CLERK_PUBLISHABLE_KEY` | yes     | `wrangler.jsonc` vars, per environment (in Git)   |
| `CLERK_SECRET_KEY`             | no      | `.dev.vars`; Worker secrets (staging, production) |

## Consequences

- The blog keeps 0 KB of JavaScript and 0 third-party requests (checked: no built page or bundle
  mentions Clerk).
- The sign-in page looks like Clerk's, with our logo and colours, not our own Syntax design.
- Fewer moving parts than Clerk's components: no client SDK in our bundle, no React islands for auth.
- Development instances show a "Development mode" badge on Clerk's pages and have usage caps;
  fine for a portfolio. Going live would mean production instances and a custom domain.
- If Clerk changes how its middleware reads keys on Cloudflare, sign-in breaks: the dashboard
  e2e test (step 10) and the smoke test will show it.

## Alternatives considered

- **Clerk's integration as intended:** least code, but Clerk's script and requests on every
  page; we'd have to drop the blog's budgets.
- **Clerk's components on our own `/sign-in` page**, loading the script only there: our design,
  but depends on undocumented internals of `@clerk/astro`.
- **Auth.js / Lucia-style self-hosted auth:** more control, but we'd own password storage, email
  verification and account recovery.
