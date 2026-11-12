import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Every webhook we've received, so each one is processed once even when the sender retries.
 * `id` is the sender's message id (for Clerk, the `svix-id` header), unique per source.
 */
export const webhookEvents = pgTable(
  "webhook_events",
  {
    source: text("source").notNull(),
    id: text("id").notNull(),
    type: text("type").notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
    /** Set once the event was handled successfully. Null means "received, not finished". */
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (table) => [primaryKey({ columns: [table.source, table.id] })],
);
