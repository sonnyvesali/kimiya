import type { ExpiryPreset } from "../types/expiry";
export const expiryPresets: { value: ExpiryPreset; label: string }[] = [
  { value: "never", label: "Never" },
  { value: "day", label: "In 24 hours" },
  { value: "week", label: "In 7 days" },
  { value: "custom", label: "Custom date" },
];
