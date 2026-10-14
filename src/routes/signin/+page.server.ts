import { fail, redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/public";
import { dev } from "$app/environment";
import { safeNext } from "$lib/server/auth/form/redirect";
import { parseSignin } from "$lib/server/auth/form/signin";
import { postAuthDestination } from "$lib/server/auth/workflows/session";
import { requestEmailLink } from "$lib/server/auth/workflows/request-email-link";
import { AuthActionError } from "$lib/server/auth/types/auth-error";
import type { PageServerLoad, Actions } from "./$types";
export const load: PageServerLoad = async ({ locals, url }) => {
  const next = safeNext(url.searchParams.get("next"));
  if (locals.user) redirect(303, await postAuthDestination(locals, next));
  return {
    next,
    configured: !!locals.supabase,
    mode: url.searchParams.get("mode") === "signup" ? "signup" : "signin",
    authError: url.searchParams.has("error"),
    localInbox: dev && isLocalSupabase(),
  };
};
function isLocalSupabase() {
  try {
    return ["localhost", "127.0.0.1", "[::1]"].includes(
      new URL(env.PUBLIC_SUPABASE_URL || "").hostname,
    );
  } catch {
    return false;
  }
}
export const actions: Actions = {
  default: async ({ locals, request, url }) => {
    if (!locals.supabase)
      return fail(503, {
        message: "Set up Kimiya’s Supabase configuration to enable sign-in.",
        sent: false,
        suggestSignup: false,
      });
    let input;
    try {
      input = parseSignin(await request.formData());
    } catch (err) {
      return fail(400, {
        message: err instanceof Error ? err.message : "Check your details.",
        sent: false,
        suggestSignup: false,
      });
    }
    try {
      await requestEmailLink({
        supabase: locals.supabase,
        form: input,
        origin: url.origin,
        next: safeNext(url.searchParams.get("next")),
        local: dev,
      });
    } catch (err) {
      if (err instanceof AuthActionError)
        return fail(err.status, {
          message: err.message,
          sent: false,
          suggestSignup: err.suggestSignup,
          email: input.email,
          fullName: input.fullName,
        });
      throw err;
    }
    return {
      message: "Check your email for a secure sign-in link.",
      sent: true,
      suggestSignup: false,
      email: input.email,
      fullName: input.fullName,
    };
  },
};
