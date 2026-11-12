import { afterEach, describe, expect, it, vi } from "vitest";
import { checkDatabase } from "@/lib/db/check";

const url = "postgresql://app:s3cr3t-Pa55@ep-x-pooler.example.neon.tech/neondb?sslmode=require";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("checkDatabase", () => {
  it("is not-configured without a connection string, and runs no query", async () => {
    const query = vi.fn();
    expect(await checkDatabase(undefined, { query })).toBe("not-configured");
    expect(query).not.toHaveBeenCalled();
  });

  it("is ok when the query succeeds", async () => {
    const query = vi.fn().mockResolvedValue([{ "?column?": 1 }]);
    expect(await checkDatabase(url, { query })).toBe("ok");
    expect(query).toHaveBeenCalledWith(url);
  });

  it("is unreachable when the query fails, and logs the reason without secrets", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const query = vi.fn().mockRejectedValue(new Error(`could not connect to ${url}`));
    expect(await checkDatabase(url, { query })).toBe("unreachable");
    const logged = String(log.mock.calls[0]?.[0]);
    expect(logged).toContain("Database check failed");
    expect(logged).not.toContain("s3cr3t-Pa55");
  });

  it("is unreachable when the database doesn't answer in time", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const query = () => new Promise(() => undefined); // never settles
    expect(await checkDatabase(url, { query, timeoutMs: 20 })).toBe("unreachable");
  });
});
