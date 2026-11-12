/// <reference types="node" />
/**
 * Checks that DATABASE_URL reaches a working Postgres database, without ever printing it.
 *
 *   npm run db:ping                     # uses DATABASE_URL from .dev.vars (the dev branch)
 *
 * To check another branch, set DATABASE_URL in the shell first (it wins over .dev.vars), typing
 * the value at a hidden prompt so it stays out of your shell history:
 *
 *   read -rs DATABASE_URL && export DATABASE_URL && npm run db:ping; unset DATABASE_URL
 *
 * Exits 1 if the variable is missing or invalid, or the database doesn't answer.
 */
import { neon } from "@neondatabase/serverless";
import { describeConnectionString, redactSecrets } from "../src/lib/db/connection-string.ts";

const connectionString = process.env["DATABASE_URL"];

function fail(message: string): never {
  console.error(`✗ ${redactSecrets(message, connectionString)}`);
  process.exit(1);
}

let summary;
try {
  summary = describeConnectionString(connectionString);
} catch (error) {
  fail(
    `${error instanceof Error ? error.message : String(error)}\n` +
      "  Locally: add DATABASE_URL to .dev.vars (see .dev.vars.example and docs/environments.md).",
  );
}

console.log(`Database  ${summary.database} on ${summary.host}`);
console.log(
  `Settings  ${summary.pooled ? "pooled" : "direct"}, user ${summary.user}, sslmode ${summary.sslmode}`,
);
if (summary.sslmode !== "require" && summary.sslmode !== "verify-full") {
  console.warn("Warning   sslmode should be require or verify-full for a hosted database");
}

const sql = neon(connectionString ?? "");

async function timed(): Promise<{ ms: number; row: Record<string, unknown> | undefined }> {
  const started = performance.now();
  const rows = await sql`select version() as version, current_database() as database, now() as now`;
  return { ms: Math.round(performance.now() - started), row: rows[0] };
}

try {
  // The first query may wake a suspended database (Neon scales idle compute to zero).
  const first = await timed();
  const second = await timed();
  const version = String(first.row?.["version"] ?? "unknown").split(" on ")[0];
  console.log(`Server    ${version}`);
  console.log(`Latency   first query ${first.ms} ms, second ${second.ms} ms`);
  console.log("✓ Database reachable");
} catch (error) {
  fail(`Query failed: ${error instanceof Error ? error.message : String(error)}`);
}
