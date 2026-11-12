/// <reference types="node" />
import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// Locally, DATABASE_URL comes from .dev.vars (the Neon dev branch). In CI it's set by the workflow.
if (!process.env["DATABASE_URL"] && existsSync(".dev.vars")) process.loadEnvFile(".dev.vars");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  // Generated SQL migrations: committed, reviewed in pull requests, never edited after merging.
  out: "./drizzle",
  dbCredentials: { url: process.env["DATABASE_URL"] ?? "" },
  strict: true,
  verbose: true,
});
