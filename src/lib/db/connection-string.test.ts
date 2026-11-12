import { describe, expect, it } from "vitest";
import { describeConnectionString, redactSecrets } from "@/lib/db/connection-string";

// Made-up values in Neon's format; not real credentials.
const pooled =
  "postgresql://app_user:s3cr3t-Pa55@ep-quiet-sky-a1b2c3d4-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const direct =
  "postgresql://app_user:s3cr3t-Pa55@ep-quiet-sky-a1b2c3d4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

describe("describeConnectionString", () => {
  it("describes a pooled Neon connection without the password", () => {
    const summary = describeConnectionString(pooled);
    expect(summary).toEqual({
      host: "ep-quiet-sky-a1b2c3d4-pooler.ap-southeast-1.aws.neon.tech",
      database: "neondb",
      user: "app_user",
      pooled: true,
      sslmode: "require",
    });
    expect(JSON.stringify(summary)).not.toContain("s3cr3t");
  });

  it("recognises a direct connection", () => {
    expect(describeConnectionString(direct).pooled).toBe(false);
  });

  it("accepts the postgres:// scheme and reports a missing sslmode", () => {
    const summary = describeConnectionString("postgres://u:p@localhost:5432/app");
    expect(summary.sslmode).toBe("not set");
    expect(summary.database).toBe("app");
  });

  it.each([
    [undefined, "is not set"],
    ["   ", "is not set"],
    ["not a url", "is not a valid URL"],
    ["mysql://u:p@host/db", "must start with postgresql://"],
    ["postgresql://u:p@host/", "must include a host and a database name"],
  ])("rejects %j with a message that never contains the value", (value, message) => {
    let error: unknown;
    try {
      describeConnectionString(value);
    } catch (caught) {
      error = caught;
    }
    expect(String(error)).toContain(message);
    if (value?.trim()) expect(String(error)).not.toContain(value);
  });
});

describe("redactSecrets", () => {
  it("removes the whole connection string and the bare password", () => {
    const text = `connect failed for ${pooled}; password s3cr3t-Pa55 rejected`;
    const redacted = redactSecrets(text, pooled);
    expect(redacted).not.toContain("s3cr3t-Pa55");
    expect(redacted).not.toContain("app_user:");
    expect(redacted).toContain("postgresql://***");
  });

  it("removes any connection string, even without being told which one", () => {
    expect(redactSecrets(`error at ${direct}`)).toBe("error at postgresql://***");
  });

  it("doesn't mangle text when the password is a single character", () => {
    expect(redactSecrets("must start with postgresql://", "mysql://u:p@host/db")).toBe(
      "must start with postgresql://",
    );
  });

  it("leaves ordinary text alone", () => {
    expect(redactSecrets("relation does not exist", pooled)).toBe("relation does not exist");
  });
});
