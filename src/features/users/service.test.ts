import { describe, expect, it } from "vitest";
import { findUserByClerkId } from "@/features/users/repo";
import { type ClerkUserLike, ensureUser, userFieldsFromClerk } from "@/features/users/service";
import { createTestDb } from "@/lib/db/testing";

function clerkUser(overrides: Partial<ClerkUserLike> = {}): ClerkUserLike {
  return {
    id: "user_123",
    primaryEmailAddressId: "email_2",
    emailAddresses: [
      { id: "email_1", emailAddress: "old@example.com" },
      { id: "email_2", emailAddress: "asha@example.com" },
    ],
    firstName: "Asha",
    lastName: "Rao",
    imageUrl: "https://img.clerk.com/asha.png",
    ...overrides,
  };
}

describe("userFieldsFromClerk", () => {
  it("uses the primary email and joins the name", () => {
    expect(userFieldsFromClerk(clerkUser())).toEqual({
      clerkUserId: "user_123",
      email: "asha@example.com",
      name: "Asha Rao",
      imageUrl: "https://img.clerk.com/asha.png",
    });
  });

  it("falls back to the first email when no primary is set", () => {
    const fields = userFieldsFromClerk(clerkUser({ primaryEmailAddressId: null }));
    expect(fields.email).toBe("old@example.com");
  });

  it("stores no name when Clerk has none, and copes with only a first name", () => {
    expect(userFieldsFromClerk(clerkUser({ firstName: null, lastName: null })).name).toBeNull();
    expect(userFieldsFromClerk(clerkUser({ lastName: null })).name).toBe("Asha");
  });

  it("refuses a user without any email", () => {
    expect(() => userFieldsFromClerk(clerkUser({ emailAddresses: [] }))).toThrow(/no email/);
  });
});

describe("ensureUser", () => {
  it("creates the row on first visit and updates it on the next", async () => {
    const db = await createTestDb();
    const first = await ensureUser(db, clerkUser());
    const second = await ensureUser(db, clerkUser({ firstName: "Asha M" }));
    expect(second.id).toBe(first.id);
    expect((await findUserByClerkId(db, "user_123"))?.name).toBe("Asha M Rao");
  });
});
