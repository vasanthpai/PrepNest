/**
 * Money helpers.
 *
 * Rule: money is ALWAYS stored and passed around as integer paise (₹1 = 100 paise).
 * Floating-point rupees (19.99) only appear at the edges: admin input and display.
 * This avoids bugs like 0.1 + 0.2 === 0.30000000000000004.
 */

/** Integer amount in paise. Branded so a plain number can't be passed by mistake. */
export type Paise = number & { readonly __brand: "Paise" };

/** Validate a number as paise: a finite, non-negative, safe integer. */
export function assertPaise(value: number): Paise {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`Invalid paise amount: ${value}. Expected a non-negative integer.`);
  }
  return value as Paise;
}

/** Convert rupees (e.g. 19.99 from an admin form) to paise. Allows at most 2 decimals. */
export function rupeesToPaise(rupees: number): Paise {
  if (!Number.isFinite(rupees) || rupees < 0) {
    throw new RangeError(`Invalid rupee amount: ${rupees}. Expected a non-negative number.`);
  }
  const paise = Math.round(rupees * 100);
  // Reject sub-paise precision like 19.999 instead of silently rounding money.
  if (Math.abs(paise - rupees * 100) > 1e-6) {
    throw new RangeError(`Invalid rupee amount: ${rupees}. At most 2 decimal places allowed.`);
  }
  return assertPaise(paise);
}

/** Convert paise to rupees as a number. Use for display or provider APIs only, never storage. */
export function paiseToRupees(paise: Paise): number {
  return paise / 100;
}

const wholeRupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const withPaise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format paise for display with Indian digit grouping.
 * Whole rupees drop the decimals: ₹1,23,456 · otherwise always 2 decimals: ₹19.99, ₹12,34,567.50
 */
export function formatINR(paise: Paise): string {
  const formatter = paise % 100 === 0 ? wholeRupees : withPaise;
  return formatter.format(paiseToRupees(paise));
}
