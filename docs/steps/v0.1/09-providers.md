# v0.1 step 9: Provider interfaces and fakes

**Ticket:** [#4](https://github.com/vasanthpai/PrepNest/issues/4) · **Branch:** `feature/v0.1-foundation` ·
**Commit:** `feat: add provider interfaces and fakes for email, payment and storage`

## Goal

Interfaces for every outside service (email, payments, storage) plus fakes, so features can be
built and tested without vendor SDKs, keys or network.

## What changed

| File                                    | Change                                                                     |
| --------------------------------------- | -------------------------------------------------------------------------- |
| `src/lib/providers/errors.ts`           | New: `ProviderError` (provider name, `retryable`, `cause`)                 |
| `src/lib/providers/email.ts`            | New: `EmailProvider`, `EmailMessage` (plain text required)                 |
| `src/lib/providers/payment.ts`          | New: `PaymentProvider`, amounts in `Paise`, `validateCreateOrder`          |
| `src/lib/providers/storage.ts`          | New: `StorageProvider`, `assertValidKey`, `assertValidExpiry`              |
| `src/lib/providers/index.ts`            | New: public exports                                                        |
| `src/lib/providers/fakes/*.ts`          | New: `FakeEmailProvider`, `FakePaymentProvider`, `InMemoryStorageProvider` |
| `src/lib/providers/storage.contract.ts` | New: contract test suite for any storage implementation                    |
| `src/lib/providers/**/*.test.ts`        | New: 35 tests (79 total)                                                   |
| `docs/providers.md`                     | New: why, interfaces, rules, fakes, contract tests, checklist              |

## Why

- **Dependency direction:** features depend on interfaces; vendors are plug-ins. No SDK installed yet.
- **Fakes with "genuine" helpers** (`signPayment`, `signWebhook`) let tests cover both real and
  tampered payments and webhooks, which v0.6 needs.
- **A contract test** makes the fake trustworthy: the R2 adapter will have to pass the same suite.
- **`Paise` in the payment interface:** passing a plain number (maybe rupees) is a compile error,
  proven by a `@ts-expect-error` test.

## Issues hit and fixes

| Problem                                                    | Cause                                                                                                 | Fix                                          |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `Uint8Array<ArrayBufferLike>` not assignable to `BodyInit` | Newer TypeScript tracks a typed array's buffer type; `Response` only takes normal `ArrayBuffer` bytes | `StorageBody` uses `Uint8Array<ArrayBuffer>` |

## Validation

- [x] `npm test` → 9 files, 79 tests passed
- [x] lint, format:check, typecheck, build pass
- [x] Unsafe storage keys (`../secret.pdf`, `/absolute.pdf`, `UPPER.pdf`, …) rejected
- [x] Tampered webhook body and reused payment signature rejected
