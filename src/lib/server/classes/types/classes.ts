export type InviteCredential = { kind: "token" | "code"; value: string };
export class ClassActionError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
