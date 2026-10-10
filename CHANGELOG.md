# Changelog

All notable changes to PrepNest are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) ·
Versioning: [Semantic Versioning](https://semver.org/) ·
Process: [docs/release-process.md](docs/release-process.md)

## [Unreleased]

### Added

- Blog: MDX posts validated at build time, post pages with code highlighting in the Syntax
  colours, an index with pagination, topic and tag pages, and latest articles on the home page
- Three articles: `useEffect` in Strict Mode, `map(parseInt)`, and deploy vs release
- SEO: canonical URLs, Open Graph and Twitter link previews with a branded image, structured
  data for articles and breadcrumbs; tag pages kept out of search results
- Sitemap with last-modified dates, environment-aware robots.txt, and an RSS feed of articles
- Article search (Pagefind): runs in the browser, no server or third-party service

### Fixed

- Footer showed "© 2026PrepNest" (missing space)

## [0.1.0] - 2026-10-09

The foundation: project setup, design system, and a complete delivery pipeline from pull request
to production. Live at <https://prepnest-production.prepnest.workers.dev>.

### Added

- Astro 7 project with strictest TypeScript, React islands and Tailwind CSS 4
- Cloudflare Workers deployment with separate `staging` and `production` Workers
- "Syntax" design system: light/dark themes, self-hosted variable fonts, WCAG AA colours
- Home page, site header and footer, environment banner, and `GET /api/health`
- Money helpers using integer paise, with Indian number formatting
- Site config, tech topics, and feature flags per environment with an enforced promotion rule
- Environment validation that fails the build on bad config, without logging secret values
- Provider interfaces for email, payments and storage, with fakes and a storage contract test
- Quality tooling: ESLint (TypeScript, React hooks, accessibility), Prettier, `astro check`,
  Vitest (84 unit tests)
- CI on every pull request and push to `main`; Conventional Commits PR titles
- Automatic staging deploys after CI passes, verified by a live smoke test
- Production deploys from release tags with manual approval, smoke test and GitHub Release;
  rollback by redeploying an earlier tag
- Repository protection: `main` ruleset (PRs, required checks, linear history), immutable
  release tags
- Security: CodeQL, secret scanning with push protection, Dependabot alerts and updates,
  private vulnerability reporting
- Documentation: setup, architecture, 10 decision records, release process, CI/CD,
  environments, GitHub and Cloudflare setup, design system, providers, testing, roadmap,
  step logs, contributing guide, security policy

[Unreleased]: https://github.com/vasanthpai/PrepNest/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/vasanthpai/PrepNest/releases/tag/v0.1.0
