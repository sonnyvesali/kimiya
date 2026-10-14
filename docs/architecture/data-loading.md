# Data Loading

Use this guidance when changing page loads, drawers, forms, row selection,
navigation, or server read endpoints.

For large table or row-list surfaces, also read `table-pagination.md`. Table
pagination is an app-wide data-loading and cache concern, not a route-local UI
detail.

## Core Pattern

The app should feel responsive before every authoritative read finishes.
Prefer this sequence for detail surfaces:

1. Render the shell, drawer, or page from SvelteKit `load` data or cached row
   data that is already available.
2. Fetch only the missing screen context in one narrow request.
3. Seed TanStack Query from that context response so child components do not
   immediately issue a second blocking read.
4. Keep existing single-resource reads available for background refreshes,
   invalidation, and isolated surfaces.

Do not introduce a broad bootstrap endpoint just because data is related. Add a
screen-oriented context read only when the current interaction has a visible
waterfall or duplicate read before the UI becomes usable.

## Loading State Boundaries

Loading UI should distinguish an initial missing read from background
validation. Use skeletons, empty loading rows, and route-level loading when the
surface does not yet have usable data or when navigation intentionally changes
the visible resource. Do not replace an already-rendered sidebar, table, drawer,
or settings surface with loading UI just because a TanStack Query is
`isFetching`.

When cached or load-provided data exists, keep rendering that data during
background refreshes. If useful, show a small non-blocking pending indicator,
but avoid layout shifts and skeleton flashes. A good guard is
`query.isFetching && data.length === 0` for list skeletons; use route navigation
state for intentional resource transitions.

## Implemented Examples

- Inline row drawer: the drawer opens immediately from the cached row. The
  `inline-page-context` read returns the published form and form response
  together, then the form response query is seeded from that data.
- Full inline row page: the server load returns both `inlineForm` and
  `inlineResponse`, so the form preview does not need an immediate response read
  after page render.
- Form builder editor: selected-form views load the form list and selected form
  together through `FormBuilderContext`. Catalog-only views still use the
  existing forms-list read.
- Community sidebar: settings database skeletons are shown only while fetching
  and no database data is available, so background settings validation does not
  blank the existing sidebar.

## When To Use A Context Read

Use this pattern when:

- A user opens a drawer, detail page, editor, or form and the UI needs two or
  more sequential reads before it can be used.
- A child query refetches data that the parent route or context response already
  has.
- Authorization, row context, form context, or database context is being resolved
  repeatedly for the same visible interaction.

Prefer another approach when:

- The requests are independent and can simply run in parallel.
- SvelteKit `load` already returns enough data for the first usable render.
- A popover opens immediately from cached state and refreshes in the background.
- The proposed endpoint would return a large table/page bootstrap payload that is
  not needed for the initial screen.

## Implementation Checklist

- Define a narrow screen context type, such as `InlinePageContext` or
  `FormBuilderContext`.
- Put server orchestration in a named `$lib/server` workflow and keep the route
  thin.
- Reuse existing repositories, policies, and view-model builders instead of
  duplicating data-shaping logic.
- Authorize once at the route boundary and avoid repeating the same context
  lookup inside the workflow when a resolved context can be passed through.
- Seed TanStack Query with the context response when a child component owns a
  query for the same data.
- Preserve existing single-resource endpoints for refreshes, invalidations, and
  focused reads.
- Add route or workflow tests for the combined context shape, no-content cases,
  and mismatch/authorization behavior.

## Current Boundaries

Database and entity table pages already use SvelteKit `load` for visible rows
and metadata, then seed TanStack Query. Do not replace `table-meta` and
`table-rows` with a combined table-view endpoint unless measurement shows a
real post-hydration waterfall.

Share and settings popovers generally open from local or cached state
and refresh in the background. Their remaining latency belongs to mutation
response and cache reconciliation work, not this read-loading pattern.
