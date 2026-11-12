import { and, eq, sql } from "drizzle-orm";
import type { Database } from "@/lib/db/client";
import { webhookEvents } from "@/features/webhooks/schema";

export interface WebhookEventKey {
  source: string;
  id: string;
}

/**
 * Record that an event arrived and say whether it was already handled.
 *
 * Senders retry, and may deliver the same event twice. The caller skips the work when
 * `alreadyProcessed` is true, otherwise does it and then calls `markWebhookEventProcessed`.
 * An event that failed halfway stays unprocessed, so the sender's retry runs it again.
 */
export async function recordWebhookEvent(
  db: Database,
  event: WebhookEventKey & { type: string },
): Promise<{ alreadyProcessed: boolean }> {
  await db.insert(webhookEvents).values(event).onConflictDoNothing();
  const [row] = await db
    .select({ processedAt: webhookEvents.processedAt })
    .from(webhookEvents)
    .where(and(eq(webhookEvents.source, event.source), eq(webhookEvents.id, event.id)))
    .limit(1);
  return { alreadyProcessed: row?.processedAt != null };
}

export async function markWebhookEventProcessed(db: Database, key: WebhookEventKey): Promise<void> {
  await db
    .update(webhookEvents)
    .set({ processedAt: sql`now()` })
    .where(and(eq(webhookEvents.source, key.source), eq(webhookEvents.id, key.id)));
}
