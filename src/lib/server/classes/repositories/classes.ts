import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "$lib/server/db";
import {
  classes,
  classMemberships,
  classInvites,
  users,
} from "$lib/server/db/schema";
import { ClassActionError } from "../types/classes";
export function listClasses(userId: string, role: string) {
  if (role === "educator")
    return db
      .select({ id: classes.id, name: classes.name })
      .from(classes)
      .where(eq(classes.educatorId, userId))
      .orderBy(classes.createdAt);
  return db
    .select({ id: classes.id, name: classes.name })
    .from(classes)
    .innerJoin(classMemberships, eq(classMemberships.classId, classes.id))
    .where(eq(classMemberships.studentId, userId))
    .orderBy(classes.createdAt);
}
export async function insertClass(educatorId: string, name: string) {
  const [record] = await db
    .insert(classes)
    .values({ educatorId, name })
    .returning();
  return record;
}
export async function readClassForUser(classId: string, userId: string) {
  if (
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
      classId,
    )
  )
    throw new ClassActionError("Class not found.", 404);
  const [record] = await db
    .select()
    .from(classes)
    .where(eq(classes.id, classId));
  if (!record) throw new ClassActionError("Class not found.", 404);
  if (record.educatorId !== userId) {
    const [membership] = await db
      .select()
      .from(classMemberships)
      .where(
        and(
          eq(classMemberships.classId, classId),
          eq(classMemberships.studentId, userId),
        ),
      );
    if (!membership) throw new ClassActionError("Class not found.", 404);
  }
  return record;
}
export async function readOwnedClass(classId: string, userId: string) {
  const record = await readClassForUser(classId, userId);
  if (record.educatorId !== userId)
    throw new ClassActionError(
      "Only the class educator can manage invitations.",
      403,
    );
  return record;
}
export function readRoster(classId: string) {
  return db
    .select({
      id: users.id,
      fullName: users.fullName,
      joinedAt: classMemberships.joinedAt,
    })
    .from(classMemberships)
    .innerJoin(users, eq(users.id, classMemberships.studentId))
    .where(eq(classMemberships.classId, classId))
    .orderBy(users.fullName);
}
export async function readActiveInvite(classId: string) {
  const [invite] = await db
    .select({ id: classInvites.id, expiresAt: classInvites.expiresAt })
    .from(classInvites)
    .where(
      and(eq(classInvites.classId, classId), isNull(classInvites.revokedAt)),
    );
  return invite ?? null;
}
export async function withLockedClass<T>(
  classId: string,
  educatorId: string,
  operation: (
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  ) => Promise<T>,
) {
  return db.transaction(async (tx) => {
    const [record] = await tx
      .select()
      .from(classes)
      .where(and(eq(classes.id, classId), eq(classes.educatorId, educatorId)))
      .for("no key update");
    if (!record) throw new ClassActionError("Class not found.", 404);
    return operation(tx);
  });
}
export async function rotateInvite(
  classId: string,
  educatorId: string,
  credentials: { tokenHash: string; codeHash: string },
  expiresAt: Date | null,
) {
  return withLockedClass(classId, educatorId, async (tx) => {
    await tx
      .update(classInvites)
      .set({ revokedAt: sql`now()`, updatedAt: sql`now()` })
      .where(
        and(eq(classInvites.classId, classId), isNull(classInvites.revokedAt)),
      );
    const [invite] = await tx
      .insert(classInvites)
      .values({ classId, ...credentials, expiresAt })
      .returning({ id: classInvites.id });
    return invite;
  });
}
export async function changeInvite(
  classId: string,
  educatorId: string,
  operation: "revoke" | "expiry",
  expiresAt: Date | null,
) {
  return withLockedClass(classId, educatorId, async (tx) => {
    const [invite] = await tx
      .update(classInvites)
      .set(
        operation === "revoke"
          ? { revokedAt: sql`now()`, updatedAt: sql`now()` }
          : { expiresAt, updatedAt: sql`now()` },
      )
      .where(
        and(eq(classInvites.classId, classId), isNull(classInvites.revokedAt)),
      )
      .returning();
    if (!invite) throw new ClassActionError("Generate an invitation first.");
  });
}
