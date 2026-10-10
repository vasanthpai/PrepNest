import { describe, expect, it } from "vitest";
import {
  cleanExcerpt,
  MAX_QUERY_LENGTH,
  normalizeQuery,
  resultsMessage,
  resultUrl,
} from "@/lib/search";

describe("normalizeQuery", () => {
  it.each([
    ["  parseInt  ", "parseInt"],
    ["feature    flags\n", "feature flags"],
    ["", ""],
    [null, ""],
    [undefined, ""],
  ])("%j → %j", (raw, expected) => {
    expect(normalizeQuery(raw)).toBe(expected);
  });

  it("caps very long queries", () => {
    expect(normalizeQuery("x".repeat(500))).toHaveLength(MAX_QUERY_LENGTH);
  });
});

describe("cleanExcerpt", () => {
  it("keeps <mark> highlights", () => {
    expect(cleanExcerpt("why <mark>parseInt</mark> returns")).toBe(
      "why <mark>parseInt</mark> returns",
    );
  });

  it.each([
    ['<img src=x onerror="alert(1)">hi', "hi"],
    ["<script>alert(1)</script>ok", "alert(1)ok"],
    ['<mark onclick="x">a</mark>', "a</mark>"],
    ["<b>bold</b> <MARK>m</MARK>", "bold <MARK>m</MARK>"],
  ])("drops every other tag: %s", (input, expected) => {
    expect(cleanExcerpt(input)).toBe(expected);
  });
});

describe("resultUrl", () => {
  it.each([
    ["/blog/map-parseint-returns-nan.html", "/blog/map-parseint-returns-nan"],
    ["/blog/x", "/blog/x"],
    ["/index.html", "/"],
  ])("%s → %s", (input, expected) => {
    expect(resultUrl(input)).toBe(expected);
  });
});

describe("resultsMessage", () => {
  it("is empty without a query", () => {
    expect(resultsMessage(0, "")).toBe("");
  });

  it("pluralises and quotes the query", () => {
    expect(resultsMessage(1, "flags")).toBe("1 result for “flags”");
    expect(resultsMessage(3, "react")).toBe("3 results for “react”");
  });

  it("suggests what to do when nothing matches", () => {
    expect(resultsMessage(0, "cobol")).toMatch(/No articles match “cobol”\. Try/);
  });
});
