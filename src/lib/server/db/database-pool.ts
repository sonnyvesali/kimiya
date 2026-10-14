const defaultDatabasePoolMax = 3;

export function resolveDatabasePoolMax(
  value = process.env.DATABASE_POOL_MAX,
): number {
  if (value === undefined || value.trim() === "") {
    return defaultDatabasePoolMax;
  }

  if (!/^\d+$/.test(value.trim())) {
    throw new Error("DATABASE_POOL_MAX must be a positive integer");
  }

  const max = Number.parseInt(value, 10);
  if (max < 1) {
    throw new Error("DATABASE_POOL_MAX must be a positive integer");
  }

  return max;
}
