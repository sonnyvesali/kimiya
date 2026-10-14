# Interaction Completion

Use this guidance when changing workflows that open, close, save, navigate,
delete, invite, reorder, or otherwise need to decide when the user interaction
is complete.

## Core Pattern

The initiating client should finish the visible interaction from local state,
targeted cache reconciliation, or the mutation response.

Prefer this sequence:

1. Apply the smallest local state or cache change needed for immediate feedback.
2. Send the server request.
3. Reconcile from the authoritative response when the response fully represents
   the affected visible resource.
4. Complete the user-visible interaction, such as closing a dialog, clearing a
   pending state, or navigating.
5. Start broad refetches or sync-topic invalidation as background correctness
   work when they are still useful.

Do not make a user wait for `invalidateAll()` or a broad active refetch after a
successful mutation when the current screen already has enough data to render the
correct next state.

## Completion Signals

A workflow can complete from:

- a server-returned UI projection, such as `DatabaseTableRow`, `DatabaseForm`,
  `SettingsDatabase`, `DatabaseProperty`, `ShareState`, or `ReminderState`;
- a targeted cache patch with a rollback handle;
- a local overlay state that is intentionally reconciled by a later query;
- navigation to a different route where the destination load will own the next
  authoritative read.

When a mutation response is too thin, either keep the broad fallback or change
the endpoint to return the smallest authoritative projection needed by the
initiating screen.

## Background Validation

Use background validation for correctness after the interaction has visibly
completed:

- call targeted cache adapter invalidation without awaiting it;
- call `queryClient.invalidateQueries` with `void` when the user does not need
  the refetch to finish before continuing;
- preserve `invalidateAll()` only as a fallback for callers that do not have a
  narrower cache owner yet.

Background validation should not overwrite pending optimistic scopes. Use the
shared optimistic mutation helpers when the same cached data can be patched by
multiple overlapping mutations.

## Invalidation Failsafe

`invalidateAll()` is a centralized failsafe, not an ordinary workflow
dependency. Client code outside `src/lib/client/query/invalidation-failsafe.ts`
must not import it directly.

When a fallback is still needed, pass a `failsafeInvalidate` dependency and call
it with a concrete `reason`, `source`, and useful metadata. Treat development or
test warnings from this failsafe as a signal that a mounted flow may be missing
cache ownership or that a legacy response is still too thin to reconcile
directly.

Do not add new raw `invalidateAll?: () => Promise<void>` workflow inputs. Prefer
targeted cache adapters as the normal completion path and reserve
`failsafeInvalidate` for explicit legacy or harness-only fallback paths.

## When To Wait

It is still appropriate to block completion when:

- the next visible state cannot be known without the server result;
- the mutation controls authorization, membership, permissions, or visibility in
  a way that may invalidate the current screen;
- the server may reject or transform the action in a way that cannot be safely
  represented optimistically;
- a route navigation depends on an identifier returned by the server;
- a destructive action needs confirmed persistence before removing access to the
  rollback UI.

Even in these cases, wait for the narrow server response, not a broad refetch,
unless the broad refetch is the only available source of truth.

## Red Flags

- A successful mutation awaits `invalidateAll()` before closing a dialog,
  clearing a spinner, or navigating.
- A workflow patches a query and then immediately waits for a broad refetch of
  the same data.
- A mutation returns `{ success: true }` while the caller refetches a rich view
  model that the server could have returned directly.
- A mounted production component relies on a missing-cache fallback instead of
  receiving the relevant cache adapter from its route or parent surface.
- A workflow accepts or calls a raw `invalidateAll` dependency instead of the
  centralized failsafe.
- A loop sends several independent mutation requests sequentially when a batch
  command endpoint or parallel-safe reconciliation would produce one visible
  completion.
- Sync topics are treated as the way the initiating client learns that its own
  mutation succeeded.

## Relationship To Other Guidance

Read `data-loading.md` when the latency comes from opening or bootstrapping a
read surface. Read `mutation-cache-reconciliation.md` when the latency comes
from saves, creates, deletes, or cache invalidation after mutation success.
