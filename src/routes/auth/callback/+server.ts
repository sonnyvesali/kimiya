import { redirect } from "@sveltejs/kit";
import { safeNext } from "$lib/server/auth/form/redirect";
import { postAuthDestination } from "$lib/server/auth/workflows/session";
import type { RequestHandler } from "./$types";
export const GET: RequestHandler = async ({ locals, url }) => {
  const next = safeNext(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  if (!locals.supabase) redirect(303, "/signin?error=auth");
  if (code) {
    const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
    if (error)
      redirect(303, `/signin?error=auth&next=${encodeURIComponent(next)}`);
  } else if (
    tokenHash &&
    (type === "email" ||
      type === "magiclink" ||
      type === "signup" ||
      type === "invite")
  ) {
    const { error } = await locals.supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (error)
      redirect(303, `/signin?error=auth&next=${encodeURIComponent(next)}`);
  } else if (!locals.user)
    redirect(303, `/auth/confirm?next=${encodeURIComponent(next)}`);
  redirect(303, await postAuthDestination(locals, next));
};
