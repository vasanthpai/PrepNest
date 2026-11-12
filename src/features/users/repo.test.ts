import { beforeEach, describe, expect, it } from "vitest";
import { deleteUserByClerkId, findUserByClerkId, upsertUserFromClerk } from "@/features/users/repo";
import type { Database } from "@/lib/db/client";
import { createTestDb } from "@/lib/db/testing";

let db: Database;

beforeEach(async () => {
  db = await createTestDb();
});

describe("upsertUserFromClerk", () => {
  it("creates a user with a generated id and timestamps", async () => {
    const user = await upsertUserFromClerk(db, {
      clerkUserId: "user_123",
      email: "asha@example.com",
      name: "Asha",
    });
    expect(user.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(user).toMatchObject({
      clerkUserId: "user_123",
      email: "asha@example.com",
      name: "Asha",
    });
    expect(user.imageUrl).toBeNull();
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  it("updates the same row when the person signs in again with new details", async () => {
    const first = await upsertUserFromClerk(db, {
      clerkUserId: "user_123",
      email: "old@example.com",
    });
    const second = await upsertUserFromClerk(db, {
      clerkUserId: "user_123",
      email: "new@example.com",
      imageUrl: "https://img.example.com/a.png",
    });
    expect(second.id).toBe(first.id);
    expect(second.email).toBe("new@example.com");
    expect(second.imageUrl).toBe("https://img.example.com/a.png");
    expect(second.updatedAt.getTime()).toBeGreaterThanOrEqual(first.updatedAt.getTime());
  });

  it("keeps different people apart", async () => {
    await upsertUserFromClerk(db, { clerkUserId: "user_a", email: "a@example.com" });
    await upsertUserFromClerk(db, { clerkUserId: "user_b", email: "b@example.com" });
    expect((await findUserByClerkId(db, "user_a"))?.email).toBe("a@example.com");
    expect((await findUserByClerkId(db, "user_b"))?.email).toBe("b@example.com");
  });
});

describe("findUserByClerkId", () => {
  it("returns undefined for someone who never signed in", async () => {
    expect(await findUserByClerkId(db, "user_missing")).toBeUndefined();
  });
});

describe("deleteUserByClerkId", () => {
  it("deletes the user, and a repeated delete is harmless", async () => {
    await upsertUserFromClerk(db, { clerkUserId: "user_123", email: "asha@example.com" });
    expect(await deleteUserByClerkId(db, "user_123")).toBe(true);
    expect(await findUserByClerkId(db, "user_123")).toBeUndefined();
    expect(await deleteUserByClerkId(db, "user_123")).toBe(false);
  });
});
