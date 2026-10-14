import { chooseRole } from "../repositories/profiles";
import { ProfileActionError } from "../types/profile-error";
import type { AccountRole } from "../types/profile";
export async function completeOnboarding(userId: string, role: AccountRole) {
  if (!(await chooseRole(userId, role)))
    throw new ProfileActionError(
      "Your account has already been set up. Refresh to continue.",
      409,
    );
}
