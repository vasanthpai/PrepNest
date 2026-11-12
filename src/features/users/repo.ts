import { eq, sql } from "drizzle-orm";
import type { Database } from "@/lib/db/client";
import { type User, users } from "@/features/users/schema";

export interface ClerkUserFields {
  clerkUserId: string;
  email: string;
  name?: string | null;
  imageUrl?: string | null;
}

/**
 * Create the user, or update them if they exist. Used on first sign-in and by the webhook, which
 * may both arrive for the same person in any order; the unique Clerk id makes that safe.
 */
export async function upsertUserFromClerk(db: Database, fields: ClerkUserFields): Promise<User> {
  const values = {
    clerkUserId: fields.clerkUserId,
    email: fields.email,
    name: fields.name ?? null,
    imageUrl: fields.imageUrl ?? null,
  };
  const [user] = await db
    .insert(users)
    .values(values)
    .onConflictDoUpdate({
      target: users.clerkUserId,
      set: {
        email: values.email,
        name: values.name,
        imageUrl: values.imageUrl,
        updatedAt: sql`now()`,
      },
    })
    .returning();
  if (!user) throw new Error("Upsert returned no row");
  return user;
}

export async function findUserByClerkId(
  db: Database,
  clerkUserId: string,
): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId)).limit(1);
  return user;
}

/** Delete the user. Returns false if there was nobody to delete (a repeated delete is fine). */
export async function deleteUserByClerkId(db: Database, clerkUserId: string): Promise<boolean> {
  const deleted = await db
    .delete(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .returning({ id: users.id });
  return deleted.length > 0;
}
