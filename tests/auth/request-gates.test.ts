import { beforeEach, it, expect, vi } from "vitest";
const fake = vi.hoisted(() => ({
  client: null as unknown,
  profile: null as unknown,
}));
vi.mock("$lib/supabase/server", () => ({
  createSupabaseServerClient: () => fake.client,
}));
vi.mock("$lib/server/profiles/repositories/profiles", () => ({
  ensureProfile: async () => fake.profile,
}));
import { handle } from "../../src/hooks.server";
async function request(path: string) {
  const locals = {} as App.Locals;
  return handle({
    event: {
      url: new URL(path, "https://kimiya.example"),
      cookies: {},
      setHeaders: () => {},
      locals,
    } as never,
    resolve: async () => new Response("allowed"),
  } as never);
}
beforeEach(() => {
  fake.client = null;
  fake.profile = null;
});
it("preserves invitation destinations for anonymous visitors", async () => {
  await expect(request("/join/abc")).rejects.toMatchObject({
    status: 303,
    location: "/signin?next=%2Fjoin%2Fabc",
  });
});
it("requires verified authentication for app pages", async () => {
  await expect(request("/classes/abc")).rejects.toMatchObject({ status: 303 });
});
it("allows sign-in without configured services", async () => {
  expect((await request("/signin")).status).toBe(200);
});
it("requires role selection and preserves the join destination", async () => {
  fake.client = {
    auth: { getUser: async () => ({ data: { user: { id: "u" } } }) },
  };
  fake.profile = { metadata: {} };
  await expect(request("/join?code=ABC")).rejects.toMatchObject({
    location: "/onboarding?next=%2Fjoin%3Fcode%3DABC",
  });
});
it("allows onboarded users through the app gate", async () => {
  fake.client = {
    auth: { getUser: async () => ({ data: { user: { id: "u" } } }) },
  };
  fake.profile = { metadata: { role: "student" } };
  expect((await request("/")).status).toBe(200);
});
