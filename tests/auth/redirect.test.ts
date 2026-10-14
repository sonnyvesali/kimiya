import { describe, it, expect } from "vitest";
import { safeNext } from "$lib/server/auth/form/redirect";
describe("post-auth destinations", () => {
  it.each([
    null,
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/auth/signout",
    "/signin?next=/",
    "/onboarding",
    "/auth/../signin",
    "/a\nlocation: evil",
  ])("rejects unsafe or looping destination %s", (value) =>
    expect(safeNext(value)).toBe("/"),
  );
  it.each([
    "/join/" + "a".repeat(48),
    "/join?code=ABCD-EFGH-JKLM",
    "/classes/123",
  ])("preserves internal destination %s", (value) =>
    expect(safeNext(value)).toBe(value),
  );
});
