import { it, expect, vi, afterEach } from "vitest";
import { AuthApiError, AuthRetryableFetchError } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { emailLinkError } from "$lib/server/auth/form/email-link-error";
import { requestEmailLink } from "$lib/server/auth/workflows/request-email-link";
import { actions } from "../../src/routes/signin/+page.server";

afterEach(() => vi.restoreAllMocks());
it("explains that a new email must sign up before using sign-in", () => {
  const error = emailLinkError(
    new AuthApiError("Signups not allowed for otp", 422, "otp_disabled"),
    "signin",
    true,
  );
  expect(error.status).toBe(400);
  expect(error.suggestSignup).toBe(true);
  expect(error.message).toContain("Create an account first");
});
it("distinguishes disabled OTP configuration from a missing account", () => {
  const error = emailLinkError(
    new AuthApiError("OTP sign-in disabled", 422, "otp_disabled"),
    "signin",
    true,
  );
  expect(error.status).toBe(503);
  expect(error.suggestSignup).toBe(false);
});
it("preserves rate limiting instead of disguising it as bad input", () => {
  const error = emailLinkError(
    new AuthApiError("Rate limit exceeded", 429, "over_email_send_rate_limit"),
    "signup",
    true,
  );
  expect(error.status).toBe(429);
  expect(error.message).toContain("Wait a few minutes");
});
it("identifies rejected local API keys", () => {
  const error = emailLinkError(
    new AuthApiError("Invalid API key", 401, undefined),
    "signin",
    true,
  );
  expect(error.status).toBe(503);
  expect(error.message).toContain("publishable key in .env");
});
it("provides actionable local connectivity errors", () => {
  const error = emailLinkError(
    new AuthRetryableFetchError("fetch failed", 0),
    "signin",
    true,
  );
  expect(error.status).toBe(503);
  expect(error.message).toContain("Can’t reach local Supabase");
});
it("does not expose provider messages in production", () => {
  const error = emailLinkError(
    new AuthApiError("Internal secret diagnostic", 500, "unexpected_failure"),
    "signup",
    false,
  );
  expect(error.message).not.toContain("Internal secret");
  expect(error.message).not.toContain("unexpected_failure");
});
it.each(["signin", "signup"] as const)(
  "sends %s links back to the actual port and invitation destination",
  async (mode) => {
    const signInWithOtp = vi.fn().mockResolvedValue({ error: null });
    await requestEmailLink({
      supabase: { auth: { signInWithOtp } } as unknown as SupabaseClient,
      form: { mode, email: "student@school.edu", fullName: "Student" },
      origin: "http://localhost:5174",
      next: "/join?code=ABCD-EFGH-JKLM",
      local: true,
    });
    expect(signInWithOtp).toHaveBeenCalledWith({
      email: "student@school.edu",
      options: {
        shouldCreateUser: mode === "signup",
        emailRedirectTo:
          "http://localhost:5174/auth/callback?next=%2Fjoin%3Fcode%3DABCD-EFGH-JKLM",
        data: mode === "signup" ? { full_name: "Student" } : undefined,
      },
    });
  },
);
it("returns an explicit failed action result so sign-in errors render as alerts", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const form = new FormData();
  form.set("email", "student@school.edu");
  form.set("mode", "signin");
  const result = await actions.default({
    locals: {
      supabase: {
        auth: {
          signInWithOtp: async () => ({
            error: new AuthApiError(
              "Signups not allowed for otp",
              422,
              "otp_disabled",
            ),
          }),
        },
      },
    },
    url: new URL("http://localhost:5174/signin?next=%2F"),
    request: { formData: async () => form },
  } as never);
  expect(result).toMatchObject({
    status: 400,
    data: { sent: false, suggestSignup: true, email: "student@school.edu" },
  });
});
it("returns a distinct success result after sending an email", async () => {
  const form = new FormData();
  form.set("email", "student@school.edu");
  form.set("mode", "signup");
  form.set("fullName", "Student");
  const result = await actions.default({
    locals: {
      supabase: { auth: { signInWithOtp: async () => ({ error: null }) } },
    },
    url: new URL("http://localhost:5174/signin"),
    request: { formData: async () => form },
  } as never);
  expect(result).toMatchObject({ sent: true, suggestSignup: false });
});
