import { beforeAll, afterAll, it, expect, describe } from "vitest";
import { eq, inArray, sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, closeDatabase } from "$lib/server/db";
import { users, classMemberships, classInvites } from "$lib/server/db/schema";
import {
  ensureProfile,
  chooseRole,
} from "$lib/server/profiles/repositories/profiles";
import {
  loadClassDetail,
  manageInvite,
  joinClass,
  previewJoin,
} from "$lib/server/classes";
import { withClassAccessScenario } from "./scenarios/class-access";
import type { User } from "@supabase/supabase-js";
const databaseUrl = process.env.TEST_DATABASE_URL;
describe.skipIf(!databaseUrl)(
  "Postgres class authorization and durable enrollment",
  () => {
    let scenario: Awaited<ReturnType<typeof withClassAccessScenario>>;
    let initialProfileId: string | undefined;
    beforeAll(async () => {
      if (
        !/^\/kimiya_test(?:_[a-z0-9_]+)?$/.test(new URL(databaseUrl!).pathname)
      )
        throw new Error(
          "Use a dedicated kimiya_test database; this suite must never run against app data.",
        );
      await migrate(db, { migrationsFolder: "supabase/migrations" });
      scenario = await withClassAccessScenario();
    });
    afterAll(async () => {
      if (scenario)
        await db
          .delete(users)
          .where(
            inArray(users.id, [
              scenario.educator.id,
              scenario.student.id,
              scenario.outsider.id,
              ...(initialProfileId ? [initialProfileId] : []),
            ]),
          );
      await closeDatabase();
    });
    it("creates profiles idempotently and preserves extensible metadata during one-time onboarding", async () => {
      initialProfileId = crypto.randomUUID();
      const user = {
        id: initialProfileId,
        email: "new@example.com",
        user_metadata: { full_name: "New user" },
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
      } satisfies User;
      await ensureProfile(user);
      await ensureProfile(user);
      await db
        .update(users)
        .set({ metadata: { timezone: "America/Chicago" } })
        .where(eq(users.id, user.id));
      const selected = await chooseRole(user.id, "student");
      expect(selected?.metadata).toEqual({
        timezone: "America/Chicago",
        role: "student",
      });
      expect(await chooseRole(user.id, "educator")).toBeUndefined();
      const rows = await db.select().from(users).where(eq(users.id, user.id));
      expect(rows).toHaveLength(1);
      expect(rows[0].metadata.role).toBe("student");
    });
    it("denies non-member reads and non-owner invite mutations", async () => {
      await expect(
        loadClassDetail(scenario.student, scenario.record.id),
      ).rejects.toMatchObject({ status: 404 });
      await expect(
        manageInvite(scenario.outsider, {
          classId: scenario.record.id,
          operation: "generate",
          expiresAt: null,
        }),
      ).rejects.toMatchObject({ status: 404 });
    });
    it("enrolls exactly once across simultaneous link and code submissions", async () => {
      const credentials = (await manageInvite(scenario.educator, {
        classId: scenario.record.id,
        operation: "generate",
        expiresAt: null,
      }))!;
      const link = { kind: "token" as const, value: credentials.token },
        code = { kind: "code" as const, value: credentials.code };
      await Promise.all([
        joinClass(scenario.student, link),
        joinClass(scenario.student, code),
        joinClass(scenario.student, link),
      ]);
      expect(
        await db
          .select()
          .from(classMemberships)
          .where(eq(classMemberships.classId, scenario.record.id)),
      ).toHaveLength(1);
      expect((await previewJoin(scenario.student, link)).alreadyJoined).toBe(
        true,
      );
      expect(
        (await loadClassDetail(scenario.student, scenario.record.id)).record.id,
      ).toBe(scenario.record.id);
      await expect(joinClass(scenario.educator, link)).rejects.toMatchObject({
        status: 403,
      });
    });
    it("invalidates all old join methods when regenerated or revoked", async () => {
      const old = (await manageInvite(scenario.educator, {
        classId: scenario.record.id,
        operation: "generate",
        expiresAt: null,
      }))!;
      const current = (await manageInvite(scenario.educator, {
        classId: scenario.record.id,
        operation: "generate",
        expiresAt: null,
      }))!;
      for (const credential of [
        { kind: "token" as const, value: old.token },
        { kind: "code" as const, value: old.code },
      ])
        await expect(
          joinClass(scenario.student, credential),
        ).rejects.toMatchObject({ status: 404 });
      await manageInvite(scenario.educator, {
        classId: scenario.record.id,
        operation: "revoke",
        expiresAt: null,
      });
      await expect(
        joinClass(scenario.student, { kind: "token", value: current.token }),
      ).rejects.toMatchObject({ status: 404 });
    });
    it("rechecks expiration at enrollment time, including after a prior preview", async () => {
      const credentials = (await manageInvite(scenario.educator, {
        classId: scenario.record.id,
        operation: "generate",
        expiresAt: null,
      }))!;
      const credential = { kind: "token" as const, value: credentials.token };
      await previewJoin(scenario.student, credential);
      await db
        .update(classInvites)
        .set({ expiresAt: new Date(0) })
        .where(eq(classInvites.classId, scenario.record.id));
      await expect(
        joinClass(scenario.student, credential),
      ).rejects.toMatchObject({ status: 404 });
    });
    it("denies direct reads and writes to every application table for both browser roles", async () => {
      for (const role of ["anon", "authenticated"])
        for (const table of [
          "users",
          "classes",
          "class_memberships",
          "class_invites",
        ]) {
          for (const statement of [
            `SELECT * FROM public.${table}`,
            `DELETE FROM public.${table}`,
          ]) {
            await expect(
              db.transaction(async (tx) => {
                await tx.execute(sql.raw(`SET LOCAL ROLE ${role}`));
                await tx.execute(sql.raw(statement));
              }),
            ).rejects.toMatchObject({ cause: { code: "42501" } });
          }
        }
    });
    it("automatically locks future public tables", async () => {
      await db.transaction(async (tx) => {
        await tx.execute(
          sql`CREATE TABLE public.kimiya_lockdown_probe (id integer)`,
        );
        const result = await tx.execute<{ rls: boolean; readable: boolean }>(
          sql`SELECT relrowsecurity as rls, has_table_privilege('authenticated','public.kimiya_lockdown_probe','SELECT') as readable FROM pg_class WHERE oid='public.kimiya_lockdown_probe'::regclass`,
        );
        expect(result[0]).toEqual({ rls: true, readable: false });
        await tx.execute(sql`DROP TABLE public.kimiya_lockdown_probe`);
      });
    });
  },
);
