import type { SupabaseClient } from "@supabase/supabase-js";
import type { parseSignin } from "../form/signin";
import { emailLinkError } from "../form/email-link-error";
export async function requestEmailLink(input: {
  supabase: SupabaseClient;
  form: ReturnType<typeof parseSignin>;
  origin: string;
  next: string;
  local: boolean;
}) {
  const { error } = await input.supabase.auth.signInWithOtp({
    email: input.form.email,
    options: {
      shouldCreateUser: input.form.mode === "signup",
      emailRedirectTo: `${input.origin}/auth/callback?next=${encodeURIComponent(input.next)}`,
      data:
        input.form.mode === "signup"
          ? { full_name: input.form.fullName }
          : undefined,
    },
  });
  if (error) {
    console.error("Email authentication failed", {
      code: error.code || error.name,
      status: error.status,
    });
    throw emailLinkError(error, input.form.mode, input.local);
  }
}
