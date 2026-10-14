# Mutation Cache Reconciliation

Use this guidance when changing mutations, optimistic updates, mutation response
shapes, TanStack Query cache updates, invalidation, or realtime sync behavior.

## Core Pattern

Prefer server-authoritative optimistic state for common row mutations:

1. Apply the smallest optimistic local update that makes the interaction feel
   immediate.
2. Send the mutation to the server.
3. Return the smallest authoritative UI projection that fully represents the
   changed resource.
4. Replace the affected active cache entry from that server result.
5. Avoid an immediate broad refetch when the returned projection is sufficient.

For common row mutations, the changed resource is usually one
`DatabaseTableRow`. The server should return the same row shape used by table
reads, not a thin persistence result such as only `{ id, lastEditedAt }`.

## Row Projection Contract

Table reads and row mutation responses must share the same server-side row
projection. Do not hand-build a mutation-only row shape in an action or route.

Current row projection flow:

```text
EntityRow
-> buildDatabaseTableRows
-> flattenEntityData
-> hydrateEntityReferences
-> DatabaseTableRow
```

Use the batch projection for table reads so reference hydration stays batched and
does not become N+1 work. Single-row mutation responses may call the same batch
projection with one row.

## When To Reconcile Directly

Direct cache reconciliation is appropriate when the mutation changes one row and
the server returns an authoritative row for the same active table scope.

Good candidates:

- Entity rename: optimistically patch the name, then replace the row from the
  mutation response.
- Cell edit: optimistically patch the cell, then replace the row from the
  mutation response.
- Row create: insert a temporary row, then replace it with the server-produced
  row.
- Inline page create: use the same temporary-row replacement pattern.
- Form answer save: keep returning the authoritative form response for the
  initiating client.

Keep a fallback invalidation path when a legacy response has no row or a caller
does not own a targeted cache adapter.

## Cache Ownership

Mounted production flows should own the cache adapter for the visible resource
they mutate. Table and entity surfaces should receive scoped `TableRowsCache`
and `TableMetaCache` adapters where applicable. Settings database/property
surfaces should receive the settings databases cache adapter. Form builder and
form lifecycle surfaces should receive the database forms cache adapter. Share,
member, profile, and shell flows should receive their scoped cache
adapters when they patch those resources.

Missing cache ownership is acceptable for isolated tests, harnesses, legacy
entrypoints, or surfaces that intentionally navigate away before the mutated
state is visible. In those cases, the fallback must go through the centralized
invalidation failsafe with an explicit reason. Do not use optional cache
branches as the normal production completion path.

Cache adapters should expose domain operations, not generic cache access. Prefer
methods such as `patchRowName`, `patchRowAvatarToken`, `replaceProperty`,
`removeDatabase`, `replaceForm`, `removeForm`, or `setCurrentActivityName` so
workflows describe the interaction they are reconciling.

When a cache adapter has already patched the initiating client's visible state,
any remaining validation should be stale-only unless the current screen truly
needs a realtime active refetch. This applies to settings/property projections,
database forms, and secondary shell/sidebar effects.

## When To Keep Broad Invalidation

Do not force every mutation into row reconciliation. Apply the same principle at
the correct resource boundary: return the smallest authoritative UI projection
that fully represents the changed resource.

Broad invalidation is still the right default for:

- Schema/property changes, because they can affect columns, formatting,
  validation, sorting, forms, settings views, and many row values.
- Permission and share changes, because they can affect row visibility, edit
  flags, available actions, shell state, collaborators, and whether cached rows
  should exist at all.
- Reordering and sort changes, because collection membership and order are list
  concerns, not single-row concerns.
- Deletes, unless the current interaction can prove optimistic removal plus a
  narrow server result is enough. Prefer background validation after delete.

## Sync Boundary

Realtime sync should remain a background correctness and remote-client
invalidation mechanism unless a separate sync design explicitly changes it.

The initiating client should not depend on a sync topic to finish a common row
mutation. It should use the mutation response for immediate reconciliation and
let broad sync topics protect stale tabs and other clients.

When a cache adapter reconciles a mutation locally, it should record the matching
sync topic/resource so an immediate realtime echo can be downgraded from active
refetch to stale-only validation. See `sync-topic-policy.md` for the sync
delivery policy and instrumentation rules.
