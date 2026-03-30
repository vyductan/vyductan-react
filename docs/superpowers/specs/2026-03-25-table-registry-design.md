# Table Registry Design

## Goal
Add the `table` component to the local `@acme/ui` shadcn registry in a way that matches the current repository’s real build flow, keeps the published registry focused on production runtime files, and avoids reintroducing multiple competing registry manifests.

## Context
The current registry build flow is driven by [`@acme/ui/package.json:13`](../../../@acme/ui/package.json#L13):

```json
"registry:build": "cd src && pnpm dlx shadcn build ./registry.json -o ../public/registry"
```

That means the active source manifest is [`@acme/ui/src/registry.json`](../../../@acme/ui/src/registry.json). During exploration, the extra manifest at `@acme/ui/src/registry/registry.json` was identified as redundant for this repo’s build path and removed. The registry design should therefore stay centered on the single top-level manifest.

Reference review also showed that:

- the official shadcn docs describe a top-level `registry.json` whose `items` are defined inline and whose entries follow the `registry-item.json` schema.
- `refs/ui` uses a more elaborate TypeScript-driven registry authoring system that composes many `_registry.ts` files and then generates JSON output. That setup is useful as a reference for separation of concerns, but it is not the mechanism used in `@acme/ui` today.

## Decisions

### 1. Keep a single source-of-truth manifest
The source of truth remains [`@acme/ui/src/registry.json`](../../../@acme/ui/src/registry.json).

This work must not introduce or depend on a second registry manifest or an implicit merge process for `src/registry/*.json`. If the project eventually wants a generated or multi-file registry authoring model, that should be a separate change with its own design and build wiring.

### 2. Add `table` as an inline registry item
The new registry entry should be added directly to the `items` array in [`@acme/ui/src/registry.json`](../../../@acme/ui/src/registry.json).

This aligns with both:
- the current local build script, and
- the official shadcn registry JSON documentation.

### 3. Publish the table component as “core only”
The `table` item should cover production runtime code only.

Included scope:
- the public entry used to consume the table component
- the internal runtime files required for that entry to compile and function
- any table-local runtime helpers that are actually required by the registry item

Excluded scope:
- Storybook stories
- `demo/` examples
- play tests
- test-only files
- drag-sorting demo setup that exists only for examples or story interaction coverage

The design goal is to make the registry installable without dragging along documentation/demo assets.

### 4. Publish a narrow table-specific public surface
Although [`@acme/ui/src/components/table/table.tsx`](../../../@acme/ui/src/components/table/table.tsx) contains the main implementation of `OwnTable`, the current public entry at [`@acme/ui/src/components/table/index.tsx`](../../../@acme/ui/src/components/table/index.tsx) re-exports more than the approved “table core only” surface, including locale files and all table `_components`.

For this registry item, the public contract must stay narrow: the exported `Table` component and the table types that are intentionally part of core consumption. The implementation phase is allowed to introduce or use a narrower registry-facing entry file if needed so that the registry item does not accidentally publish every current re-export from `components/table/index.tsx`.

This keeps the registry aligned with the approved scope instead of letting an overly broad local barrel file define the published API by accident.

### 5. Expand file coverage only as far as runtime demands
The item should not guess at a massive file list up front. Instead, it should include the public entry plus the runtime table files that are clearly part of the core component boundary.

However, build success alone is not enough to prove the item is dependency-complete. The implementation must first trace the import/dependency closure of the public table entry, then use the registry build as a second verification step. This keeps the registry item accurate without over-bundling unrelated implementation details.

### 6. Handle non-local dependencies explicitly
Imports that fall outside `components/table/*` must be classified deliberately rather than guessed at during implementation.

Each dependency reached from the public table entry must be accounted for as exactly one of:
- a package dependency that is expected to come from `package.json`
- a table-local source file that belongs in the `files` list
- an existing local registry item that should be referenced through `registryDependencies`
- a non-local shared source dependency that is outside the approved scope and must be surfaced as a blocker instead of silently bundled

This prevents the implementation from accidentally pulling broad shared subsystems into the `table` item just to make the build pass.

## Proposed Registry Shape
The new item will be a `registry:component` named `table` in [`@acme/ui/src/registry.json`](../../../@acme/ui/src/registry.json).

At a minimum, its shape should be anchored around a registry-facing public table entry and explicit external dependencies. The implementation phase will determine the exact entry file and internal runtime files that must accompany it, but the shape should conceptually look like:

```json
{
  "name": "table",
  "title": "Table",
  "path": "components/table",
  "type": "registry:component",
  "dependencies": ["@tanstack/react-table", "ahooks", "lodash"],
  "files": [
    {
      "path": "components/table/index.tsx",
      "target": "components/table/index.tsx",
      "type": "registry:file"
    }
  ]
}
```

That example is intentionally conceptual rather than final. The actual implementation may swap `components/table/index.tsx` for a narrower registry-facing entry file, and the final `dependencies` / `files` arrays must be derived from the reviewed runtime closure instead of copied from this example verbatim.

## Expected File Boundaries

### Files likely to be part of the runtime boundary
These are the categories that the implementation should evaluate for inclusion:
- `components/table/index.tsx`
- `components/table/table.tsx`
- runtime `_components` used by the core table implementation
- runtime `hooks` used by the table implementation
- runtime types/utilities that are required for the component to compile and run

### Non-local dependency rule
For imports outside `components/table/*`, the implementation must apply these rules:
- shared package imports must be represented explicitly in the registry item `dependencies` field when they are required for consumers of the published table item
- files already covered by another intentional local registry item should be modeled through `registryDependencies` when that relationship is valid
- shared local source files that are not already modeled as registry dependencies must not be pulled in casually; if `table` cannot stand on its own without bundling broad shared internals, that should be reported clearly before expanding scope
- no non-local file should be added only because it happens to make the build pass; it must be justified as part of the approved runtime boundary

### Files explicitly out of boundary
These must stay out of the registry item unless a direct runtime dependency proves otherwise:
- `components/table/table.stories.tsx`
- `components/table/demo/*`
- `components/table/*.test.*`
- Storybook-only drag sorting helpers
- regression test artifacts for the table drag sorting fix

## Validation Plan
The implementation should validate the registry shape in two stages rather than assuming the build alone will prove correctness.

Stage 1: dependency-closure review
- trace the public table entry’s import graph
- classify every reached dependency using the dependency rules in this spec
- produce the initial `files` list from that reviewed runtime closure instead of from trial and error

Stage 2: registry build verification

Primary verification command:

```bash
cd "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" && pnpm registry:build
```

Validation checks:
1. the traced runtime closure is reflected in the manifest
2. the registry build completes successfully
3. the generated registry output contains a `table` item
4. the generated `table` item contains only intended runtime files
5. no story, demo, or test assets leak into the published registry item
6. if verification reveals a missing runtime file, the manifest is expanded by the smallest necessary amount and the build is re-run
7. if verification reveals that `table` depends on broad non-local shared internals, that scope issue is surfaced explicitly instead of silently broadening the item

## Risks and Constraints
- The `table` module is more complex than `tree`, so a one-file manifest may be too small.
- The `table` public entry re-exports internal functionality, so the registry item must respect the real runtime dependency graph.
- Over-including files would make the registry noisy and harder to maintain.
- Under-including files would make the generated registry item incomplete.

The implementation should therefore optimize for correctness first, then tighten scope to the minimal runtime set.

## Non-Goals
This design does not attempt to:
- migrate `@acme/ui` to the TypeScript-authored registry architecture used by `refs/ui`
- introduce a registry composition pipeline for `src/registry/*.json`
- publish Storybook demos as registry examples
- refactor the table component architecture beyond what is needed to define the registry boundary

## Implementation Handoff
The next phase should produce a concrete implementation plan that:
- identifies the exact runtime table files to include
- updates [`@acme/ui/src/registry.json`](../../../@acme/ui/src/registry.json)
- runs `pnpm registry:build`
- inspects the generated output
- adjusts the file list only if the generated registry proves the initial boundary was incomplete
