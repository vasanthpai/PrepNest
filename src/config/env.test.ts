import { describe, expect, it } from "vitest";
import { parseEnv } from "@/config/env";

describe("parseEnv", () => {
  it("accepts a valid environment", () => {
    expect(parseEnv({ APP_ENV: "staging" })).toEqual({ APP_ENV: "staging" });
  });

  it("drops unknown keys such as Cloudflare bindings", () => {
    const config = parseEnv({ APP_ENV: "local", ASSETS: { fetch: () => null } });
    expect(config).toEqual({ APP_ENV: "local" });
  });

  it("names the missing variable", () => {
    expect(() => parseEnv({})).toThrow(/APP_ENV/);
  });

  it("rejects an unknown environment name", () => {
    expect(() => parseEnv({ APP_ENV: "prod" })).toThrow(/Invalid environment configuration/);
  });

  it("never includes the received value in the error (secrets must not leak)", () => {
    const secretLooking = "sk_live_DO_NOT_LOG_ME";
    try {
      parseEnv({ APP_ENV: secretLooking });
      expect.unreachable("parseEnv should have thrown");
    } catch (error) {
      expect(String(error)).not.toContain(secretLooking);
    }
  });

  it("throws when env is not an object", () => {
    expect(() => parseEnv(undefined)).toThrow(/Invalid environment configuration/);
  });
});
