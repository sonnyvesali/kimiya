import { ClassActionError } from "../types/classes";
export function assertEducator(role: unknown) {
  if (role !== "educator")
    throw new ClassActionError(
      "Only educators can create and manage classes.",
      403,
    );
}
export function assertStudent(role: unknown) {
  if (role !== "student")
    throw new ClassActionError("Only student accounts can join classes.", 403);
}
export function inviteIsActive(
  invite: { revokedAt: Date | null; expiresAt: Date | null },
  now = new Date(),
) {
  return !invite.revokedAt && (!invite.expiresAt || invite.expiresAt > now);
}
