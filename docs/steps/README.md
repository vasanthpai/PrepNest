# Step logs

Every build step has a short log: what changed, why, and how it was validated.
Each step from v0.1 step 6 onwards also has a GitHub issue (ticket) and closes it via its commit.

## v0.1 Foundation & pipeline

| #   | Step                                             | Ticket                                                  | Log                                 |
| --- | ------------------------------------------------ | ------------------------------------------------------- | ----------------------------------- |
| 1   | Install and verify tools                         | —                                                       | [01](v0.1/01-install-tools.md)      |
| 2   | Astro project, strictest TypeScript, git         | —                                                       | [02](v0.1/02-astro-project.md)      |
| 3   | React islands and Tailwind CSS                   | —                                                       | [03](v0.1/03-react-tailwind.md)     |
| 4   | Cloudflare adapter and wrangler environments     | —                                                       | [04](v0.1/04-cloudflare-adapter.md) |
| 5   | ESLint, Prettier, type checking, LF line endings | —                                                       | [05](v0.1/05-lint-format.md)        |
| 6   | Vitest and money helpers                         | [#1](https://github.com/vasanthpai/PrepNest/issues/1)   | [06](v0.1/06-vitest.md)             |
| 7   | Folder structure, site config, feature flags     | [#2](https://github.com/vasanthpai/PrepNest/issues/2)   | [07](v0.1/07-config-flags.md)       |
| 8   | Environment validation, typed Cloudflare env     | [#3](https://github.com/vasanthpai/PrepNest/issues/3)   | [08](v0.1/08-env-validation.md)     |
| 9   | Provider interfaces and fakes                    | [#4](https://github.com/vasanthpai/PrepNest/issues/4)   | [09](v0.1/09-providers.md)          |
| 10  | Syntax design system, layout, home, health       | [#5](https://github.com/vasanthpai/PrepNest/issues/5)   | [10](v0.1/10-design-system.md)      |
| 11  | README, decision records, release process        | [#6](https://github.com/vasanthpai/PrepNest/issues/6)   | [11](v0.1/11-docs.md)               |
| 12  | CI workflow, PR title check, first PR            | [#7](https://github.com/vasanthpai/PrepNest/issues/7)   | [12](v0.1/12-ci.md)                 |
| 13  | Branch protection, security, templates, merge    | [#10](https://github.com/vasanthpai/PrepNest/issues/10) | [13](v0.1/13-github-setup.md)       |

## Template for a new step log

```markdown
# vX.Y step N: <title>

**Ticket:** #<n> · **Branch:** feature/vX.Y-<name> · **Commit:** <type>: <message>

## Goal

## What changed

| File | Change |

## Why

## Validation

- [ ] command → expected result
```
