import { describe, expect, it } from "vitest";
import { buildHealth, healthHttpStatus } from "@/lib/health";

const now = new Date("2026-10-09T10:30:00.000Z");

describe("buildHealth", () => {
  it("reports ok with environment, version, database and an ISO timestamp", () => {
    const report = buildHealth({ env: "staging", version: "0.1.0", now, database: "ok" });
    expect(report).toEqual({
      status: "ok",
      env: "staging",
      version: "0.1.0",
      database: "ok",
      time: "2026-10-09T10:30:00.000Z",
    });
    expect(healthHttpStatus(report)).toBe(200);
  });

  it.each(["staging", "production"] as const)(
    "is degraded (503) when %s has no database configured",
    (env) => {
      const report = buildHealth({ env, version: "1.0.0", now, database: "not-configured" });
      expect(report.status).toBe("degraded");
      expect(healthHttpStatus(report)).toBe(503);
    },
  );

  it("is degraded when the database is unreachable, even locally", () => {
    const report = buildHealth({ env: "local", version: "1.0.0", now, database: "unreachable" });
    expect(report.status).toBe("degraded");
  });

  it("is ok locally without a database (CI builds and fresh clones have none)", () => {
    const report = buildHealth({ env: "local", version: "1.0.0", now, database: "not-configured" });
    expect(report.status).toBe("ok");
    expect(healthHttpStatus(report)).toBe(200);
  });

  it("only exposes the documented fields (the endpoint is public)", () => {
    const report = buildHealth({ env: "production", version: "1.0.0", now, database: "ok" });
    expect(Object.keys(report).sort()).toEqual(["database", "env", "status", "time", "version"]);
  });
});
