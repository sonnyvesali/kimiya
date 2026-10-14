import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  uniqueIndex,
  check,
  primaryKey,
} from "drizzle-orm/pg-core";
import type { UserMetadata } from "$lib/server/profiles/types/profile";
const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey(),
    fullName: text("full_name").notNull(),
    metadata: jsonb("metadata").$type<UserMetadata>().notNull().default({}),
    ...timestamps,
  },
  (t) => [
    check("users_metadata_object", sql`jsonb_typeof(${t.metadata}) = 'object'`),
    check(
      "users_metadata_role",
      sql`NOT (${t.metadata} ? 'role') OR (${t.metadata}->>'role' IS NOT NULL AND ${t.metadata}->>'role' IN ('educator', 'student'))`,
    ),
  ],
).enableRLS();
export const classes = pgTable(
  "classes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    educatorId: uuid("educator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [
    check(
      "classes_name_length",
      sql`length(trim(${t.name})) BETWEEN 1 AND 120`,
    ),
  ],
).enableRLS();
export const classMemberships = pgTable(
  "class_memberships",
  {
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.classId, t.studentId] })],
).enableRLS();
export const classInvites = pgTable(
  "class_invites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    codeHash: text("code_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("class_invites_token_unique").on(t.tokenHash),
    uniqueIndex("class_invites_code_unique").on(t.codeHash),
    uniqueIndex("class_invites_one_active")
      .on(t.classId)
      .where(sql`${t.revokedAt} IS NULL`),
  ],
).enableRLS();
