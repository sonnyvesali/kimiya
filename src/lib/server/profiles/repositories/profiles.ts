import { eq, sql } from "drizzle-orm";
import type { User } from "@supabase/supabase-js";
import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import type { AccountRole } from "../types/profile";
export async function ensureProfile(user: User) {
  const name = user.user_metadata?.full_name;
  await db
    .insert(users)
    .values({
      id: user.id,
      fullName:
        typeof name === "string" && name.trim()
          ? name.trim().slice(0, 120)
          : user.email?.split("@")[0] || "User",
    })
    .onConflictDoNothing();
  const [profile] = await db.select().from(users).where(eq(users.id, user.id));
  return profile;
}
export async function chooseRole(userId: string, role: AccountRole) {
  const [profile] = await db
    .update(users)
    .set({
      metadata: sql`${users.metadata} || ${JSON.stringify({ role })}::jsonb`,
      updatedAt: new Date(),
    })
    .where(sql`${users.id} = ${userId} AND NOT (${users.metadata} ? 'role')`)
    .returning();
  return profile;
}
