import { type Database, createDb } from "@/lib/db/client";
import { getConfig } from "@/lib/runtime-env";

let cached: Database | undefined;

/** The database for this environment, from DATABASE_URL. Server code only. */
export function getDb(): Database {
  const url = getConfig().DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured for this environment");
  cached ??= createDb(url);
  return cached;
}
