import { assertEducator, assertStudent } from "../policies/access";
import { createInviteCredentials } from "../form/invite-credentials";
import {
  changeInvite,
  insertClass,
  readClassForUser,
  readOwnedClass,
  readRoster,
  readActiveInvite,
  rotateInvite,
  listClasses,
} from "../repositories/classes";
import {
  enrollStudent,
  readInvitation,
  hasMembership,
} from "../repositories/enrollment";
import type { InviteCredential } from "../types/classes";
import type { users } from "$lib/server/db/schema";
type Profile = typeof users.$inferSelect;
export function loadClassHome(profile: Profile) {
  return listClasses(profile.id, profile.metadata.role!);
}
export function createClass(profile: Profile, name: string) {
  assertEducator(profile.metadata.role);
  return insertClass(profile.id, name);
}
export async function loadClassDetail(profile: Profile, classId: string) {
  const record = await readClassForUser(classId, profile.id);
  const owned = record.educatorId === profile.id;
  const [roster, invite] = await Promise.all([
    owned ? readRoster(classId) : Promise.resolve([]),
    owned ? readActiveInvite(classId) : Promise.resolve(null),
  ]);
  return { record, owned, roster, invite };
}
export async function manageInvite(
  profile: Profile,
  input: {
    classId: string;
    operation: "generate" | "expiry" | "revoke";
    expiresAt: Date | null;
  },
) {
  assertEducator(profile.metadata.role);
  await readOwnedClass(input.classId, profile.id);
  if (input.operation === "generate") {
    const credentials = createInviteCredentials();
    await rotateInvite(
      input.classId,
      profile.id,
      { tokenHash: credentials.tokenHash, codeHash: credentials.codeHash },
      input.expiresAt,
    );
    return { token: credentials.token, code: credentials.code };
  }
  await changeInvite(
    input.classId,
    profile.id,
    input.operation,
    input.expiresAt,
  );
  return null;
}
export async function previewJoin(
  profile: Profile,
  credential: InviteCredential,
) {
  const record = await readInvitation(credential);
  return {
    className: record.className,
    educatorName: record.educatorName,
    alreadyJoined: await hasMembership(record.invite.classId, profile.id),
    classId: record.invite.classId,
    canJoin: profile.metadata.role === "student",
  };
}
export function joinClass(profile: Profile, credential: InviteCredential) {
  assertStudent(profile.metadata.role);
  return enrollStudent(profile.id, credential);
}
