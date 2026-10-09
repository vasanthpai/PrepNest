## What

<!-- One or two sentences: what changes for users or developers. -->

## Why

<!-- The problem this solves. Link the decision record if there is one. -->

## How it was tested

<!-- Commands run, screens checked (phone width, light/dark), edge cases. -->

## Checklist

- [ ] Title follows Conventional Commits (`feat: …`, `fix: …`)
- [ ] `npm run check` passes locally
- [ ] Tests added or updated, including failure cases
- [ ] New features are behind a flag in `src/config/features.ts`
- [ ] New env variables added to `src/config/env.ts` and `docs/environments.md`
- [ ] Database migrations are backward-compatible (expand, then contract)
- [ ] Docs updated (step log, architecture, ADR if a significant decision)
- [ ] Works at 360px wide, in light and dark mode

Closes #
