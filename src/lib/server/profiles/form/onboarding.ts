import { ProfileActionError } from "../types/profile-error";
export function parseAccountRole(form: FormData) {
  const role = form.get("role");
  if (role !== "educator" && role !== "student")
    throw new ProfileActionError("Choose educator or student.");
  return role;
}
