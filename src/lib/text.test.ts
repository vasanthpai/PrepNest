import { describe, expect, it } from "vitest";
import { countLabel } from "@/lib/text";

describe("countLabel", () => {
  it.each([
    [0, "0 articles"],
    [1, "1 article"],
    [2, "2 articles"],
  ])("%i → %s", (count, expected) => {
    expect(countLabel(count, "article")).toBe(expected);
  });

  it("accepts an irregular plural", () => {
    expect(countLabel(2, "quiz", "quizzes")).toBe("2 quizzes");
  });
});
