export function safeNext(value: string | null): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u0020\u007f]/.test(value)
  )
    return "/";
  try {
    const url = new URL(value, "https://kimiya.invalid");
    if (
      url.origin !== "https://kimiya.invalid" ||
      /^\/(auth|signin|onboarding)(\/|$)/.test(url.pathname)
    )
      return "/";
    return url.pathname + url.search;
  } catch {
    return "/";
  }
}
