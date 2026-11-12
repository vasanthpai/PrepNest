import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * People who signed in. Clerk owns the account (passwords, Google sign-in, sessions); this table
 * keeps our own copy of who they are, so the rest of the app can join on a local id.
 *
 * Rows are created on first sign-in and kept in sync by the Clerk webhook (v0.3 steps 6 and 7).
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
