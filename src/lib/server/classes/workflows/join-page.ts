import { fail, redirect } from "@sveltejs/kit";
import { requireProfile } from "$lib/server/auth/workflows/session";
import { previewJoin, joinClass } from "./classes";
import { ClassActionError } from "../types/classes";
import type { InviteCredential } from "../types/classes";
export async function loadJoinPage(
  locals: App.Locals,
  credential: InviteCredential,
) {
  try {
    return {
      invitation: await previewJoin(requireProfile(locals), credential),
      message: null,
    };
  } catch (err) {
    if (err instanceof ClassActionError)
      return { invitation: null, message: err.message };
    throw err;
  }
}
export async function submitJoinPage(
  locals: App.Locals,
  credential: InviteCredential,
) {
  let classId;
  try {
    classId = await joinClass(requireProfile(locals), credential);
  } catch (err) {
    if (err instanceof ClassActionError)
      return fail(err.status, { message: err.message });
    throw err;
  }
  redirect(303, `/classes/${classId}`);
}
