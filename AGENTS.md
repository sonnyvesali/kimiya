# Agent Guidance

## Code Organization

- Prefer small modules with a clear role over large files that mix parsing, authorization, data access, workflow logic, and presentation concerns.
- Name files after the responsibility they own, not after generic categories like `utils`, `helpers`, or `misc`.
- When a directory grows, group support code by role. Good folder names include `scenarios`, `assertions`, `clients`, `repositories`, `services`, `parsers`, and `types`.
- Keep repeated patterns close to their domain until they are clearly shared across domains.
- Prefer organization strategies that improve scanability at the callsite and feature-root level, not just theoretical separation of concerns.
- Avoid modules that simultaneously own rendering, transport access, normalization, async sequencing, and persistence decisions.
- Extract a module when naming the responsibility makes the caller easier to read; avoid abstractions that only move code around.
- A file name should promise one primary responsibility, and the file should be readable top-to-bottom for that responsibility.
- Avoid broad files that collect predicates, parsing, payload construction, config extraction, async sequencing, data access, and display formatting just because one feature uses all of them.
- Split by reader intent and reason to change; do not split mechanically into one-function files when a small cohesive module is easier to scan.

## Feature Folder Organization

- Feature roots should contain role-based subfolders instead of loose mixed files once multiple responsibilities emerge.
- Tiny single-purpose feature folders may temporarily keep closely related files together until multiple distinct responsibilities emerge.
- Do not create role folders mechanically. A tiny stable feature may keep closely related files together until separation improves readability more than it increases navigation cost.
- Prefer these role folders:
  - `components/`: Svelte components only.
  - `workflows/`: rune-based state, async orchestration, timers, sequencing, optimistic updates, and reset/dispose behavior.
  - `api/`: endpoint calls, fetch wrappers, action wrappers, response parsing, and transport-level error mapping.
  - `form/`: parse, normalize, validate, serialize, user-facing formatting helpers, pure payload construction, stateless transforms, and option mutation helpers.
  - `types/`: exported/shared type definitions, domain shapes, workflow input types, and reusable value types. Use `import type` for imports from this folder.
  - `constants/`: exported constant values, option lists, static maps, and token/config constants.
- Classify files by primary reason to change, not by incidental usage.
- Do not use `model/` as a default bucket for mixed types, constants, and helpers in client feature folders. Prefer `types/`, `constants/`, or the role folder that explains the behavior.
- Avoid generic `utils/`, `helpers/`, or `misc/` folders inside feature domains. Prefer role-based placement tied to the file's primary responsibility.
- Large feature roots should be visually scannable. A crowded feature root is usually a signal that role folders are overdue.
- A feature root should usually contain only subfolders and, when truly needed, an intentional public entrypoint or README.
- Do not mix `.svelte` components with API, workflow, form, types, constants, or model modules in the same directory once a feature has multiple roles.
- Do not add barrel `index.ts` files unless preserving an existing public import contract or there are multiple external consumers that benefit from a stable entrypoint.
- When a role folder grows around several subdomains, add a focused subfolder for the subdomain rather than leaving many sibling files at the role-folder root. Keep the public facade at the existing import path when consumers already depend on it.
- Prefer subdomain folders named for the feature concern, such as `share/`, `entity-create/`, or `databases/`, over generic buckets like `helpers/` or `utils/`.

## Server Feature Folder Organization

- For sufficiently complex server feature folders, prefer role-based subfolders over flat files that mix parsing, policy, persistence, orchestration, mapping, and static definitions.
- Use these folders when the responsibility exists:
  - `workflows/`: request or domain orchestration, transaction sequencing, side-effect coordination, expected error mapping, and calls across repositories/services.
  - `repositories/`: database reads/writes, Drizzle query construction, persistence shapes, transaction-scoped helpers, and row loading.
  - `policies/`: pure authorization predicates, business rules, planning logic, state transition checks, visibility rules, and restrictions.
  - `form/`: request parsing, payload normalization, validation of raw inputs, `FormData`/JSON shaping, and stateless response/view-model transforms when primarily shaping user/API payloads.
  - `types/`: shared exported server-local types, row shapes, workflow input types, patch types, and reusable value types.
  - `constants/`: static definitions, default records, required property definitions, option lists, and config maps.
- Classify server files by primary reason to change. If a file starts owning three or more of these concerns, split it before adding more behavior:
  - request parsing or payload validation
  - authorization or business policy checks
  - database reads/writes
  - transaction sequencing or workflow orchestration
  - pure planning or ordering logic
  - response/view-model mapping
  - exported type definitions
  - static defaults or required definitions
- Do not let a server file own both raw request parsing and database persistence unless it is a tiny, stable endpoint-specific module.

## Server Feature Public APIs

- Feature roots may expose a small public facade when it improves route readability.
- Good facade exports include workflow command functions, parser/form functions, typed expected errors, and shared feature-local types.
- Avoid exposing repositories, internal policy helpers, or implementation details from subfolders.
- The facade should optimize route readability and preserve stable imports during internal refactors.

## AGENTS.md Placement

- Keep repo-wide conventions in the root `AGENTS.md`, including feature folder organization, Svelte component/workflow boundaries, server route/workflow boundaries, naming, and testing conventions.
- Add nested `AGENTS.md` files only when a subtree has materially different rules, such as database migrations, browser-test harnesses, generated files, or external tool constraints.
- Avoid adding scoped instruction files for normal feature folders. Prefer improving the root guidance unless the rule would be noisy or misleading outside one subtree.

## Architecture Guidance

- Before planning or implementing a non-trivial feature, read the relevant documents under `docs/architecture/`.
- Start with the architecture document whose title or opening guidance best matches the work, then follow any links or references from that document as needed.
- Treat architecture documents as constraints, not optional background. During planning, identify the relevant rule and state whether the implementation follows it or intentionally departs from it.
- Do not silently introduce a pattern that conflicts with the architecture documents. If a conflict is necessary, explain the tradeoff before implementation.

## Naming

- Prefer domain-specific names that explain intent, such as `withCommunityAccessScenario`, `parseInviteFormData`, `normalizeInviteEmails`, or `InvitationRepository`.
- Avoid redundant prefixes when the directory already supplies context.
- Use role suffixes when they improve clarity, such as `*Repository` for persistence boundaries or `*ActionError` for expected user-facing failures. Do not add suffixes mechanically.
- Avoid vague names like `data`, `manager`, `handler`, or `utils` unless the surrounding domain makes the role precise.
- Prefer verbs for workflows and commands, nouns for records and types, and `parse*`/`normalize*` for input-shaping functions.

## Comments

- Avoid explanatory comments for functions, branches, or ordinary code flow. Prefer clearer names, smaller functions, and better module boundaries.
- Keep comments only for genuinely counterintuitive constraints that cannot be made clear with naming or structure.
- Do not use comments as section labels inside modules or components; extract named functions or components instead.

## Route And Server Boundaries

- Keep route files thin: read request context, enforce access, call named server workflows, translate expected errors, and redirect or return data.
- Put domain workflows in `$lib/server` modules. Prefer structured input objects over long positional parameter lists.
- Prefer workflow modules for request- or interaction-oriented orchestration and services for reusable domain behavior shared across workflows.
- Keep validation and form parsing separate when reused or when it would distract from the main workflow.
- Keep external side effects behind small interfaces when tests need fakes.
- Expected user-facing failures should use typed error classes so routes can map them to `fail(...)` responses without string matching.
- Route files should import parser/form functions, workflow command functions, and typed expected errors from a feature facade when available, such as `$lib/server/<feature>`.
- Deep imports into `repositories/`, `policies/`, or `types/` are acceptable for tightly coupled server internals and tests.
- Routes should not import repositories directly unless the route is intentionally just a read adapter and no workflow boundary exists yet.
- Do not duplicate `load` return shapes inside `+page.svelte` or `+layout.svelte`. Use generated SvelteKit types from `./$types`, such as `PageData` and `LayoutData`, unless there is a narrow wrapper/component boundary that intentionally accepts a smaller view model.

## Database Schema Changes

- When asked to make schema changes, start by editing `src/lib/server/db/schema.ts`.
- Generate migration changes through `drizzle-kit` from the schema update.
- Do not write direct migrations by hand for schema changes unless explicitly asked to do so.

## Testing Structure

- Prefer one test file per behavior area, table, or workflow when that keeps assertions readable.
- Move shared test setup into named scenario modules instead of repeating setup or hiding it in generic helpers.
- Put test support files in subfolders named by role, not in the test directory root beside test files.
- Integration tests should assert observable behavior and durable outcomes, not brittle implementation details or exact vendor error strings.
- Name test helpers after the behavior they provide, such as `visibleIds`, `assertInsertDenied`, or `withCommunityAccessScenario`.
- When repeated setup appears across tests in the same behavior area, extract it into a local role-based test module before the test file becomes crowded.
- Do not extract tiny one-off setup just to make a test shorter. Extract when the helper name improves the behavior story or when repetition is already obscuring the test.
- Move shared stateful setup into named scenario modules instead of repeating setup or hiding it in generic helpers. Scenario modules should own coherent state setup and interaction helpers, not unrelated fixtures, assertions, and transport details.
- Use `scenarios/` for stateful test contexts such as fake repositories, route request harnesses, query-client/cache setup, workflow setup, seeded database states, and multi-step integration stories.
- Use `assertions/` for reusable observable outcome checks such as database rows, cache state, emitted sync topics, serialized `FormData`, sent emails, membership rows, or access rows.
- Use `support/` for small stateless domain fixture builders such as `member`, `pendingInvite`, `property`, `cellTarget`, or `entityShare`. Avoid using `support/` as a catch-all for request harnesses, cache scenarios, assertions, or fake repositories.
- Prefer narrow domain builders with sensible defaults and explicit overrides over repeating full object literals. The callsite should show only the fields that matter to that test.
- Keep behavior-defining expected values inline when they are the point of the test, especially payload contracts, permission outcomes, role changes, sync-topic names, and route response shapes.
- Keep rollback order, optimistic sequencing, route-like mutation stories, and multi-step cache behavior visible in the test body; do not bury those flows behind opaque helpers.
- Split tests when one test asserts independent behavior, such as normalization plus form parsing, setup plus authorization, or cache patching plus rollback.
- Name helpers after the behavior or domain object they provide, such as `withSettingsMembersCache`, `withCommunityAccessScenario`, `pendingInvite`, `expectFormFields`, or `assertSyncTopicBumped`.
- Avoid generic names like `setup`, `mockData`, `testUtils`, `helpers`, or catch-all fixture modules when a domain-specific name is available.
- Keep test helpers local to the behavior area until multiple domains clearly need them. Do not create broad shared harnesses for theoretical reuse.
- Do not add barrel `index.ts` files for test helpers unless preserving an existing import contract.

## Tailwind Class Readability

- Keep short, readable Tailwind class lists inline. As a rule of thumb, inline classes are fine when they stay under roughly 5-8 utilities.
- For long static class lists inside component internals, prefer multiline `cn()` calls so layout, spacing, color, and state utilities remain scannable.
- Extract a component when a UI pattern repeats or when naming the pattern makes the surrounding code easier to understand.
- Use `tv()` only when a component has meaningful variants, sizes, tones, or states that need a structured variant API.
- Avoid broad custom CSS classes unless they represent actual design tokens, shared base app styles, or behavior that Tailwind utilities cannot express cleanly.
- Preserve existing visual behavior when reorganizing classes.

## Dropdown Components

- Do not use native `<select>` elements for product UI dropdowns.
- Use the shared Bits UI-backed select components from `$lib/components/ui/select` so dropdown styling, keyboard behavior, focus management, portals, and accessibility remain consistent.
- Keep option labels and domain value mapping outside the generic select component. Use a focused feature component when a dropdown needs icons, descriptions, multiple selection, search, or type-specific value rendering.
- Native selects are acceptable only inside external/generated markup or when an explicit platform constraint requires one; document that exception at the callsite.
- Do not add abstractions just for abstraction's sake; use them only when they improve readability, reuse, or correctness.

## Planning Workflow

- For non-trivial changes, create an implementation plan before editing files.
- Plans should identify:
  - affected files
  - state ownership changes
  - schema or API impacts
  - migration requirements
  - validation and test strategy
- Prefer small, incremental plans over large rewrites.
- Explicitly call out uncertainty before implementation.
- Avoid introducing abstractions until the duplication or coordination problem is concrete.
- After writing files, run the project formatter with `bun run format` before final verification unless the user explicitly asks to skip formatting.

## Execution Discipline

- Implement only the approved scope.
- Preserve existing behavior unless the change explicitly requires behavioral changes.
- Prefer minimal diffs over broad rewrites.
- Reuse existing patterns before introducing new architectural styles.
- When refactoring, preserve external interfaces unless explicitly changing contracts.
- Avoid mixing unrelated cleanup into implementation changes.

## Version Control With jj

- Prefer `jj` over direct Git commands for local change management in this repository.
- Use `jj status`, `jj diff`, and `jj log` to inspect work before editing and before final responses.
- Do not automatically create a new jj change for every request. First inspect the active change and decide whether it already represents the current task.
- Start non-trivial agent tasks in a fresh jj change with `jj new -m "<short task description>"` when the active change already contains unrelated work, stale exploratory edits, or a different user-owned task.
- Keep each requested task grouped into a coherent jj change. If a task naturally splits into independent changes, use `jj split` or create separate changes rather than mixing unrelated work.
- Prefer stacking related follow-up work on top of the current change instead of editing already-reviewed parent changes, unless the user asks to amend or revise that parent change.
- Keep exploratory edits in the active task change while they are part of reaching the requested outcome. If exploration becomes unrelated, move it to a separate scratch change or discard it before finalization.
- Before finalizing a task change, remove or split out scratch work so the final `jj diff` represents only the requested scope.
- Do not create Git commits directly with `git commit` unless explicitly requested.
- Do not use `jj squash`, `jj abandon`, `jj rebase`, or other history-rewriting operations on user-owned or already-reviewed changes unless explicitly requested.
- Use `jj describe -m "<message>"` to give the active change a clear description once the scope is understood.
- Use `jj diff` for the final change summary. Mention any tests or format commands run.
- Use Git commands only for read-only compatibility checks or remote operations that are not available through jj.

## Forgejo Actions

- For external actions in `.forgejo/workflows` and composite actions used by Forgejo, use full GitHub URLs such as `https://github.com/actions/checkout@v4`.
- Do not replace external action URLs with shorthand refs like `actions/checkout@v4`, because Forgejo resolves those through its own action mirror and not every GitHub action is mirrored.
- Local reusable actions may use relative paths such as `./.github/actions/load-infisical-secrets`.

## UI Composition

- Prefer composition over large monolithic UI components.
- Components in `components/` should focus on markup, composition, DOM wiring, event binding, lifecycle hooks, and visual states.
- Extract components when:
  - state ownership becomes unclear
  - layout modes diverge significantly
  - naming the responsibility improves readability
- Extract a child component when a parent component embeds a distinct panel or section with its own imports, derived display state, event handlers, and repeated controls, such as reminder settings, share recipient lists, or advanced configuration sections.
- Keep display-only derived values close to the extracted component when they exist only to render that section. Keep persisted workflow state in the workflow that owns the interaction.
- Move non-trivial state orchestration to `workflows/`, endpoint calls to `api/`, pure payload/config transforms to `form/`, shared types to `types/`, and shared runtime constants to `constants/`.
- Keep component-private `Props` interfaces/type aliases inside the `.svelte` file unless they are exported, reused externally, unusually large, or part of a wrapper/public component API.
- If a Svelte component's `$props()` type annotation becomes visually large, roughly more than 15-20 lines or includes repeated domain shapes, move it to a feature-local `types/` module and reuse existing view-model types instead of duplicating inline object shapes.
- "Only used here" is not sufficient justification for keeping orchestration, parsing, or API logic inside a large Svelte component.
- Shared UI state should have a clearly identifiable owner.
- Keep visual scaffolding simple first; refine polish incrementally.
- Preserve responsive behavior when reorganizing layouts.

## Stateful Client Workflow Modules

- Use `*-workflow.svelte.ts` modules for complex rune-based client interaction state that would otherwise make a Svelte component difficult to reason about.
- Workflow modules own state transitions, sequencing, async orchestration, timers, pending/error/success state, optimistic updates, reset/dispose behavior, and cross-control coordination.
- Workflow modules should be placed in `workflows/` when a feature uses role folders.
- Extract or plan a workflow module when a component combines several concerns such as interdependent `$state`/`$derived` values, timers or debounced saves, queued async work, optimistic or pending UI state, multi-step mutations, conversion preview/apply flows, submenu/dialog/popover coordination, reset/reinitialization behavior, or derived saving/error/success state.
- Do not introduce workflow modules for simple presentational components or lightweight local state.
- Do not let one workflow module become the default dumping ground for every interaction concern. When a workflow starts combining several independent responsibilities, keep the exported workflow as a facade and split child workflows by state ownership, such as save/debounce/queue behavior, conversion preview/apply behavior, selection state, upload state, or dialog orchestration.
- Split child workflows when a single facade owns independent state domains such as selection/filtering, optimistic mutations/cache rollback, reminder configuration, timezone persistence, draft reset, or navigation. Do not wait for reuse; split when the responsibility boundary makes the facade easier to scan.
- Keep child workflow dependencies directional and explicit. The facade should wire child workflows together; child workflows should not import or freely call each other. If one child workflow needs a narrow behavior from another, pass that specific function through dependency injection.
- Put child workflow support files in a focused subfolder under `workflows/` when more than one child/helper belongs to the same concern. Keep the main public workflow file at the original path unless the requested change explicitly allows import churn.
- When splitting an existing workflow, preserve the public workflow API unless the requested change explicitly changes the component contract. Existing harness or browser test assertions should not need meaningful changes for a readability-only refactor.
- Keep responsibilities split by role:
  - `*.svelte`: markup, composition, DOM wiring, and event binding.
  - `*-workflow.svelte.ts`: `$state`, `$derived`, timers, async workflow orchestration, pending/error/success state, reset logic, and dialog/submenu coordination.
  - `*-api.ts`: endpoint calls, fetch wrappers, response parsing, and transport-level error mapping.
  - `*-form.ts`: pure payload construction, config normalization, parsing, validation, formatting, stateless transforms, and option mutation helpers.
  - `types/`: shared/exported local types.
  - `constants/`: shared/exported runtime constants.
- Workflow modules may call local API wrapper helpers, but should not hardcode endpoint paths, repeat inline fetch logic, own response parsing, render markup, own styling/classes, or contain reusable stateless transforms.
- Keep workflows free of markup, Tailwind classes, endpoint strings, raw fetch calls, and reusable stateless transforms.
- Workflow modules must not assume incoming props stay static. Prefer explicit reset methods when lifecycle moments matter, such as `workflow.resetForProperty(property, database)`. Use getter-based inputs for values that may change across resets, prop changes, or async work; use explicit setters or callbacks for the narrow state a child workflow is allowed to update.
- When expanding a large Svelte component, first check whether new code is rendering, workflow orchestration, API access, pure transformation, or shared typing. Add the code to the matching module, or create the module if that responsibility is becoming concrete.

## Agent Behavior

- Do not broaden scope beyond the requested task.
- Do not proactively redesign architecture unless the current structure blocks the requested change.
- Prefer explaining architectural concerns before performing large refactors.
- When multiple reasonable implementations exist, prefer the one most consistent with existing repository patterns.
- Avoid introducing abstractions primarily for theoretical reuse.
