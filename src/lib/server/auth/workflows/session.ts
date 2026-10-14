import { error, redirect } from "@sveltejs/kit";
import { safeNext } from "../form/redirect";
import { ensureProfile } from "$lib/server/profiles/repositories/profiles";
export function requireUser(locals: App.Locals) {
  if (!locals.user) error(401, "Sign in to continue.");
  return locals.user;
}
export function requireProfile(locals: App.Locals) {
  requireUser(locals);
  if (!locals.profile?.metadata.role)
    error(403, "Complete your account setup first.");
  return locals.profile;
}
export async function postAuthDestination(
  locals: App.Locals,
  destination: string | null,
) {
  if (!locals.supabase) error(503, "Authentication is not configured.");
  const {
    data: { user },
  } = await locals.supabase.auth.getUser();
  const next = safeNext(destination);
  if (!user) redirect(303, `/signin?next=${encodeURIComponent(next)}`);
  const profile = await ensureProfile(user);
  return profile.metadata.role
    ? next
    : `/onboarding?next=${encodeURIComponent(next)}`;
}
