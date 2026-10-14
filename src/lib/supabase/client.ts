import { env } from "$env/dynamic/public";
import { createBrowserClient } from "@supabase/ssr";
export function createSupabaseBrowserClient() {
  if (!env.PUBLIC_SUPABASE_URL || !env.PUBLIC_SUPABASE_ANON_KEY)
    throw new Error("Authentication is not configured.");
  return createBrowserClient(
    env.PUBLIC_SUPABASE_URL,
    env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookieOptions: {
        path: "/",
        sameSite: "lax",
        secure: location.protocol === "https:",
        maxAge: 400 * 24 * 60 * 60,
      },
    },
  );
}
