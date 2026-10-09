# Contributing to PrepNest

Thanks for your interest. PrepNest is a learning project built in public, but it follows the
workflow of a production team. This page is the short version; details are linked.

## Setup

Follow [docs/setup.md](docs/setup.md). You need Node.js 24 (see `.nvmrc`).

## Workflow

1. **Pick or open an issue.** Every change starts from a ticket.
2. **Branch from `main`:**

   | Prefix     | For                   | Example                   |
   | ---------- | --------------------- | ------------------------- |
   | `feature/` | New functionality     | `feature/v0.2-blog`       |
   | `fix/`     | Bug fixes             | `fix/quiz-timer-negative` |
   | `chore/`   | Tooling, dependencies | `chore/upgrade-astro`     |
   | `docs/`    | Documentation only    | `docs/release-process`    |

3. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):

   ```
   feat: add topic pages to the blog

   Closes #12
   ```

   Types: `feat`, `fix`, `docs`, `test`, `chore`, `ci`, `refactor`, `perf`. Add `!` for breaking
   changes (`feat!: …`).

4. **Open a pull request** into `main` with a Conventional Commits title. CI must pass.

## Pull request checklist

- [ ] Linked to an issue (`Closes #n`)
- [ ] `npm run check` passes locally (same checks as CI)
- [ ] Tests added or updated for new logic (including failure cases)
- [ ] New features are behind a flag in `src/config/features.ts`
- [ ] New env variables added to `src/config/env.ts` and [docs/environments.md](docs/environments.md)
- [ ] Docs updated (step log, architecture, or an ADR for significant decisions)
- [ ] Works at 360px wide, in light and dark mode

## Code rules

The essentials (full list in [docs/architecture.md](docs/architecture.md#core-rules)):

- Pages stay thin; logic lives in `src/features/<name>/service.ts`.
- Outside services only through `src/lib/providers/` interfaces.
- Money is integer paise (`Paise`); never trust prices from the browser.
- Database changes only through migrations, backward-compatible.
- Colour only carries meaning (see [docs/design-system.md](docs/design-system.md)).

## Releases

Maintainers release with tags; see [docs/release-process.md](docs/release-process.md).
