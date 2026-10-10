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
  it("keeps <mark> highlights and existing entities", () => {
    expect(cleanExcerpt("why <mark>parseInt</mark> returns &lt;b&gt;")).toBe(
      "why <mark>parseInt</mark> returns &lt;b&gt;",
    );
  });

  it.each([
    ['<img src=x onerror="alert(1)">hi', '&lt;img src=x onerror="alert(1)"&gt;hi'],
    ["<script>alert(1)</script>", "&lt;script&gt;alert(1)&lt;/script&gt;"],
    // The bypass CodeQL flagged in the old "delete the tags" version:
    [
      "<<b>script>alert(1)<</b>/script>",
      "&lt;&lt;b&gt;script&gt;alert(1)&lt;&lt;/b&gt;/script&gt;",
    ],
    ['<mark onclick="x">a</mark>', '&lt;mark onclick="x"&gt;a</mark>'],
    ["<MARK>m</MARK>", "&lt;MARK&gt;m&lt;/MARK&gt;"],
  ])("turns every other tag into harmless text: %s", (input, expected) => {
    expect(cleanExcerpt(input)).toBe(expected);
  });

  it("never outputs a tag other than <mark> or </mark>", () => {
    const nasty = "<<scr<b>ipt>><svg/onload=alert(1)><mark><iframe></mark>";
    const tags = cleanExcerpt(nasty).match(/<[^>]*>/g) ?? [];
    expect(tags.every((tag) => tag === "<mark>" || tag === "</mark>")).toBe(true);
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
