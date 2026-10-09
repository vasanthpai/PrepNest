import { describe, expect, it } from "vitest";
import { type NavItem, navFor, site } from "@/config/site";

const items: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog", flag: "blog" },
  { label: "Quizzes", href: "/quizzes", flag: "quizzes" },
];

describe("navFor", () => {
  it("always shows items without a flag", () => {
    const allOff = () => false;
    expect(navFor("production", items, allOff).map((i) => i.label)).toEqual(["About"]);
  });

  it("shows flagged items only when their feature is enabled", () => {
    const onlyBlog = (flag: string) => flag === "blog";
    expect(navFor("staging", items, onlyBlog).map((i) => i.label)).toEqual(["About", "Blog"]);
  });

  it("passes the environment to the flag check", () => {
    const stagingOnly = (_flag: string, env: string) => env === "staging";
    expect(navFor("production", items, stagingOnly)).toHaveLength(1);
    expect(navFor("staging", items, stagingOnly)).toHaveLength(3);
  });
});

describe("site", () => {
  it("only links to internal pages from the main nav", () => {
    for (const item of site.nav) {
      expect(item.href.startsWith("/")).toBe(true);
    }
  });
});
