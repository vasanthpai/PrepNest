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
| 14  | Cloudflare account, token, GitHub environments   | [#15](https://github.com/vasanthpai/PrepNest/issues/15) | [14](v0.1/14-cloudflare-setup.md)   |
| 15  | Deploy staging with smoke test                   | [#16](https://github.com/vasanthpai/PrepNest/issues/16) | [15](v0.1/15-deploy-staging.md)     |
| 16  | Production deploy workflow and v0.1.0 release    | [#18](https://github.com/vasanthpai/PrepNest/issues/18) | [16](v0.1/16-release.md)            |

**Retrospective:** [what went well, what we learned](v0.1/retrospective.md)

## v0.2 Blog

| #   | Step                                      | Ticket                                                  | Log                                 |
| --- | ----------------------------------------- | ------------------------------------------------------- | ----------------------------------- |
| 1   | Content collection, helpers, sample posts | [#22](https://github.com/vasanthpai/PrepNest/issues/22) | [01](v0.2/01-content-collection.md) |
| 2   | Post page, typography, code highlighting  | [#24](https://github.com/vasanthpai/PrepNest/issues/24) | [02](v0.2/02-post-page.md)          |
| 3   | Blog index, topic and tag pages           | [#25](https://github.com/vasanthpai/PrepNest/issues/25) | [03](v0.2/03-blog-index.md)         |
| 4   | SEO, link previews, structured data       | [#26](https://github.com/vasanthpai/PrepNest/issues/26) | [04](v0.2/04-seo.md)                |
| 5   | Sitemap, robots.txt, RSS                  | [#27](https://github.com/vasanthpai/PrepNest/issues/27) | [05](v0.2/05-sitemap-rss.md)        |

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
