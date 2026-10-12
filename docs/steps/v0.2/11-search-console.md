# v0.2 step 11: Verify the production site in Google Search Console (v0.2.1)

**Ticket:** [#36](https://github.com/vasanthpai/PrepNest/issues/36) · **Branch:**
`feat/search-console-verification` · **Commit:** `feat: verify the production site in Google Search Console`

## Goal

Prove to Google that we own <https://prepnest-production.prepnest.workers.dev/>, so we can see
search performance and submit the sitemap. Ship it as patch release **v0.2.1**.

## Choosing the method

| Method                | Works on `workers.dev`? | Why                                                       |
| --------------------- | ----------------------- | --------------------------------------------------------- |
| Domain property (DNS) | No                      | Needs a TXT record; we don't control `workers.dev`'s DNS  |
| URL prefix, HTML tag  | Yes                     | A `<meta>` in every page's `<head>`                       |
| URL prefix, HTML file | **Yes (chosen)**        | One URL, isolated from page templates, easy to smoke-test |

## What changed

| File                                  | Change                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------- |
| `src/lib/site-verification.ts`        | File name and response: 200 + exact line in production, 404 elsewhere     |
| `src/lib/site-verification.test.ts`   | Production body, 404 in staging and local, route file name matches        |
| `src/pages/googlef33373e4667df5d9.ts` | Server route (`prerender = false`) serving `/googlef33373e4667df5d9.html` |
| `scripts/smoke-test.ts`               | New check after every deploy: 200 + exact body in production, else 404    |
| `docs/seo.md`                         | Search Console section                                                    |

## Two traps, both found by testing the built Worker

1. **A static file gets redirected.** Cloudflare's asset handling answers `/name.html` with a
   **307** to `/name` (checked: `/blog.html` → `/blog`). Google may not follow it, so the file is
   a Worker route instead of a file in `public/`.
2. **A route named `….html.ts` is never matched.** With `build.format: "file"`, Astro's router
   strips `.html` from the request path before matching (`normalizeFileFormatPathname` in
   `astro/dist/core/routing/router.js`). `/googlef….html` became `/googlef…`, matched the
   prerendered `[search]` route, found no page and returned 404, even in a production build.
   Naming the route file without `.html` fixes it.

Unit tests passed in both broken versions; only requesting the URL from a built Worker showed the
problem. The smoke test now does that after every deploy.

## Verified locally

| Build                       | `GET /googlef33373e4667df5d9.html`                                                    |
| --------------------------- | ------------------------------------------------------------------------------------- |
| `CLOUDFLARE_ENV=production` | 200, `google-site-verification: googlef33373e4667df5d9.html`, no redirect, `no-store` |
| local                       | 404                                                                                   |
| Live staging (smoke test)   | 404 ("404 outside production")                                                        |

`/blog`, `/search` and the other routes are unchanged. No static file is emitted.

## After the v0.2.1 release (by hand)

1. Search Console → **Verify**.
2. **Sitemaps** → submit `sitemap.xml`.
3. Optional: **URL inspection** on the home page → **Request indexing**.

Never remove the route: Google re-checks it and un-verifies the property if it disappears.
