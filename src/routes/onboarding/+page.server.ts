import { fail, redirect } from "@sveltejs/kit";
import { requireUser } from "$lib/server/auth/workflows/session";
import { safeNext } from "$lib/server/auth/form/redirect";
import {
  completeOnboarding,
  parseAccountRole,
  ProfileActionError,
} from "$lib/server/profiles";
import type { Actions, PageServerLoad } from "./$types";
export const load: PageServerLoad = ({ locals, url }) => {
  requireUser(locals);
  const next = safeNext(url.searchParams.get("next"));
  if (locals.profile?.metadata.role) redirect(303, next);
  return { next };
};
export const actions: Actions = {
  default: async ({ locals, request, url }) => {
    const user = requireUser(locals);
    try {
      await completeOnboarding(
        user.id,
        parseAccountRole(await request.formData()),
      );
    } catch (err) {
      if (err instanceof ProfileActionError)
        return fail(err.status, { message: err.message });
      throw err;
    }
    redirect(303, safeNext(url.searchParams.get("next")));
  },
};
