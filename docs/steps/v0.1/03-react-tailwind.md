# v0.1 step 3: React islands and Tailwind CSS

**Ticket:** — · **Branch:** `feature/v0.1-foundation` · **Commit:** `cc62d71`

## Goal

Interactive React components only where needed (islands), and Tailwind for styling.

## What changed

| File                             | Change                                                    |
| -------------------------------- | --------------------------------------------------------- |
| `astro.config.mjs`               | `@astrojs/react` integration, `@tailwindcss/vite` plugin  |
| `tsconfig.json`                  | `jsx: react-jsx`, `jsxImportSource: react`                |
| `src/styles/global.css`          | Tailwind v4 import + `@theme` brand tokens, system fonts  |
| `src/components/HelloIsland.tsx` | Temporary counter to prove hydration (removed in step 10) |
| `src/pages/index.astro`          | Uses the island with `client:visible`                     |

## Why

- Astro ships zero JavaScript by default; only `client:*` components hydrate. Fast on cheap phones.
- Tailwind v4 is configured in CSS (`@theme`); tokens generate utility classes like `bg-brand-600`.

## Validation

- [x] Indigo heading, counter button increments
- [x] Page source shows `<astro-island>` only around the button
