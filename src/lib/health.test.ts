import { describe, expect, it } from "vitest";
import { buildHealth } from "@/lib/health";

describe("buildHealth", () => {
  it("reports ok with environment, version and an ISO timestamp", () => {
    const now = new Date("2026-10-09T10:30:00.000Z");
    expect(buildHealth({ env: "staging", version: "0.1.0", now })).toEqual({
      status: "ok",
      env: "staging",
      version: "0.1.0",
      time: "2026-10-09T10:30:00.000Z",
    });
  });

  it("only exposes the documented fields (the endpoint is public)", () => {
    const report = buildHealth({ env: "production", version: "1.0.0", now: new Date() });
    expect(Object.keys(report).sort()).toEqual(["env", "status", "time", "version"]);
  });
});
