/**
 * Where the app is running. Set per environment as the `APP_ENV` var in wrangler.jsonc.
 */
export const APP_ENVS = ["local", "staging", "production"] as const;

export type AppEnv = (typeof APP_ENVS)[number];

export function isAppEnv(value: unknown): value is AppEnv {
  return typeof value === "string" && (APP_ENVS as readonly string[]).includes(value);
}

/** Validate an unknown value (e.g. from env vars) as an AppEnv, or throw a clear error. */
export function parseAppEnv(value: unknown): AppEnv {
  if (!isAppEnv(value)) {
    throw new Error(
      `Invalid APP_ENV: "${String(value)}". Expected one of: ${APP_ENVS.join(", ")}.`,
    );
  }
  return value;
}
