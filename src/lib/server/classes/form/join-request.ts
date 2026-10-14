import type { InviteCredential } from "../types/classes";
export function joinCredential(url: URL, token?: string): InviteCredential {
  return token
    ? { kind: "token", value: token }
    : { kind: "code", value: url.searchParams.get("code") || "" };
}
