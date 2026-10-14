import { safeNext } from "$lib/server/auth/form/redirect";
import type { PageServerLoad } from "./$types";
export const load: PageServerLoad = ({ url }) => ({
  next: safeNext(url.searchParams.get("next")),
});
