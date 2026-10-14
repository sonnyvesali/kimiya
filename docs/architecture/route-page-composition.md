# Route Page Composition

Use this guidance when changing SvelteKit `+page.svelte` files for full-screen
application views, especially database, entity, settings, editor, and detail
pages.

## Core Pattern

A route page should make the visible screen structure obvious at the callsite.
When a reader opens `+page.svelte`, they should be able to scan the markup and
see the main surfaces in the same order the user sees them.

Prefer this shape:

1. `+page.svelte` owns route props, route context hooks, lightweight effects,
   and the visible screen composition.
2. A route-local `*-page-model.svelte.ts` owns query setup, cache adapters,
   settings context derivation, route navigation state, and workflow wiring.
3. Named section components render the primary in-flow surfaces.
4. Named overlay components group route-owned dialogs, drawers, popovers, and
   other out-of-flow surfaces.

The entity detail page is the baseline pattern:

```svelte
<main>
  <EntityHeader />
  <EntityPropertiesPanel />
  <EntityInlineSection />
</main>

<EntityPageOverlays />
```

That structure is preferable to a single broad component such as
`<EntityDetail ...manyProps />` when the route is really composing a full
screen.

Dashboard and home routes should follow the same ownership shape. A community
home page with several repeated-list sections should keep route data, context
lookups, workflow wiring, display sorting, section expansion state, and href
builders in a route-local page model, then render named sections in visible
order:

```svelte
<main>
  <CommunityHomeHeader />
  <CreateActivitySection />
  <CurrentActivitiesSection />
  <AdminDatabasesSection />
</main>

<CommunityHomeOverlays />
```

Do not leave dashboard-style routes as one large `+page.svelte` just because
each section is individually simple. Once the page owns multiple lists,
independent section state, and route-level overlays, use the same route model
and section boundary as detail pages.

## Route Model Ownership

Create or extend a route-local model when `+page.svelte` would otherwise own
several of these responsibilities:

- TanStack Query creation or cache adapter construction;
- cache seeding or load-data reconciliation;
- settings or app-shell context derivation;
- route navigation pending state;
- selected tab, view, inline database, or drawer URL state;
- workflow creation that needs route data, navigation, and cache dependencies;
- derived display models that are needed by multiple page sections.

Name the model after the page, such as `entity-page-model.svelte.ts` or
`database-page-model.svelte.ts`. Keep it route-local until another route truly
shares the same page orchestration.

The model should expose readable page concepts, not raw implementation clutter.
Good return values include `displayTableMeta`, `displayEntity`,
`inlineRowsLoading`, `activeSettingsDatabase`, `detail`, `tableMetaCache`, and
named route actions such as `selectInlineDatabase`.

## Page Markup Ownership

Keep primary visual sections directly visible in `+page.svelte`.

Good route markup communicates the user's screen:

- title or identity section;
- details, properties, settings, or summary panel;
- table, list, editor, or inline database section;
- route-owned overlays after the main content.

Avoid hiding the whole screen inside one page facade component when the route
can compose existing named sections directly. A facade is acceptable only when
it represents one cohesive surface, not when it exists mainly to carry a wide
prop list from the route to several unrelated child sections.

Do not move query setup, cache reconciliation, or navigation decisions into
section components just to make the route file shorter. Short route files are
not the goal. Scanable ownership is the goal.

## Overlay Boundaries

Dialogs, drawers, popovers, and other out-of-flow surfaces should usually be
grouped in a named route overlay component, such as `EntityPageOverlays.svelte`.

Use a page overlay component when:

- the overlay is owned by route-level workflow state;
- multiple primary sections can open or affect the overlay;
- the overlay responds to URL state or route navigation;
- leaving the overlay as loose markup at the bottom of `+page.svelte` makes the
  page composition harder to scan.

Do not bury route-owned overlays inside the button or section that happens to
open them unless that section owns the whole interaction lifecycle. A section
can receive callbacks like `onOpenPreferences`, `onOpenRow`, or
`onCreateLogEntry`, while the route model and overlay component own the actual
drawer or dialog state.

The route should read as "main page content, then route overlays", not as a
pile of conditional drawer markup after the base page.

## Workflow And Navigation Boundaries

Route-owned workflows should receive route dependencies explicitly:

- current URL getter;
- navigation function;
- cache adapters;
- settings or shell caches;
- server action/API functions where needed.

Avoid importing `$app/navigation` or `$app/state` directly inside reusable
feature workflows when the workflow can receive `navigate` and `currentUrl`
from the route model. This keeps route decisions at the route boundary and
makes browser harnesses simpler.

Reusable visual components should not know route paths unless the component is
route-specific. Prefer passing `href`, `rowOpenHref`, or named callbacks from
the route model.

## Review Checklist

Before finishing a non-trivial page change, check:

- Does `+page.svelte` show the main screen sections in user-visible order?
- Did route data/query/cache orchestration move into a route-local model when it
  became noisy?
- Are route-owned overlays grouped behind a named overlay component?
- Are reusable sections receiving callbacks or `href`s instead of importing
  route navigation?
- Did the refactor preserve existing workflow APIs unless a contract change was
  required?
- Would a future agent understand the page structure from the route markup
  alone?

## Red Flags

- `+page.svelte` renders only one broad component for a multi-section screen.
- A component exists mainly to redistribute route props to several unrelated
  sections.
- Dialogs and drawers are loose conditional blocks at the bottom of a route
  after the main markup has become substantial.
- A section component owns URL query params, route navigation, cache adapter
  setup, and visual rendering at the same time.
- A route model returns many anonymous blobs instead of named page concepts.
- A workflow imports route modules directly even though it could receive narrow
  route dependencies.
