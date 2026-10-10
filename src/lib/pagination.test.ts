import { describe, expect, it } from "vitest";
import { allPages, paginate } from "@/lib/pagination";

const items = Array.from({ length: 23 }, (_, i) => i + 1);

describe("paginate", () => {
  it("returns the first page", () => {
    const page = paginate(items, 10, 1);
    expect(page.items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(page).toMatchObject({
      page: 1,
      totalPages: 3,
      totalItems: 23,
      hasPrev: false,
      hasNext: true,
    });
  });

  it("returns a partial last page", () => {
    const page = paginate(items, 10, 3);
    expect(page.items).toEqual([21, 22, 23]);
    expect(page).toMatchObject({ hasPrev: true, hasNext: false });
  });

  it("gives an empty list one empty page", () => {
    expect(paginate([], 10, 1)).toMatchObject({
      items: [],
      page: 1,
      totalPages: 1,
      hasNext: false,
    });
  });

  it("has exactly one page when items fit", () => {
    expect(paginate([1, 2, 3], 10, 1)).toMatchObject({
      totalPages: 1,
      hasPrev: false,
      hasNext: false,
    });
  });

  it.each([0, 4, -1, 1.5])("rejects page %s", (page) => {
    expect(() => paginate(items, 10, page)).toThrow(RangeError);
  });

  it.each([0, -5, 2.5])("rejects page size %s", (size) => {
    expect(() => paginate(items, size, 1)).toThrow(RangeError);
  });
});

describe("allPages", () => {
  it("returns every page in order", () => {
    expect(allPages(items, 10).map((p) => p.items.length)).toEqual([10, 10, 3]);
  });

  it("returns one page for an empty list", () => {
    expect(allPages([], 10)).toHaveLength(1);
  });
});
