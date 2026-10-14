import { fail, redirect } from "@sveltejs/kit";
import { requireProfile } from "$lib/server/auth/workflows/session";
import {
  loadClassHome,
  createClass,
  parseClassName,
  ClassActionError,
} from "$lib/server/classes";
import type { PageServerLoad, Actions } from "./$types";
export const load: PageServerLoad = async ({ locals }) => ({
  classes: await loadClassHome(requireProfile(locals)),
});
export const actions: Actions = {
  create: async ({ locals, request }) => {
    let record;
    try {
      record = await createClass(
        requireProfile(locals),
        parseClassName(await request.formData()),
      );
    } catch (err) {
      if (err instanceof ClassActionError)
        return fail(err.status, { message: err.message });
      throw err;
    }
    redirect(303, `/classes/${record.id}`);
  },
  code: async ({ locals, request }) => {
    requireProfile(locals);
    const code = String((await request.formData()).get("code") || "");
    redirect(303, `/join?code=${encodeURIComponent(code)}`);
  },
};
