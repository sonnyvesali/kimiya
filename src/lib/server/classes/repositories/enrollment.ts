import { and, eq, sql } from "drizzle-orm";
import { db } from "$lib/server/db";
import {
  classes,
  classInvites,
  classMemberships,
  users,
} from "$lib/server/db/schema";
import { ClassActionError } from "../types/classes";
import type { InviteCredential } from "../types/classes";
import { credentialHash } from "../form/invite-credentials";
import { assertStudent, inviteIsActive } from "../policies/access";
function inviteMatch(credential: InviteCredential) {
  return eq(
    credential.kind === "code" ? classInvites.codeHash : classInvites.tokenHash,
    credentialHash(credential),
  );
}
export async function readInvitation(credential: InviteCredential) {
  const [record] = await db
    .select({
      invite: classInvites,
      className: classes.name,
      educatorName: users.fullName,
    })
    .from(classInvites)
    .innerJoin(classes, eq(classes.id, classInvites.classId))
    .innerJoin(users, eq(users.id, classes.educatorId))
    .where(inviteMatch(credential));
  if (!record || !inviteIsActive(record.invite))
    throw new ClassActionError(
      "This invitation is invalid, expired, or revoked.",
      404,
    );
  return record;
}
export async function enrollStudent(
  userId: string,
  credential: InviteCredential,
) {
  return db.transaction(async (tx) => {
    const [invite] = await tx
      .select()
      .from(classInvites)
      .where(inviteMatch(credential))
      .for("update");
    const [clock] = await tx.execute<{ now: string }>(
      sql`select clock_timestamp() as now`,
    );
    if (!invite || !inviteIsActive(invite, new Date(clock.now)))
      throw new ClassActionError(
        "This invitation is invalid, expired, or revoked.",
        404,
      );
    const [profile] = await tx
      .select({ metadata: users.metadata })
      .from(users)
      .where(eq(users.id, userId));
    assertStudent(profile?.metadata.role);
    await tx
      .insert(classMemberships)
      .values({ classId: invite.classId, studentId: userId })
      .onConflictDoNothing();
    return invite.classId;
  });
}
export async function hasMembership(classId: string, studentId: string) {
  const [membership] = await db
    .select()
    .from(classMemberships)
    .where(
      and(
        eq(classMemberships.classId, classId),
        eq(classMemberships.studentId, studentId),
      ),
    );
  return !!membership;
}
