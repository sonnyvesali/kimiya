import { it, expect } from "vitest";
import { getTableConfig } from "drizzle-orm/pg-core";
import {
  users,
  classes,
  classInvites,
  classMemberships,
} from "$lib/server/db/schema";
it.each([users, classes, classInvites, classMemberships])(
  "denies direct access by default in the application schema",
  (table) => {
    const config = getTableConfig(table);
    expect(config.enableRLS).toBe(true);
    expect(config.policies).toHaveLength(0);
  },
);
