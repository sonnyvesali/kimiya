export function localExpiry(value: Date | string | null) {
  if (!value) return "";
  const date = new Date(value);
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return adjusted.toISOString().slice(0, 16);
}
export function serializeExpiry(value: string) {
  return value ? new Date(value).toISOString() : "";
}
