import { error, fail } from "@sveltejs/kit";
import { requireProfile } from "$lib/server/auth/workflows/session";
import {
  loadClassDetail,
  manageInvite,
  parseExpiry,
  ClassActionError,
} from "$lib/server/classes";
import type { PageServerLoad, Actions } from "./$types";
export const load: PageServerLoad = async ({ locals, params }) => {
  try {
    return await loadClassDetail(requireProfile(locals), params.classId);
  } catch (err) {
    if (err instanceof ClassActionError) error(err.status, err.message);
    throw err;
  }
};
export const actions: Actions = {
  invite: async ({ locals, params, request, url }) => {
    try {
      const form = await request.formData();
      const operation = form.get("operation");
      if (
        operation !== "generate" &&
        operation !== "expiry" &&
        operation !== "revoke"
      )
        return fail(400, {
          message: "Choose a valid invitation action.",
          tone: "error" as const,
        });
      const credentials = await manageInvite(requireProfile(locals), {
        classId: params.classId,
        operation,
        expiresAt: operation === "revoke" ? null : parseExpiry(form),
      });
      return {
        tone: "success" as const,
        message:
          operation === "generate"
            ? "Invitation created. Save these details now; they are shown only once."
            : operation === "revoke"
              ? "Invitation revoked."
              : "Expiration updated.",
        credentials: credentials
          ? {
              url: `${url.origin}/join/${credentials.token}`,
              code: credentials.code,
            }
          : null,
      };
    } catch (err) {
      if (err instanceof ClassActionError)
        return fail(err.status, {
          message: err.message,
          tone: "error" as const,
        });
      throw err;
    }
  },
};
