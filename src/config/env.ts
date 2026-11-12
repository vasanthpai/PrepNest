import { z } from "zod";
import { APP_ENVS } from "@/config/app-env";

/**
 * Every environment variable and secret the app reads, validated with zod.
 * Add new ones here first, then document them in docs/environments.md.
 *
 * Non-secret values: wrangler.jsonc "vars".
 * Secrets: .dev.vars locally, `wrangler secret put` for staging/production.
 */
export const envSchema = z.object({
  APP_ENV: z.enum(APP_ENVS),

  /**
   * Neon Postgres, pooled (docs/environments.md#database-neon). Optional here because Worker
   * secrets exist only at runtime, not while CI builds the site. Deployed environments must have
   * it: /api/health reports "degraded" without it, and the smoke test fails the deploy.
   */
  DATABASE_URL: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z
      .string()
      .regex(/^postgres(ql)?:\/\//, "must be a postgresql:// connection string")
      .optional(),
  ),

  /** Clerk application for this environment. Public: wrangler.jsonc vars (ADR 0013). */
  PUBLIC_CLERK_PUBLISHABLE_KEY: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z
      .string()
      .regex(/^pk_(test|live)_/, "must be a Clerk publishable key (pk_…)")
      .optional(),
  ),

  /**
   * Clerk secret key: .dev.vars locally, Worker secret when deployed. Optional for the same
   * reason as DATABASE_URL; without it, sign-in answers 503 instead of crashing.
   */
  CLERK_SECRET_KEY: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z
      .string()
      .regex(/^sk_(test|live)_/, "must be a Clerk secret key (sk_…)")
      .optional(),
  ),

  // v0.3: CLERK_WEBHOOK_SIGNING_SECRET
  // v0.4: RESEND_API_KEY, EMAIL_FROM, TURNSTILE_SECRET_KEY
  // v0.8: RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
});

export type AppConfig = z.infer<typeof envSchema>;

/**
 * Validate raw env (e.g. the Cloudflare `env` object). Unknown keys such as bindings are dropped.
 * On failure, throws one error listing every problem by variable NAME. Values are never
 * included, so secrets can't leak into logs.
 */
export function parseEnv(raw: unknown): AppConfig {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.map(String).join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment configuration:\n${problems}\n` +
        "Check wrangler.jsonc vars and .dev.vars (see .dev.vars.example and docs/environments.md).",
    );
  }
  return result.data;
}
