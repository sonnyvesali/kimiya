import {
  loadJoinPage,
  submitJoinPage,
} from "$lib/server/classes/workflows/join-page";
import { joinCredential } from "$lib/server/classes/form/join-request";
import type { PageServerLoad, Actions } from "./$types";
export const load: PageServerLoad = ({ locals, url, params }) =>
  loadJoinPage(locals, joinCredential(url, undefined));
export const actions: Actions = {
  default: ({ locals, url, params }) =>
    submitJoinPage(locals, joinCredential(url, undefined)),
};
