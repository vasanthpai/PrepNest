import { describe, expect, it } from "vitest";
import { formatDate, isoDate } from "@/lib/dates";

describe("formatDate", () => {
  it.each([
    ["2026-10-09", "9 Oct 2026"],
    ["2026-01-31", "31 Jan 2026"],
    ["2026-12-01", "1 Dec 2026"],
  ])("formats %s as %s", (input, expected) => {
    expect(formatDate(new Date(input))).toBe(expected);
  });

  it("keeps the calendar day regardless of time zone (UTC midnight stays that day)", () => {
    // 2026-10-09T00:00Z is still 8 Oct in New York; a post dated the 9th must show the 9th.
    expect(formatDate(new Date("2026-10-09T00:00:00Z"))).toBe("9 Oct 2026");
  });
});

describe("isoDate", () => {
  it("returns YYYY-MM-DD", () => {
    expect(isoDate(new Date("2026-10-09"))).toBe("2026-10-09");
  });
});
