import type { AppEnv } from "@/config/app-env";

/**
 * - `ok`: the database answered.
 * - `unreachable`: configured, but the check failed or timed out.
 * - `not-configured`: no DATABASE_URL. Normal in a local build without .dev.vars; a problem
 *   anywhere that is deployed.
 */
export type DatabaseStatus = "ok" | "unreachable" | "not-configured";

export interface HealthReport {
  /** `degraded` when a deployed environment can't use its database. */
  status: "ok" | "degraded";
  env: AppEnv;
  version: string;
  database: DatabaseStatus;
  /** ISO 8601 time the report was generated (proves the response isn't cached). */
  time: string;
}

/**
 * Body of GET /api/health, used by deploy smoke tests and uptime monitoring.
 * Never include secrets or internal details here: the endpoint is public.
 */
export function buildHealth(input: {
  env: AppEnv;
  version: string;
  now: Date;
  database: DatabaseStatus;
}): HealthReport {
  const databaseRequired = input.env !== "local";
  const healthy =
    input.database === "ok" || (!databaseRequired && input.database === "not-configured");
  return {
    status: healthy ? "ok" : "degraded",
    env: input.env,
    version: input.version,
    database: input.database,
    time: input.now.toISOString(),
  };
}

/** 503 tells uptime monitors and load balancers the app can't do its job right now. */
export function healthHttpStatus(report: HealthReport): 200 | 503 {
  return report.status === "ok" ? 200 : 503;
}
