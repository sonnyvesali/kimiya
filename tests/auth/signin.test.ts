import { it, expect } from "vitest";
import { parseSignin } from "$lib/server/auth/form/signin";
it("normalizes sign-up fields", () => {
  const form = new FormData();
  form.set("mode", "signup");
  form.set("email", " Student@Example.com ");
  form.set("fullName", " Ada ");
  expect(parseSignin(form)).toEqual({
    mode: "signup",
    email: "student@example.com",
    fullName: "Ada",
  });
});
it("rejects incomplete sign-up", () => {
  const form = new FormData();
  form.set("mode", "signup");
  form.set("email", "student@example.com");
  expect(() => parseSignin(form)).toThrow("Enter your name");
});
it("rejects malformed email", () => {
  const form = new FormData();
  form.set("email", "not an email");
  expect(() => parseSignin(form)).toThrow("valid email");
});
