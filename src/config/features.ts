import type { AppEnv } from "@/config/app-env";

/**
 * Feature flags: deploying code and releasing a feature are separate steps.
 *
 * Release flow for a new feature:
 *   1. Merge the code with the flag off everywhere (safe to deploy at any time).
 *   2. Turn it on for `local` while building it, then `staging` to test on the staging URL.
 *   3. Turn it on for `production` in a release. Rollback = set it back to false.
 *
 * Rule (enforced by tests): a flag is never on in production unless it is also on in staging.
 */
export type FlagTable = Record<string, Record<AppEnv, boolean>>;

export const FEATURE_FLAGS = {
  blog: { local: true, staging: false, production: false }, // v0.2: in development
  auth: { local: false, staging: false, production: false }, // v0.3
  newsletter: { local: false, staging: false, production: false }, // v0.4
  quizzes: { local: false, staging: false, production: false }, // v0.5
  payments: { local: false, staging: false, production: false }, // v0.6
  courses: { local: false, staging: false, production: false }, // v0.7
} as const satisfies FlagTable;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export function isFeatureEnabled(flag: FeatureFlag, env: AppEnv): boolean {
  return FEATURE_FLAGS[flag][env];
}

export function enabledFeatures(env: AppEnv): FeatureFlag[] {
  return (Object.keys(FEATURE_FLAGS) as FeatureFlag[]).filter((flag) => FEATURE_FLAGS[flag][env]);
}

/**
 * Returns the flags that break the promotion rule (on in production, off in staging).
 * An empty array means the table is valid.
 */
export function findPromotionViolations(table: FlagTable): string[] {
  return Object.entries(table)
    .filter(([, envs]) => envs.production && !envs.staging)
    .map(([flag]) => flag);
}
