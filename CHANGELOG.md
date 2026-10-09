# Changelog

All notable changes to PrepNest are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) ·
Versioning: [Semantic Versioning](https://semver.org/) ·
Process: [docs/release-process.md](docs/release-process.md)

## [Unreleased]

### Added

- Astro 7 project with strictest TypeScript, React islands and Tailwind CSS 4
- Cloudflare Workers deployment config with `staging` and `production` environments
- Quality tooling: ESLint (TypeScript, React hooks, accessibility), Prettier, `astro check`, Vitest
- Money helpers using integer paise, with Indian number formatting
- Site config, tech topics, and feature flags per environment with an enforced promotion rule
- Environment validation that fails the build on bad config, without logging secret values
- Provider interfaces for email, payments and storage, with fakes and a storage contract test
- "Syntax" design system: light/dark themes, self-hosted variable fonts, WCAG AA colours
- Home page, site header and footer, environment banner, and `GET /api/health`
- Documentation: setup, architecture, decision records, release process, environments,
  design system, providers, testing, roadmap, step logs, contributing guide
