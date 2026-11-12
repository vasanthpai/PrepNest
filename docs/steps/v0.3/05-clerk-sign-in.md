# v0.3 steps 5 and 6: Sign in with Clerk, and the dashboard

**Ticket:** [#60](https://github.com/vasanthpai/PrepNest/issues/60) · **Branch:** `feature/v0.3-clerk` ·
**Commit:** `feat: sign in with Google or email, and see your dashboard`

## Goal

People can sign in with Google or email, see a `/dashboard`, and sign out, while the blog stays
free of Clerk's JavaScript. Behind the `auth` flag, on for **local only** in this step.
Decision record: [ADR 0013](../../decisions/0013-clerk-hosted-sign-in.md).

Roadmap steps 5 (Clerk) and 6 (middleware, dashboard, user row) are done together: without the
dashboard there's nowhere to land after signing in, so step 5 alone couldn't be tested.

## The change of plan

The plan said "Clerk only on the sign-in pages". Reading `@clerk/astro`'s source showed its
integration injects a loader into **every** page. The maintainer chose Clerk's **hosted** sign-in
pages, with only Clerk's server middleware in our app, limited to the auth routes.

## Done in Clerk (by hand)

| What                                                                      | Where                       |
| ------------------------------------------------------------------------- | --------------------------- |
| Applications `PrepNest staging` and `PrepNest production`, Email + Google | Clerk dashboard             |
| `CLERK_SECRET_KEY` (staging app)                                          | `.dev.vars`, staging Worker |
| `CLERK_SECRET_KEY` (production app)                                       | production Worker           |
| Publishable keys                                                          | `wrangler.jsonc` (public)   |

## How it works

```
Header "Sign in" ──► /sign-in ──► Clerk's hosted page (Google or email)
                                         │ redirect_url = /dashboard
                                         ▼
/dashboard ── Clerk middleware: session? ──no──► back to sign-in
                     │ yes
                     ▼
           ensureUser(): upsert into users ──► "Welcome, Asha" · email · member since
                     │
             [Sign out] POST /sign-out ──► revoke session at Clerk, delete cookies ──► /
```

## What changed

| File                                                     | Change                                                                               |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `package.json`                                           | `@clerk/astro` 4.1.22 (pinned)                                                       |
| `wrangler.jsonc`                                         | `PUBLIC_CLERK_PUBLISHABLE_KEY` per environment                                       |
| `src/config/env.ts`, `features.ts`, `site.ts`            | Both Clerk keys in the schema (optional); `auth` on locally; "Sign in" in the header |
| `src/middleware.ts`                                      | Clerk's middleware only for auth routes, flag on, keys present, not pre-rendered     |
| `src/lib/auth/clerk.ts`, `responses.ts`                  | Which routes need Clerk; cookie helpers; 404 (flag off) or 503 (no keys)             |
| `src/pages/sign-in.ts`, `sign-out.ts`, `dashboard.astro` | The three routes                                                                     |
| `src/features/users/service.ts`, `index.ts`              | `userFieldsFromClerk`, `ensureUser`                                                  |
| `src/lib/db/runtime.ts`                                  | `getDb()`: the environment's database for request handlers                           |
| `src/env.d.ts`                                           | Types for `Astro.locals.auth()` and `currentUser()`                                  |

## Verified (automated)

| Check                                         | Result                                                                       |
| --------------------------------------------- | ---------------------------------------------------------------------------- |
| Clerk in any built static page or script      | None                                                                         |
| `GET /sign-in`                                | 307 to `perfect-trout-9001.accounts.dev/sign-in?redirect_url=…/dashboard`    |
| `GET /dashboard` while signed out             | 307 to the same sign-in page                                                 |
| `POST /sign-out` from the site / another site | 303 home / **403** (Astro origin check)                                      |
| Unit tests (19 new)                           | Route matching, cookie helpers, Clerk → user mapping, `ensureUser` on PGlite |

## Verified by hand (maintainer, locally)

To fill in after testing: sign up with email, sign in with Google, dashboard shows the right
email, a row appears in `users` on the `dev` branch, sign out returns home and `/dashboard` asks
to sign in again.

## Next

Step 7: the Clerk webhook (profile changes and deletions). Then the flag goes on for staging.
