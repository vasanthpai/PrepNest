# 0002. Astro on Cloudflare Workers

- **Status:** Accepted
- **Date:** 2026-10-05
- **Ticket:** v0.1 steps 2–4 (before ticketing)

## Context

- Mostly content (articles), with a few highly interactive screens (quiz player, checkout).
- Readers are often on budget Android phones and slow mobile data.
- Must cost nothing to host at portfolio scale, with separate staging and production.
- SEO matters for the blog.

## Decision

Use **Astro** (TypeScript, strictest) with **React islands** only where interaction is needed, deployed
to **Cloudflare Workers** with `@astrojs/cloudflare`. Pages are pre-rendered by default; only routes
that depend on the visitor run per request. Staging and production are two Workers defined in
`wrangler.jsonc`, selected at build time with `CLOUDFLARE_ENV`.

## Consequences

- Content pages ship almost no JavaScript (home page: ~0.5 KB) and are served as static files.
- `astro dev` runs on `workerd`, the production runtime, so runtime differences show up locally.
- Free tier covers the project (static asset requests are free; ~100k Worker requests/day).
- Workers aren't Node: some npm packages won't run; we enable `nodejs_compat` and choose
  Workers-compatible libraries (Neon serverless driver, Drizzle).
- Short CPU time per request on the free plan: heavy work must stay off the request path.

## Alternatives considered

- **Next.js on Vercel**: great DX, but ships more JavaScript by default and the free tier
  restricts commercial use.
- **Plain SPA (Vite + React)**: weak SEO and slow first load on cheap phones.
- **Node server on a VPS**: costs money, needs patching, no edge locations.
