import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { users } from "$lib/server/db/schema";
declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient | null;
      user: User | null;
      profile: typeof users.$inferSelect | null;
    }
  }
}
export {};
