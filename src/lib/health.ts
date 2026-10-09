import type { AppEnv } from "@/config/app-env";

export interface HealthReport {
  status: "ok";
  env: AppEnv;
  version: string;
  /** ISO 8601 time the report was generated (proves the response isn't cached). */
  time: string;
}

/**
 * Body of GET /api/health, used by deploy smoke tests and uptime monitoring.
 * Never include secrets or internal details here: the endpoint is public.
 */
export function buildHealth(input: { env: AppEnv; version: string; now: Date }): HealthReport {
  return {
    status: "ok",
    env: input.env,
    version: input.version,
    time: input.now.toISOString(),
  };
}
