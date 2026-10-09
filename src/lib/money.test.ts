import { describe, expect, it } from "vitest";
import { assertPaise, formatINR, paiseToRupees, rupeesToPaise } from "@/lib/money";

describe("assertPaise", () => {
  it("accepts zero and positive integers", () => {
    expect(assertPaise(0)).toBe(0);
    expect(assertPaise(49900)).toBe(49900);
  });

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    "rejects %s",
    (value) => {
      expect(() => assertPaise(value)).toThrow(RangeError);
    },
  );
});

describe("rupeesToPaise", () => {
  it("converts whole and decimal rupees", () => {
    expect(rupeesToPaise(499)).toBe(49900);
    expect(rupeesToPaise(0.5)).toBe(50);
  });

  it("handles floating-point edge cases exactly", () => {
    // 19.99 * 100 === 1998.9999999999998 in JavaScript
    expect(rupeesToPaise(19.99)).toBe(1999);
    expect(rupeesToPaise(0.1 + 0.2)).toBe(30);
  });

  it.each([-1, 19.999, Number.NaN, Number.POSITIVE_INFINITY])("rejects %s", (value) => {
    expect(() => rupeesToPaise(value)).toThrow(RangeError);
  });
});

describe("paiseToRupees", () => {
  it("converts back to rupees", () => {
    expect(paiseToRupees(assertPaise(1999))).toBe(19.99);
  });
});

describe("formatINR", () => {
  it.each([
    [0, "₹0"],
    [49900, "₹499"],
    [1999, "₹19.99"],
    [12345600, "₹1,23,456"],
    [123456750, "₹12,34,567.50"],
  ])("formats %i paise as %s", (paise, expected) => {
    expect(formatINR(assertPaise(paise))).toBe(expected);
  });
});
