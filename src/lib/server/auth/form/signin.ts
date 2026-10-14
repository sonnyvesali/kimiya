export function parseSignin(form: FormData) {
  const mode = form.get("mode") === "signup" ? "signup" : "signin";
  const email = String(form.get("email") || "")
    .trim()
    .toLowerCase();
  const fullName = String(form.get("fullName") || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    throw new Error("Enter a valid email address.");
  if (mode === "signup" && (!fullName || fullName.length > 120))
    throw new Error("Enter your name (up to 120 characters).");
  return { mode, email, fullName };
}
