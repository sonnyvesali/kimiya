import { createHash, randomBytes, randomInt } from "node:crypto";
import { ClassActionError } from "../types/classes";
import type { InviteCredential } from "../types/classes";
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function hashCredential(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
export function normalizeCode(value: string) {
  return value.replace(/[\s-]/g, "").toUpperCase();
}
export function credentialHash(credential: InviteCredential) {
  const value =
    credential.kind === "code"
      ? normalizeCode(credential.value)
      : credential.value;
  if (
    credential.kind === "code"
      ? !/^[A-HJ-NP-Z2-9]{12}$/.test(value)
      : !/^[a-f0-9]{48}$/.test(value)
  )
    throw new ClassActionError(
      "This invitation is invalid, expired, or revoked.",
      404,
    );
  return hashCredential(value);
}
export function createInviteCredentials() {
  const token = randomBytes(24).toString("hex");
  const code = Array.from(
    { length: 12 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
  return {
    token,
    code: code.match(/.{4}/g)!.join("-"),
    tokenHash: hashCredential(token),
    codeHash: hashCredential(code),
  };
}
