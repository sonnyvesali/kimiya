import { it, expect } from "vitest";
import {
  customDeadline,
  presetDeadline,
  expiryIso,
  expiryError,
  expirySummary,
} from "$lib/features/invitations/form/expiry";
it("keeps a no-expiration invite empty", () => {
  expect(presetDeadline("never", new Date())).toBe("");
  expect(expiryIso(null)).toBe("");
  expect(expirySummary("")).toBe("This invitation doesn’t expire.");
});
it("sets the 24-hour preset to exactly 24 hours from selection", () => {
  const now = new Date("2030-10-13T12:15:00.000Z");
  expect(presetDeadline("day", now)).toBe("2030-10-14T12:15:00.000Z");
});
it("sets seven days using the same local wall-clock time", () => {
  const now = new Date(2030, 9, 13, 12, 15);
  const result = new Date(presetDeadline("week", now));
  expect(result.getDate()).toBe(20);
  expect(result.getHours()).toBe(12);
  expect(result.getMinutes()).toBe(15);
});
it("defaults a custom date to the end of its local day", () => {
  const result = customDeadline("2030-10-20", null);
  expect(result.error).toBeNull();
  const date = new Date(result.iso);
  expect([
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  ]).toEqual([2030, 9, 20, 23, 59, 59, 999]);
});
it("supports an explicit local time", () => {
  const result = customDeadline("2030-10-20", "14:30");
  expect(result.error).toBeNull();
  const date = new Date(result.iso);
  expect([date.getHours(), date.getMinutes(), date.getSeconds()]).toEqual([
    14, 30, 0,
  ]);
});
it.each([
  ["", null],
  ["2030-02-30", null],
  ["2030-10-20", "25:00"],
  ["2030-10-20", ""],
])("rejects incomplete or invalid custom dates and times", (date, time) => {
  expect(customDeadline(date!, time).error).toBeTruthy();
});
it("rejects a deadline at or before the current moment", () => {
  const now = new Date("2030-10-20T12:00:00.000Z");
  expect(expiryError(now.toISOString(), now)).toBeTruthy();
  expect(
    expiryError(new Date(now.getTime() + 1).toISOString(), now),
  ).toBeNull();
});
it("preserves existing expiry precision when settings are untouched", () => {
  expect(expiryIso("2030-10-20T12:34:56.789Z")).toBe(
    "2030-10-20T12:34:56.789Z",
  );
});
