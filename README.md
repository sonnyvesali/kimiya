# Kimiya

A minimal classroom app built with Svelte 5, SvelteKit, Supabase Auth, Postgres,
Drizzle, and Tailwind CSS. Its visual identity combines spacious Catalyst-style
layouts with restrained Linear-style navigation: warm neutrals, muted teal, and
system-aware light/dark mode.

## Local setup

```sh
bun install --frozen-lockfile
supabase start
cp .env.example .env
```

Set `PUBLIC_SUPABASE_ANON_KEY` to the **publishable** key from `supabase status`.
The legacy variable name also accepts a legacy anon key. The app does not need a
Supabase secret/service-role key or storage credentials. Keep `.env` private.

```sh
bun run db:migrate
bun run dev
```

Open `http://localhost:5173`. Supabase config allows authentication callbacks on
localhost and 127.0.0.1 at port 5173. If Supabase was already running before the
config was added or edited, restart it to pick up the auth redirect settings.
Read local sign-in emails in Mailpit at `http://127.0.0.1:54324`.

The sign-in screen also renders without configured services and explains that
setup is needed. Authenticated requests require a reachable, migrated database.

## Authentication and classrooms

- Create an account using your name and email, then follow the secure email link.
- Choose **Educator** or **Student** once. The role lives in extensible user
  `metadata` JSONB; onboarding preserves existing metadata keys.
- Educators create multiple classes and see their student rosters.
- Students join multiple classes using a QR code, invitation link, or class code.
  An invitation survives sign-in and onboarding; enrollment requires confirmation.
- Invitations are reusable, default to no expiry, and support expiration,
  revocation, and regeneration. Each class has one active invitation. Regenerating
  invalidates every old join method. Single-use invitations are deferred.
- Link tokens and class codes are stored only as SHA-256 hashes. Save or download
  credentials when generated; they are shown once. QR generation runs locally.

All app data access runs through authenticated server workflows. Students can
read only their joined classes; educators can manage only classes they own.
Student-facing pages do not expose the class roster. RLS is enabled without
browser policies, and all direct table/sequence access is revoked from `anon`,
`authenticated`, and `PUBLIC`. A database event trigger locks future public tables.
The server database connection must have access to the app tables and bypass RLS.
Apply the lockdown migration with the local Supabase `postgres` role or an
appropriately privileged hosted migration role; event triggers require elevated
Postgres privileges. Do not omit the lockdown migration when deploying.

## Validation

```sh
bun run test
bun run check
bun run format
bun run format:check
bun run build
bun run preview:ui
```

`preview:ui` serves a separate synthetic-data visual fixture at
`http://127.0.0.1:8765`. It covers educator/student home, invitation controls,
roster, joining, sign-in, and onboarding with theme controls. It is not an app
authentication bypass and is not part of the production build.

Postgres integration tests are opt-in. Set `TEST_DATABASE_URL` to a **dedicated**
local Supabase test database named `kimiya_test` (or `kimiya_test_<suffix>`) and
run `bun run test`. The suite applies migrations, requires the existing Supabase
`anon` and `authenticated` roles and event-trigger privileges, creates its own
users/classes, and deletes its own records afterward. Never point this suite at
an application database. Tests cover profile creation, one-time onboarding,
class access, concurrent enrollment, invite lifecycle, direct-access denial,
and automatic lockdown of new public tables. Without that URL they are skipped.

Generate schema migrations with `bun run db:generate` after editing
`src/lib/server/db/schema.ts`. Security infrastructure uses a Drizzle-generated
custom migration. Repository organization follows `AGENTS.md` and the documents
under `docs/architecture`, with thin routes and separate parsers, repositories,
policies, and workflows.

The vendored QR encoder is Project Nayuki’s MIT-licensed QR Code generator;
its license is retained in `src/lib/vendor/qr-code-generator.ts`.
