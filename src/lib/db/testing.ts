import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import type { Database } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";

/**
 * A fresh, empty Postgres database for one test: PGlite (Postgres compiled to WebAssembly)
 * in memory, with the real migrations from drizzle/ applied. No server, no secrets, so CI and
 * every machine run the same tests. Tests only; never imported by app code.
 */
export async function createTestDb(): Promise<Database> {
  const db = drizzle({ client: new PGlite(), schema });
  await migrate(db, { migrationsFolder: "drizzle" });
  return db;
}
