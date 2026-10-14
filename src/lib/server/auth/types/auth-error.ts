export class AuthActionError extends Error {
  constructor(
    message: string,
    public status = 400,
    public code?: string,
    public suggestSignup = false,
  ) {
    super(message);
  }
}
