import { ClassActionError } from "../types/classes";
export function parseClassName(form: FormData) {
  const name = String(form.get("name") || "").trim();
  if (!name || name.length > 120)
    throw new ClassActionError("Enter a class name (up to 120 characters).");
  return name;
}
export function parseExpiry(form: FormData) {
  const value = String(form.get("expiresAt") || "");
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value))
    throw new ClassActionError("Enter a valid expiration date.");
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || date.getTime() <= Date.now())
    throw new ClassActionError("Expiration must be in the future.");
  return date;
}
