/**
 * Every table, in one place: what `createDb` knows about and what drizzle-kit reads to generate
 * migrations. Relative imports on purpose: drizzle-kit loads this file without the "@/" alias.
 *
 * Adding a table: define it in its feature's schema.ts, export it here, run `npm run db:generate`.
 */
export * from "../../features/users/schema";
export * from "../../features/webhooks/schema";
