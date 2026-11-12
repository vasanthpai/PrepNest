/// <reference types="node" />
/**
 * Applies the SQL migrations in drizzle/ to the database in DATABASE_URL. Safe to run again:
 * migrations already applied (recorded in drizzle.__drizzle_migrations) are skipped.
 *
 *   npm run db:migrate          # locally: the dev branch, from .dev.vars
 *
 * The deploy workflows run it against staging and production before the new code goes live
 * (v0.3 step 4). Never prints the connection string.
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
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
  fail(error instanceof Error ? error.message : String(error));
}
console.log(`Migrating ${summary.database} on ${summary.host}`);

const sql = neon(connectionString ?? "");

async function appliedCount(): Promise<number> {
  // Two queries: Postgres resolves every table name before running a query, so a single
  // "count if the table exists" query fails until the first migration has created it.
  const [table] = await sql`select to_regclass('drizzle.__drizzle_migrations') is not null as ok`;
  if (!table?.["ok"]) return 0;
  const [row] = await sql`select count(*) as count from drizzle.__drizzle_migrations`;
  return Number(row?.["count"] ?? 0);
}

try {
  const before = await appliedCount();
  await migrate(drizzle({ client: sql }), { migrationsFolder: "drizzle" });
  const after = await appliedCount();
  console.log(`Applied   ${after - before} new migration(s); ${after} in total`);
  console.log("✓ Database is up to date");
} catch (error) {
  fail(`Migration failed: ${error instanceof Error ? error.message : String(error)}`);
}
