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

  // v0.3: DATABASE_URL, CLERK_SECRET_KEY, CLERK_WEBHOOK_SIGNING_SECRET
  // v0.4: RESEND_API_KEY, EMAIL_FROM, TURNSTILE_SECRET_KEY
  // v0.6: RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
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
