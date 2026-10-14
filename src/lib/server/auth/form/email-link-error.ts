import type { AuthError } from "@supabase/supabase-js";
import { AuthActionError } from "../types/auth-error";
export function emailLinkError(
  error: AuthError,
  mode: "signin" | "signup",
  local: boolean,
) {
  const code = error.code;
  if (
    mode === "signin" &&
    (code === "user_not_found" ||
      (code === "otp_disabled" && /signups not allowed/i.test(error.message)))
  )
    return new AuthActionError(
      "No account exists for this email yet. Create an account first, then check your email for the sign-in link.",
      400,
      code,
      true,
    );
  if (code === "email_exists" || code === "user_already_exists")
    return new AuthActionError(
      "An account already exists for this email. Sign in instead.",
      409,
      code,
    );
  if (
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit" ||
    error.status === 429
  )
    return new AuthActionError(
      "Too many sign-in emails have been requested. Wait a few minutes before requesting another link.",
      429,
      code,
    );
  if (code === "email_address_invalid" || code === "validation_failed")
    return new AuthActionError(
      "This email address isn’t accepted. Check the address and try again.",
      400,
      code,
    );
  if (code === "email_address_not_authorized")
    return new AuthActionError(
      local
        ? "This project is using restricted email delivery instead of the local inbox. Check your local Supabase connection and Mailpit configuration."
        : "Email delivery isn’t configured for this address. Please contact support.",
      503,
      code,
    );
  if (
    code === "email_provider_disabled" ||
    code === "otp_disabled" ||
    code === "signup_disabled"
  )
    return new AuthActionError(
      "Email sign-in is disabled for this Supabase project. Enable email authentication and sign-ups in its auth settings.",
      503,
      code,
    );
  if (
    error.status === 401 ||
    error.status === 403 ||
    /invalid api key/i.test(error.message)
  )
    return new AuthActionError(
      local
        ? "The Supabase key was rejected. Update the publishable key in .env from supabase status, then restart the app."
        : "Sign-in is temporarily unavailable. Please try again later.",
      503,
      code,
    );
  if (error.name === "AuthRetryableFetchError" || error.status === 0)
    return new AuthActionError(
      local
        ? "Can’t reach local Supabase. Make sure it is running and PUBLIC_SUPABASE_URL points to its local API."
        : "Can’t reach the sign-in service. Please try again shortly.",
      503,
      code,
    );
  const diagnostic =
    local && code && /^[a-z0-9_]{1,80}$/.test(code)
      ? ` Supabase error: ${code}.`
      : "";
  return new AuthActionError(
    local
      ? `Local Supabase couldn’t send the email. Check its Auth logs and Mailpit.${diagnostic}`
      : "We couldn’t send your sign-in link. Please try again shortly.",
    503,
    code,
  );
}
