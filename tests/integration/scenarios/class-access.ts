import { randomUUID } from "node:crypto";
import { db } from "$lib/server/db";
import { users, classes } from "$lib/server/db/schema";
export async function withClassAccessScenario() {
  const educatorId = randomUUID(),
    studentId = randomUUID(),
    outsiderId = randomUUID();
  const [educator, student, outsider] = await db
    .insert(users)
    .values([
      { id: educatorId, fullName: "Educator", metadata: { role: "educator" } },
      { id: studentId, fullName: "Student", metadata: { role: "student" } },
      {
        id: outsiderId,
        fullName: "Other educator",
        metadata: { role: "educator" },
      },
    ])
    .returning();
  const [record] = await db
    .insert(classes)
    .values({ name: "Chemistry", educatorId })
    .returning();
  return { educator, student, outsider, record };
}
