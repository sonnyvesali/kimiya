export type ExpiryPreset = "never" | "day" | "week" | "custom";
export type InviteExpirySource = {
  id: string;
  expiresAt: Date | string | null;
};
