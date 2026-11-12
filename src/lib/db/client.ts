import { neon } from "@neondatabase/serverless";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/lib/db/schema";

/**
 * Any Drizzle database with our schema: Neon over HTTP in the app, PGlite in tests.
 * Repositories take this type, so the same queries run in both.
 */
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

/** A database client for one connection string. Cheap to create: each query is one HTTP request. */
export function createDb(connectionString: string): Database {
  return drizzle({ client: neon(connectionString), schema });
}
