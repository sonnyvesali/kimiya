# UI Composition

Use this guidance when changing Svelte components, adding UI sections,
introducing popovers, drawers, dialogs, settings panels, table/list surfaces, or
client interaction state.

For full-screen SvelteKit route pages, read `route-page-composition.md` as the
baseline for how `+page.svelte`, route-local page models, primary sections, and
route-owned overlays should fit together.

For table and row-list pagination, read `table-pagination.md`. Pagination
controls should usually live in the shared table/list surface while route models
own query state and page loading.

## Core Pattern

UI work should preserve scanable ownership as features grow. A screen component
may compose sections and wire route-level data into them, but it should not
accumulate rendering, interaction state, async sequencing, endpoint calls,
cache reconciliation, route navigation, and settings submenus in one file.

Prefer this sequence for non-trivial UI changes:

1. Identify the existing component's current responsibilities.
2. Add the new behavior in the role-based module that owns that responsibility.
3. Extract a named child component or workflow before the parent gains another
   distinct section, menu, drawer, or interaction flow.
4. Keep the parent focused on composition and event wiring.
5. Preserve the public component/workflow API unless the requested change needs
   a contract change.

Do not wait for a component to become painful before splitting it. If the next
change makes the file harder to scan by reader intent, split as part of that
change.

## Component Growth Triggers

Split a Svelte component before adding new behavior when it already owns more
than two of these concerns:

- layout and composition;
- local interaction state;
- async sequencing, pending state, or error state;
- popover, submenu, drawer, or dialog coordination;
- derived display models;
- table, list, row, or repeated item rendering;
- settings or configuration sections;
- cache reconciliation or optimistic updates;
- route, URL, or navigation decisions;
- endpoint calls or response parsing.

Also split when a child section has its own imports, derived values, handlers,
or repeated controls. "Only used here" is not a reason to keep a distinct UI
surface embedded in a large parent.

## Role Boundaries

Classify new code by primary reason to change:

- `.svelte`: markup, composition, DOM wiring, event binding, lifecycle hooks,
  and visual states.
- `components/`: distinct panels, sections, rows, headers, menus, popovers,
  drawers, and repeated item renderers.
- `workflows/`: rune state, async sequencing, pending/error/success state,
  optimistic updates, open/close/reset behavior, URL synchronization, and
  coordination across controls.
- `api/`: endpoint calls, fetch wrappers, action wrappers, response parsing, and
  transport-level error mapping.
- `form/`: pure payload construction, parsing, normalization, label formatting,
  option shaping, and stateless transforms.
- `types/`: shared view models, workflow input types, exported prop shapes, and
  reusable domain value types.
- `constants/`: static option lists, display maps, defaults, and token values.

When a feature root already has role folders, put new files in the matching role
folder. When a feature root is still small, add role folders only when the split
improves readability more than it increases navigation cost.

## New UI Surface Rule

If a change adds or materially changes a visible surface with its own title,
controls, list, repeated rows, or empty/loading states, make that surface a
named component unless it is a tiny inline block.

Good extraction candidates include:

- settings sidebar sections;
- database and inline-database preference menus;
- property table/list views;
- entity inline sections;
- drawer and dialog headers;
- row action cells;
- repeated member, recipient, property, or form rows.

Keep display-only derived values close to the extracted component when they only
exist to render that section. Keep persisted interaction state in the workflow
that owns the interaction.

## Workflow Ownership

Create or extend a workflow module when a component needs `$state` plus any of
these:

- pending, error, or success state;
- timers, debouncing, or queued saves;
- optimistic updates or rollback state;
- create, edit, delete, archive, restore, or reorder sequencing;
- nested popover, submenu, drawer, or dialog coordination;
- URL search parameter synchronization;
- reset or dispose behavior when props, routes, or selected resources change.

Components should call named workflow verbs such as `openMenu`, `saveName`,
`selectInlineDatabase`, `requestDeletion`, or `resetForDatabase`. They should
not inline multi-step interaction sequencing beside markup.

Do not let one workflow become the new dumping ground. When a workflow starts
combining independent state domains, keep the public workflow as a facade and
split child workflows by state ownership.

When a facade workflow already has callers, preserve the exported public API and
move internals behind focused child workflows. Split before adding more behavior
when the workflow owns multiple optimistic collections, several unrelated
pending flags, lifecycle operations such as create/archive/restore/delete,
identity saves, preference toggles, and responsive reset/dispose behavior in one
file. Good child workflow boundaries are selection/list derivation, identity
saves, lifecycle mutations, ordering, preference toggles, and responsive layout
state.

## Route And Navigation Boundaries

Route and URL decisions belong in route-level workflows or small navigation
helpers, not in presentational child components. A table row can receive an
`href` or callback, but it should not know which route owns the destination
unless the table is route-specific.

When navigation completes the interaction, follow `interaction-completion.md`:
the destination load should own the next authoritative read, and the initiating
component should not wait for broad invalidation before navigating.

## Review Checklist

Before finishing non-trivial UI work, check:

- Did this change add a new responsibility to a component that is already
  difficult to scan?
- Does a section have its own imports, derived state, handlers, or repeated
  controls?
- Is route or URL logic mixed into reusable display components?
- Are popover, drawer, or dialog states owned near unrelated markup?
- Did endpoint calls or response parsing enter a component or workflow that
  should call an `api/` helper instead?
- Would naming a child component or workflow make the parent easier to read at
  the callsite?

If the answer is yes, split during the same change. Avoid broad rewrites, but do
not pile new behavior onto a component that already needs a clear boundary.

## Red Flags

- A component file acts as the only place for rendering, mutation sequencing,
  route decisions, cache updates, and nested popovers.
- New UI sections are added below existing unrelated sections because it is
  faster than naming the new surface.
- A workflow owns endpoint paths, Tailwind classes, markup, or reusable pure
  transforms.
- A child component receives a large anonymous object shape instead of a named
  view model or existing domain type.
- A parent component passes many unrelated props through several levels because
  ownership is unclear.
- Tests need broad harness state to exercise a small visual section.
