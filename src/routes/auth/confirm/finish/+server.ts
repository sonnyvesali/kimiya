import { redirect } from "@sveltejs/kit";
import { postAuthDestination } from "$lib/server/auth/workflows/session";
import type { RequestHandler } from "./$types";
export const GET: RequestHandler = async ({ locals, url }) => {
  redirect(
    303,
    await postAuthDestination(locals, url.searchParams.get("next")),
  );
};
