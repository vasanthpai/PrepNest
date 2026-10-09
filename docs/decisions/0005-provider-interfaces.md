# 0005. Outside services behind interfaces, with fakes

- **Status:** Accepted
- **Date:** 2026-10-09
- **Ticket:** [#4](https://github.com/vasanthpai/PrepNest/issues/4)

## Context

PrepNest will send email (Resend), take payments (Razorpay) and store files (Cloudflare R2).
Business logic that calls vendor SDKs directly is hard to test (network, keys, cost) and hard to
move to another vendor.

## Decision

Feature code depends only on interfaces in `src/lib/providers/`: `EmailProvider`,
`PaymentProvider`, `StorageProvider`. Each has a fake for tests and local development. Shared rules
(minimum order, safe storage keys, link expiry) live next to the interface. Storage implementations
must pass a shared **contract test**. Failures are reported as `ProviderError` with a `retryable` flag.

## Consequences

- Business logic is unit-tested without network or API keys.
- Switching vendors means writing one adapter.
- The contract test keeps fakes honest: the real R2 adapter must pass the same suite.
- One extra layer to read through; interfaces must be kept small.

## Alternatives considered

- **Call SDKs directly and mock modules in tests**: brittle mocks tied to SDK internals.
- **Hit real sandbox APIs in tests**: slow, flaky, needs secrets in CI.
