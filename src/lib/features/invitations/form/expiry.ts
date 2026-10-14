import type { ExpiryPreset } from "../types/expiry";
export function expiryIso(value: Date | string | null) {
  return value ? new Date(value).toISOString() : "";
}
export function presetDeadline(preset: ExpiryPreset, now: Date) {
  if (preset === "day")
    return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  if (preset === "week") {
    const date = new Date(now);
    date.setDate(date.getDate() + 7);
    return date.toISOString();
  }
  return "";
}
export function customDeadline(date: string, time: string | null) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!parts)
    return { iso: "", error: "Choose a date for this invitation to expire." };
  if (time !== null && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
    return { iso: "", error: "Enter a valid time." };
  const [year, month, day] = parts.slice(1).map(Number);
  const [hour, minute] = time === null ? [23, 59] : time.split(":").map(Number);
  const value = new Date(
    year,
    month - 1,
    day,
    hour,
    minute,
    time === null ? 59 : 0,
    time === null ? 999 : 0,
  );
  if (
    value.getFullYear() !== year ||
    value.getMonth() !== month - 1 ||
    value.getDate() !== day ||
    value.getHours() !== hour ||
    value.getMinutes() !== minute
  )
    return {
      iso: "",
      error: "That date or local time isn’t valid. Choose another.",
    };
  return { iso: value.toISOString(), error: null };
}
export function expiryError(iso: string, now: Date) {
  return iso && new Date(iso) <= now
    ? "Choose an expiration in the future."
    : null;
}
export function expirySummary(iso: string) {
  if (!iso) return "This invitation doesn’t expire.";
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
  const time = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
  return `Students can join until ${day} at ${time} · your local time.`;
}
