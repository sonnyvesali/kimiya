# Persisted Mode Configuration

Use this pattern when an editor has mutually exclusive modes whose configurations should survive switching, refreshes, sessions, and devices. Saved relationship views and property type option history are examples of the same persistence concern.

## Canonical Active State

Store the active mode and its operational configuration in the existing canonical columns or normalized tables. Reads that execute the feature, such as saved-view graph loading, use only this canonical active state.

Store inactive mode configurations as a versioned JSON history payload. History exists only to restore a mode when it becomes active; it must not participate in operational queries while inactive.

## Synchronization

Mirror the active configuration into its matching history entry on every editor mutation. A mode switch restores the target history entry, makes it canonical, and saves both canonical state and history together.

Mutation responses must return authoritative history alongside the active configuration. Reconcile both through the feature's existing optimistic cache workflow, and roll both back to the last confirmed response when persistence fails.

## Server Boundaries

Parse and validate the versioned payload at the request boundary. Each history entry must match the mode named by its key, and every referenced resource must belong to the current community.

Sanitize history on reads against the editor choices that currently exist. Remove references to deleted or unavailable tables, groups, fields, and comparison groups. Remove colors for fields that are no longer selected. Preserve the rest of each valid configuration so unrelated schema changes do not discard useful history.

Legacy configurations remain canonical and do not gain guided-mode history until the user explicitly converts them to guided setup.
