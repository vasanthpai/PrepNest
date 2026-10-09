import { describe, expect, it } from "vitest";
import { APP_ENVS } from "@/config/app-env";
import {
  enabledFeatures,
  FEATURE_FLAGS,
  type FlagTable,
  findPromotionViolations,
  isFeatureEnabled,
} from "@/config/features";

describe("FEATURE_FLAGS", () => {
  it("never enables a flag in production unless it is enabled in staging", () => {
    expect(findPromotionViolations(FEATURE_FLAGS)).toEqual([]);
  });

  it("defines every environment for every flag", () => {
    for (const envs of Object.values(FEATURE_FLAGS)) {
      expect(Object.keys(envs).sort()).toEqual([...APP_ENVS].sort());
    }
  });

  it("is a compile-time error to leave out an environment", () => {
    // @ts-expect-error: `production` is missing, so this must not type-check
    const table: FlagTable = { demo: { local: true, staging: true } };
    expect(table).toBeDefined();
  });
});

describe("findPromotionViolations", () => {
  it("flags features that skip staging", () => {
    const table: FlagTable = {
      ok: { local: true, staging: true, production: true },
      skippedStaging: { local: true, staging: false, production: true },
      localOnly: { local: true, staging: false, production: false },
    };
    expect(findPromotionViolations(table)).toEqual(["skippedStaging"]);
  });
});

describe("isFeatureEnabled / enabledFeatures", () => {
  it("agree with the flag table for every environment", () => {
    for (const env of APP_ENVS) {
      const expected = Object.entries(FEATURE_FLAGS)
        .filter(([, envs]) => envs[env])
        .map(([flag]) => flag);
      expect(enabledFeatures(env)).toEqual(expected);
      for (const flag of Object.keys(FEATURE_FLAGS) as (keyof typeof FEATURE_FLAGS)[]) {
        expect(isFeatureEnabled(flag, env)).toBe(FEATURE_FLAGS[flag][env]);
      }
    }
  });
});
