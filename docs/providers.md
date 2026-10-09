# Providers (outside services)

Feature code never talks to a vendor SDK directly. It depends on an **interface** in
`src/lib/providers/`, and gets a concrete implementation passed in.

```
 features/newsletter/service.ts ──► EmailProvider (interface)
                                          ▲            ▲
                               ResendEmailProvider   FakeEmailProvider
                                 (v0.4, real)          (tests, local dev)
```

## Why

| Benefit              | Example                                                                               |
| -------------------- | ------------------------------------------------------------------------------------- |
| **Testable**         | A signup test checks the confirmation email without sending one                       |
| **Swappable**        | Moving from Resend to another vendor means one new adapter, no feature edits          |
| **Consistent rules** | Minimum order, safe storage keys and link expiry are enforced the same way everywhere |
| **Free to run**      | Tests and local dev need no API keys, network or paid quota                           |

## The interfaces

| Interface         | Methods                                                  | Real implementation       | Fake                      |
| ----------------- | -------------------------------------------------------- | ------------------------- | ------------------------- |
| `EmailProvider`   | `send(message)`                                          | Resend (v0.4)             | `FakeEmailProvider`       |
| `PaymentProvider` | `createOrder`, `verifyPaymentSignature`, `verifyWebhook` | Razorpay test mode (v0.6) | `FakePaymentProvider`     |
| `StorageProvider` | `put`, `get`, `delete`, `getDownloadUrl`                 | Cloudflare R2 (v0.4)      | `InMemoryStorageProvider` |

All failures from an outside service are thrown as `ProviderError`, with the provider name and a
`retryable` flag (timeouts and rate limits: retry; bad input or credentials: don't).

## Shared rules

| Rule                                                      | Where                           |
| --------------------------------------------------------- | ------------------------------- |
| Payment amounts are `Paise` (integer), never rupees       | `CreateOrderInput.amount` type  |
| Minimum order ₹1 (100 paise); receipt 1–40 chars          | `validateCreateOrder()`         |
| Storage keys: lowercase, no leading `/`, no `..`, no `//` | `assertValidKey()`              |
| Download links expire within 1 hour                       | `assertValidExpiry()`           |
| Every email has a plain-text body                         | `EmailMessage.text` is required |

## Fakes

Fakes behave like the real thing, with test helpers:

```ts
const email = new FakeEmailProvider();
await subscribe("dev@example.com", { email });
expect(email.sentTo("dev@example.com")[0]?.subject).toMatch(/confirm/i);

email.failNextWith(new ProviderError("fake-email", "rate limited", { retryable: true }));

const payments = new FakePaymentProvider();
const signature = await payments.signPayment(order.id, "pay_1"); // a "genuine" signature
const header = await payments.signWebhook(rawBody); // a "genuine" webhook
```

## Contract tests

`storage.contract.ts` is a test suite that **every** `StorageProvider` must pass: round-trips, all
body types, overwrites, missing keys, deletes, unsafe keys and expiry limits.

```ts
runStorageContract("InMemoryStorageProvider", () => new InMemoryStorageProvider());
runStorageContract("R2StorageProvider", () => new R2StorageProvider(env.FILES)); // v0.4
```

When the R2 adapter arrives, it gets tested against exactly the same rules as the fake. That's what
makes the fake trustworthy in every other test.

## Adding a real implementation (checklist)

1. Create `src/lib/providers/<vendor>-<kind>.ts` implementing the interface.
2. Call the shared validators (`validateCreateOrder`, `assertValidKey`, …) before the vendor API.
3. Wrap vendor errors in `ProviderError`, setting `retryable` correctly.
4. Add its secrets to `src/config/env.ts` and [environments.md](environments.md).
5. Storage: run `runStorageContract` against it.
