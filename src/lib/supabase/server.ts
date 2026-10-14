import { env } from "$env/dynamic/public";
import { dev } from "$app/environment";
import { createServerClient } from "@supabase/ssr";
import type { Cookies } from "@sveltejs/kit";
export function createSupabaseServerClient(cookies: Cookies) {
  if (!env.PUBLIC_SUPABASE_URL || !env.PUBLIC_SUPABASE_ANON_KEY) return null;
  return createServerClient(
    env.PUBLIC_SUPABASE_URL,
    env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookieOptions: {
        path: "/",
        sameSite: "lax",
        secure: !dev,
        maxAge: 400 * 24 * 60 * 60,
      },
      cookies: {
        getAll: () => cookies.getAll(),
        setAll: (values) => {
          for (const { name, value, options } of values)
            cookies.set(name, value, { ...options, path: "/" });
        },
      },
    },
  );
}
