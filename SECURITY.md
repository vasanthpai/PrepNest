# Security policy

## Reporting a vulnerability

Please **don't open a public issue** for security problems.

Report privately through GitHub:
**[Security → Report a vulnerability](https://github.com/vasanthpai/PrepNest/security/advisories/new)**

Include what you found, how to reproduce it, and the impact you expect. You'll get a reply within
7 days. Once a fix is released, the advisory is published with credit to you (unless you'd rather
stay anonymous).

## Supported versions

Only the latest release (the version running on production) receives security fixes.

## Scope

PrepNest is a portfolio project. Payments run in **Razorpay test mode** only; no real money or real
card data is processed.

## What's already in place

- Secret scanning with push protection (commits containing API keys are blocked)
- CodeQL code scanning on every pull request
- Dependabot security alerts and automatic security update PRs
- Configuration validated at build time; secrets never logged (see `docs/environments.md`)
