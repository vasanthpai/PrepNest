import { beforeEach, describe, expect, it } from "vitest";
import { markWebhookEventProcessed, recordWebhookEvent } from "@/features/webhooks/repo";
import type { Database } from "@/lib/db/client";
import { createTestDb } from "@/lib/db/testing";

let db: Database;
const event = { source: "clerk", id: "msg_1", type: "user.created" };

beforeEach(async () => {
  db = await createTestDb();
});

describe("recordWebhookEvent", () => {
  it("treats a new event as not yet processed", async () => {
    expect(await recordWebhookEvent(db, event)).toEqual({ alreadyProcessed: false });
  });

  it("reports a processed event as already processed when it arrives again", async () => {
    await recordWebhookEvent(db, event);
    await markWebhookEventProcessed(db, event);
    expect(await recordWebhookEvent(db, event)).toEqual({ alreadyProcessed: true });
  });

  it("lets a retry run again when the first attempt failed before finishing", async () => {
    await recordWebhookEvent(db, event); // first attempt crashed: never marked processed
    expect(await recordWebhookEvent(db, event)).toEqual({ alreadyProcessed: false });
  });

  it("keeps the same id from different sources apart", async () => {
    await recordWebhookEvent(db, event);
    await markWebhookEventProcessed(db, event);
    const other = { ...event, source: "razorpay" };
    expect(await recordWebhookEvent(db, other)).toEqual({ alreadyProcessed: false });
  });
});
