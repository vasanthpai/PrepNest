import { describe, expect, it } from "vitest";
import { APP_ENVS, isAppEnv, parseAppEnv } from "@/config/app-env";

describe("isAppEnv", () => {
  it.each(APP_ENVS)("accepts %s", (env) => {
    expect(isAppEnv(env)).toBe(true);
  });

  it.each(["", "prod", "Production", undefined, null, 1])("rejects %s", (value) => {
    expect(isAppEnv(value)).toBe(false);
  });
});

describe("parseAppEnv", () => {
  it("returns a valid environment unchanged", () => {
    expect(parseAppEnv("staging")).toBe("staging");
  });

  it("throws a message listing the allowed values", () => {
    expect(() => parseAppEnv("prod")).toThrow(/local, staging, production/);
  });
});
