# Sync Topic Policy

Use this guidance when changing realtime sync-topic delivery, TanStack Query
invalidation caused by sync topics, or mutation workflows that may receive their
own realtime echo.

## Core Pattern

Sync topics are a remote-client and stale-tab correctness mechanism. They are
not the way the initiating client learns that its own mutation completed.

Prefer this sequence:

1. The initiating workflow completes from a rich mutation response and targeted
   cache reconciliation.
2. The cache adapter records a short-lived local reconciliation marker for the
   affected sync topic.
3. Realtime sync delivery resolves the topic to query targets and applies the
   topic policy.
4. Matching local echoes are downgraded to stale-only validation instead of
   active refetch.
5. Remote clients without a local marker still follow the topic policy.

## Invalidation Modes

Sync-topic delivery should choose one of these modes per query target:

- `active`: mark matching queries stale and refetch active observers.
- `stale`: mark matching queries stale without immediate refetch.
- `skip`: ignore the event when the client has no matching local concern.

Use `stale` for secondary data where freshness is needed on next access but an
immediate network request would not improve the current screen. Use `active`
when the affected data is likely visible and users expect near-realtime updates.

## Current Topic Policy

- `database-rows`: prefix target, active by default. Recent local
  reconciliation downgrades the echo to stale-only.
- `form-responses`: exact row-response target, active by default. Recent local
  reconciliation downgrades the echo to stale-only.
- `database-meta`: table-meta prefix target, active only when observed;
  stale-only when inactive. Recent local reconciliation downgrades active echoes.
- `database-forms`: forms prefix target, active only when observed; stale-only
  when inactive.
- `settings-databases` and `settings-members`: exact settings targets,
  stale-only by default.
- `community-shell`: exact shell target, active by default because the shell and
  sidebar are normally visible. Recent local reconciliation downgrades the echo
  to stale-only.

When adding a sync topic, decide both the query target and the invalidation mode.
Do not rely on TanStack Query's default invalidation behavior implicitly.

## Local Echo Suppression

Local reconciliation markers are heuristic optimization, not correctness logic.
They should be short-lived and scoped to `{ topic, resourceId }`. A matching
event may avoid active refetch, but it should still mark the query stale unless
the topic has a separate exact-version correctness rule.

Do not use client timestamps or TanStack `dataUpdatedAt` to prove freshness.
The durable version-aware path is server-controlled monotonic sync versions, and
mutation responses must return the same sync version before the initiating
client can treat a realtime event as already represented by its cache.

## Instrumentation

Sync-topic delivery should record enough information to answer:

- which topic/resource/version was received;
- which query keys were affected;
- how many matching queries were active;
- whether the event requested active refetch or stale-only validation;
- whether the event matched recent local reconciliation;
- whether same-tick coalescing deduped the invalidation.

Keep this instrumentation available to tests and development diagnostics. It
should not become product analytics unless a separate analytics decision is
made.

## Red Flags

- Debouncing sync delivery before measuring duplicate invalidations.
- Treating row-specific topics as exact cache ownership when the row can appear
  in multiple filtered, inline, seeded, or parent-scoped collections.
- Adding correlation IDs without threading them through mutation APIs,
  `bumpSyncTopics`, persistence, and realtime handling.
- Making a mutation workflow wait for its own sync topic.
- Adding broad active invalidation for settings, inactive forms, or shell data
  that is already patched by a cache adapter.
