import { neon } from "@neondatabase/serverless";
import { redactSecrets } from "@/lib/db/connection-string";
import type { DatabaseStatus } from "@/lib/health";

/** Long enough for Neon to wake an idle database (~1–2 s), short enough to keep health fast. */
const DEFAULT_TIMEOUT_MS = 8000;

export interface CheckOptions {
  timeoutMs?: number;
  /** Runs the probe query. Replaced in tests; the default asks Postgres for `select 1`. */
  query?: (connectionString: string) => Promise<unknown>;
}

const selectOne = (connectionString: string) => neon(connectionString)`select 1`;

/**
 * Can the app reach its database right now? Never throws: a failure becomes "unreachable",
 * and the reason is logged with secrets removed (Workers logs, not the public response).
 */
export async function checkDatabase(
  connectionString: string | undefined,
  options: CheckOptions = {},
): Promise<DatabaseStatus> {
  if (!connectionString) return "not-configured";
  const { timeoutMs = DEFAULT_TIMEOUT_MS, query = selectOne } = options;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timed out after ${timeoutMs} ms`)), timeoutMs);
  });
  try {
    await Promise.race([query(connectionString), timeout]);
    return "ok";
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`Database check failed: ${redactSecrets(reason, connectionString)}`);
    return "unreachable";
  } finally {
    clearTimeout(timer);
  }
}
