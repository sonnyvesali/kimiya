import { env } from "$env/dynamic/private";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { resolveDatabasePoolMax } from "./database-pool";
import * as schema from "./schema";
let databaseClient: ReturnType<typeof postgres> | undefined;
function connect() {
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not defined");
  databaseClient = postgres(env.DATABASE_URL, {
    max: resolveDatabasePoolMax(env.DATABASE_POOL_MAX),
  });
  return drizzle(databaseClient, { schema });
}
let connection: ReturnType<typeof connect> | undefined;
export const db = new Proxy({} as ReturnType<typeof connect>, {
  get(_target, key) {
    connection ??= connect();
    const value = Reflect.get(connection, key);
    return typeof value === "function" ? value.bind(connection) : value;
  },
});

export async function closeDatabase() {
  await databaseClient?.end();
  databaseClient = undefined;
  connection = undefined;
}
