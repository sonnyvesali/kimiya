import { fail, redirect } from "@sveltejs/kit";
import { safeNext } from "$lib/server/auth/form/redirect";
import { parseSignin } from "$lib/server/auth/form/signin";
import { postAuthDestination } from "$lib/server/auth/workflows/session";
import type { PageServerLoad, Actions } from "./$types";
export const load: PageServerLoad = async ({ locals, url }) => {
  const next = safeNext(url.searchParams.get("next"));
  if (locals.user) redirect(303, await postAuthDestination(locals, next));
  return {
    next,
    configured: !!locals.supabase,
    mode: url.searchParams.get("mode") === "signup" ? "signup" : "signin",
    authError: url.searchParams.has("error"),
  };
};
export const actions: Actions = {
  default: async ({ locals, request, url }) => {
    if (!locals.supabase)
      return fail(503, {
        message: "Set up Kimiya’s Supabase configuration to enable sign-in.",
      });
    let input;
    try {
      input = parseSignin(await request.formData());
    } catch (err) {
      return fail(400, {
        message: err instanceof Error ? err.message : "Check your details.",
      });
    }
    const next = safeNext(url.searchParams.get("next"));
    const { error } = await locals.supabase.auth.signInWithOtp({
      email: input.email,
      options: {
        shouldCreateUser: input.mode === "signup",
        emailRedirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        data:
          input.mode === "signup" ? { full_name: input.fullName } : undefined,
      },
    });
    if (error)
      return fail(400, {
        message:
          "We couldn’t send a sign-in link. Check your details, try signing up if you’re new, or try again shortly.",
      });
    return {
      message: "Check your email for a secure sign-in link.",
      sent: true,
    };
  },
};
