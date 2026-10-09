import { describe, expect, it } from "vitest";
import { findTopic, TOPIC_CHIP_CLASSES, TOPIC_COLORS, topics } from "@/config/topics";

describe("topics", () => {
  it("has unique, URL-safe slugs", () => {
    const slugs = topics.map((topic) => topic.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("only uses defined syntax colours, and every colour has chip classes", () => {
    for (const topic of topics) expect(TOPIC_COLORS).toContain(topic.color);
    for (const color of TOPIC_COLORS) expect(TOPIC_CHIP_CLASSES[color]).toContain(`text-${color}`);
  });

  it("finds a topic by slug", () => {
    expect(findTopic("react")?.label).toBe("React");
    expect(findTopic("cobol")).toBeUndefined();
  });
});
