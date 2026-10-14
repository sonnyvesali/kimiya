import type { LayoutServerLoad } from "./$types";
export const load: LayoutServerLoad = ({ locals }) => ({
  profile: locals.profile
    ? { fullName: locals.profile.fullName, role: locals.profile.metadata.role }
    : null,
});
