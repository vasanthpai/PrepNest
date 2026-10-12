import type { AppEnv } from "@/config/app-env";

/**
 * Google Search Console ownership file for the production URL-prefix property
 * (https://prepnest-production.prepnest.workers.dev/). Google fetches /<file> and expects exactly
 * the line below. Keep it forever: removing it un-verifies the property.
 */
export const GOOGLE_VERIFICATION_FILE = "googlef33373e4667df5d9.html";

export interface VerificationResponse {
  status: 200 | 404;
  body: string;
}

/**
 * Only production answers. Staging and previews return 404 so they never claim ownership of the
 * production property.
 */
export function googleVerification(env: AppEnv): VerificationResponse {
  if (env !== "production") return { status: 404, body: "Not found" };
  return { status: 200, body: `google-site-verification: ${GOOGLE_VERIFICATION_FILE}` };
}
