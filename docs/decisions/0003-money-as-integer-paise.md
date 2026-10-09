# 0003. Store money as integer paise

- **Status:** Accepted
- **Date:** 2026-10-09
- **Ticket:** [#1](https://github.com/vasanthpai/PrepNest/issues/1)

## Context

JavaScript numbers are floating point: `19.99 * 100 === 1998.9999999999998` and
`0.1 + 0.2 !== 0.3`. Prices, orders and refunds must be exact. Razorpay's API also takes amounts in
the smallest currency unit (paise).

## Decision

All money is an **integer number of paise** (₹1 = 100 paise), typed as a branded `Paise` type
(`src/lib/money.ts`). Rupee decimals exist only at the edges: admin input (`rupeesToPaise`) and
display (`formatINR`). Invalid amounts (negative, fractional paise, sub-paise rupees) **throw**
instead of being rounded.

## Consequences

- Arithmetic on prices is exact; the database stores plain integers.
- TypeScript rejects a plain `number` where `Paise` is expected, so rupees can't be passed by mistake.
- Every boundary must convert explicitly, which is a little more code.
- Prices are always read from our database on the server; the browser never sends an amount.

## Alternatives considered

- **Decimal library (e.g. decimal.js)**: exact, but heavier and still needs care at boundaries.
- **Postgres `numeric` + strings in JS**: exact storage, awkward arithmetic in code.
- **Floating-point rupees**: rejected; rounding bugs in money are unacceptable.
