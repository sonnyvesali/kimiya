# Server Feature Boundaries

Use this guidance when changing SvelteKit server routes, `$lib/server`
workflows, repositories, policies, form parsers, analytics side effects, or sync
topic sequencing.

## Core Pattern

Server routes should be thin adapters. They should read route params, authorize
the request, call named form/parser functions, call a named workflow, and map
expected errors to HTTP responses.

Move orchestration into `$lib/server` workflows when a route starts owning
several of these concerns:

- request payload branching or normalization;
- multiple domain commands for one user interaction;
- analytics capture;
- sync-topic selection or bumping;
- response view-model selection;
- expected error mapping that is shared across methods.

## Parser And Workflow Boundaries

Put raw request parsing in `form/` modules with names such as
`parseEntityShareTargetsRequest`. These modules should return typed command
inputs and throw typed expected errors. They should not authorize, write to the
database, capture analytics, or bump sync topics.

Put request-level sequencing in `workflows/` modules with names such as
`applyEntityShareTargets`. These workflows may call repositories, lower-level
domain workflows, analytics helpers, and sync-topic utilities when those
side-effects are part of completing the user interaction.

Expose parser and workflow functions through the feature facade when that keeps
route imports readable. Avoid exposing repositories or policy internals from the
facade unless tightly coupled server internals or tests need them.

## Repository And Projection Boundaries

Repositories should primarily own persistence. Split a repository before it
becomes the owner of CRUD commands, versioning rules, row-to-view projection,
default record construction, and request normalization.

Use focused projection modules for row-to-view model mapping when table reads,
detail reads, and mutation responses need the same shape. Use `constants/` for
static defaults such as initial field definitions. Keep repository files
scanable by persistence concern rather than collecting every helper a feature
uses.

## Red Flags

- A `+server.ts` parses several payload shapes, loops domain commands, captures
  analytics, bumps sync topics, and builds the response directly.
- A repository combines persistence, version restoration, UI projection, default
  payload construction, and config normalization in one file.
- A route deep-imports repositories or policies even though a named feature
  workflow would describe the user interaction more clearly.
- Analytics and sync-topic side effects are duplicated across route methods for
  the same interaction.
