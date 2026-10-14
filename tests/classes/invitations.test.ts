import { it, expect } from "vitest";
import {
  createInviteCredentials,
  credentialHash,
  normalizeCode,
} from "$lib/server/classes/form/invite-credentials";
import {
  assertEducator,
  assertStudent,
  inviteIsActive,
} from "$lib/server/classes/policies/access";
import { parseExpiry } from "$lib/server/classes/form/class-form";
it("QR/link tokens and formatted class codes resolve to their respective hashes", () => {
  const credentials = createInviteCredentials();
  expect(credentialHash({ kind: "token", value: credentials.token })).toBe(
    credentials.tokenHash,
  );
  expect(
    credentialHash({ kind: "code", value: credentials.code.toLowerCase() }),
  ).toBe(credentials.codeHash);
  expect(normalizeCode(credentials.code)).toHaveLength(12);
});
it("rejects malformed credentials", () => {
  expect(() => credentialHash({ kind: "code", value: "x" })).toThrow();
  expect(() => credentialHash({ kind: "token", value: "x" })).toThrow();
});
it("honors revocation and the exact expiry boundary", () => {
  const now = new Date();
  expect(inviteIsActive({ revokedAt: null, expiresAt: null }, now)).toBe(true);
  expect(inviteIsActive({ revokedAt: now, expiresAt: null }, now)).toBe(false);
  expect(inviteIsActive({ revokedAt: null, expiresAt: now }, now)).toBe(false);
  expect(
    inviteIsActive(
      { revokedAt: null, expiresAt: new Date(now.getTime() + 1) },
      now,
    ),
  ).toBe(true);
});
it("keeps educator management and student enrollment distinct", () => {
  expect(() => assertEducator("student")).toThrow();
  expect(() => assertStudent("educator")).toThrow();
  expect(() => assertEducator("educator")).not.toThrow();
  expect(() => assertStudent("student")).not.toThrow();
});
it("accepts no expiry and rejects past or ambiguous dates", () => {
  const form = new FormData();
  expect(parseExpiry(form)).toBeNull();
  for (const value of ["2020-01-01T00:00:00.000Z", "2027-01-01"]) {
    form.set("expiresAt", value);
    expect(() => parseExpiry(form)).toThrow();
  }
});
