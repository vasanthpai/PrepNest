import type { Database } from "@/lib/db/client";
import { type ClerkUserFields, upsertUserFromClerk } from "@/features/users/repo";
import type { User } from "@/features/users/schema";

/** The parts of a Clerk user we use (a subset of `@clerk/backend`'s User). */
export interface ClerkUserLike {
  id: string;
  primaryEmailAddressId: string | null;
  emailAddresses: readonly { id: string; emailAddress: string }[];
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
}

/**
 * Map a Clerk user to our columns. Uses the primary email, falling back to the first one;
 * a user with no email at all is an error (we only allow email and Google sign-in).
 */
export function userFieldsFromClerk(clerkUser: ClerkUserLike): ClerkUserFields {
  const primary = clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId);
  const email = (primary ?? clerkUser.emailAddresses[0])?.emailAddress;
  if (!email) throw new Error(`Clerk user ${clerkUser.id} has no email address`);
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim();
  return {
    clerkUserId: clerkUser.id,
    email,
    name: name || null,
    imageUrl: clerkUser.imageUrl || null,
  };
}

/**
 * Make sure the signed-in person has a row in `users`, with current details. Called on every
 * dashboard visit, so the app works even if the Clerk webhook (step 7) is late or missed.
 */
export async function ensureUser(db: Database, clerkUser: ClerkUserLike): Promise<User> {
  return upsertUserFromClerk(db, userFieldsFromClerk(clerkUser));
}
