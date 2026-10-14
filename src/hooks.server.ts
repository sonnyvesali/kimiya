import type { Handle } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import { createSupabaseServerClient } from "$lib/supabase/server";
import { ensureProfile } from "$lib/server/profiles/repositories/profiles";
import { safeNext } from "$lib/server/auth/form/redirect";
export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createSupabaseServerClient(event.cookies);
  event.locals.user = null;
  event.locals.profile = null;
  if (event.locals.supabase) {
    const {
      data: { user },
    } = await event.locals.supabase.auth.getUser();
    event.locals.user = user;
    if (user) event.locals.profile = await ensureProfile(user);
  }
  const path = event.url.pathname;
  const publicRoute = path === "/signin" || path.startsWith("/auth/");
  const next = safeNext(path + event.url.search);
  if (!publicRoute && !event.locals.user)
    redirect(303, `/signin?next=${encodeURIComponent(next)}`);
  if (
    !publicRoute &&
    path !== "/onboarding" &&
    !event.locals.profile?.metadata.role
  )
    redirect(303, `/onboarding?next=${encodeURIComponent(next)}`);
  event.setHeaders({
    "referrer-policy": "no-referrer",
    "cache-control": "private, no-store",
  });
  return resolve(event, {
    filterSerializedResponseHeaders: (name) =>
      name === "content-range" || name === "x-supabase-api-version",
  });
};
