# Table Pagination

Use this guidance when adding or changing pagination for database tables, inline
database tables, row lists, or other app surfaces that render large ordered row
sets.

## Core Stance

App tables should use shared cursor pagination by default. Prefer an explicit
`Load more` control for the first implementation of table pagination, including
inline and nested tables. Do not add route-specific pagination state when the
surface is already backed by the shared table row query and cache.

Cursor pagination is the default because table rows can be created, deleted,
renamed, edited, and resorted while the user is viewing them. Offset pagination
is easier to wire, but it is less stable for collaborative or frequently
mutated row sets.

## Boundaries

Pagination belongs in these shared boundaries:

1. The server row-loading workflow parses `limit` and opaque `cursor` params.
2. The row query stores loaded pages under the existing table scope.
3. Route models flatten loaded pages into display rows and expose load-more
   state to sections.
4. The shared table component renders the pagination affordance.
5. Row mutation cache adapters patch across all loaded pages.

Do not introduce a broad page-bootstrap endpoint just to support pagination.
Keep `table-meta` and `table-rows` as focused reads unless measurement shows a
separate waterfall.

## Contracts

Paged row reads should return:

```ts
{
  rows: DatabaseTableRow[];
  pageInfo: {
    limit: number;
    nextCursor: string | null;
    hasNextPage: boolean;
  };
}
```

The cursor is opaque to the client and must encode enough result-set identity to
reject stale cursors when sort direction or sort key changes. Page slicing
should happen before row projection and reference hydration so only visible rows
pay the projection cost.

## UI Rules

Use `Load more` before numbered pages or automatic infinite scroll. The control
should live with the table/list surface, show a pending state while fetching the
next page, and disappear when `hasNextPage` is false. Existing rendered rows
should remain visible during background fetches.

Numbered pagination is appropriate only when users need direct page jumps,
durable page numbers, or print/export style navigation. Infinite scroll needs a
separate design because nested inline tables make implicit loading easy to miss.

## Mutation Rules

Optimistic row mutations must update every loaded page for the table scope. Row
create should insert temporary rows into the currently loaded collection, row
delete should remove matching rows from all loaded pages, and authoritative row
responses should replace the matching loaded row when present.

When a mutation changes ordering, schema, visibility, or permissions, keep using
the existing invalidation path instead of trying to infer page membership from a
single-row response.
