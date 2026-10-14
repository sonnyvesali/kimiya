export type AccountRole = "educator" | "student";
export type UserMetadata = { role?: AccountRole; [key: string]: unknown };
