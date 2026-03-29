# Table Drag Sorting Story Design

**Date:** 2026-03-24

## Goal
Add Storybook examples for the existing `Table` component that demonstrate row drag sorting in two interaction modes:
- handle-only drag
- full-row drag

The examples should follow the existing `demo/` pattern used by components like Button instead of placing all demo logic directly inside `table.stories.tsx`.

## Context
- The current table stories in `@acme/ui/src/components/table/table.stories.tsx` cover basic rendering, selection, pagination, loading, and empty states, but do not show drag sorting.
- The table package already contains sortable row primitives in `@acme/ui/src/components/table/_components/table-sortable-row.tsx`, specifically `TableRowSortable` and `DragHandle`.
- The repository already uses colocated demo files for reusable story examples, for example in `@acme/ui/src/components/button/demo/` with `button.stories.tsx` importing those demos.
- The user explicitly asked to create the new example files under `@acme/ui/src/components/table/demo/` following that pattern.

## Chosen Approach
Add two standalone demo components under `@acme/ui/src/components/table/demo/` and expose them through `table.stories.tsx`.

### Why this approach
- Keeps `table.stories.tsx` focused on story registration instead of embedding drag-and-drop setup code.
- Matches the existing component-library convention used by Button and other reusable examples.
- Reuses the existing sortable row primitives instead of introducing a new table API.
- Limits the scope to Storybook examples only, which matches the current request.

## File Changes
### New files
- `@acme/ui/src/components/table/demo/drag-sorting-with-handle.tsx`
- `@acme/ui/src/components/table/demo/drag-sorting-full-row.tsx`

### Updated files
- `@acme/ui/src/components/table/table.stories.tsx`

### No changes in this pass
- `@acme/ui/src/components/table/table.tsx`
- `@acme/ui/src/components/table/types.ts`
- `@acme/ui/src/components/table/table.mdx`

## Story Structure
`table.stories.tsx` should import the new demo components and expose two stories:

1. `DragSortingWithHandle`
   - renders the handle-based demo component
2. `DragSortingFullRow`
   - renders the full-row drag demo component

This keeps the story file aligned with the pattern already used in `button.stories.tsx`, where more complex examples are imported from `demo/` files.

## Demo Design
### 1. Handle-only drag demo
The handle-based demo should:
- render a table with a dedicated drag handle column at the start of the column list
- render `DragHandle` inside that column
- use `TableRowSortable` for `components.body.row`
- pass `asHandle={false}` so dragging is only activated from the handle
- manage reordered table state locally inside the demo component

This should be the safer and more realistic example because row links and actions remain less likely to conflict with drag gestures.

### 2. Full-row drag demo
The full-row demo should:
- reuse the main example columns without adding a drag handle column
- use `TableRowSortable` for `components.body.row`
- pass `asHandle={true}` so the whole row acts as the drag activator
- manage reordered table state locally inside the demo component

This example exists to show the alternate interaction model and its tradeoff with interactive cell content.

## Drag-and-drop Behavior
Each demo should be self-contained and handle its own state.

Recommended setup:
- use `DndContext` from `@dnd-kit/core`
- use `SortableContext` and a vertical sorting strategy from `@dnd-kit/sortable`
- identify rows by the existing `key` field in the demo data
- update `dataSource` order on successful drop using the active and target row keys

The reorder logic should stay local to each demo file. Do not add a shared abstraction unless implementation shows that duplication becomes excessive.

## Data and Columns
- Use the existing story dataset shape with `key`, `name`, `age`, `address`, and `tags`.
- Keep the examples realistic and close to the current table stories so the new stories feel consistent with the rest of the table examples.
- The handle-only demo may prepend a small drag column; the full-row demo should keep the base columns unchanged.

## Non-goals
- Do not add a new public `sortable` or `dragSort` API to `Table`.
- Do not refactor table internals.
- Do not persist reordered state outside the Storybook demo.
- Do not update table docs in `table.mdx` in this pass.
- Do not add extra abstractions beyond what is necessary for the two demo files and story registration.

## Risks and Tradeoffs
- Full-row drag may compete with interactive cell content such as links and actions already present in the example columns.
- That tradeoff is acceptable here because the story is meant to demonstrate interaction modes, not define a production-ready drag contract for the table component.
- Handle-only drag is expected to be the cleaner default example.

## Verification
Manual verification is sufficient for this request:
- run Storybook for `@acme/ui`
- confirm both new stories render under `Components/Table`
- verify rows can be reordered in the handle-only story only by grabbing the handle
- verify rows can be reordered in the full-row story by dragging anywhere on the row
- confirm the table still renders interactive cell content correctly after reordering

## Notes
- Keep the implementation minimal and example-focused.
- Prefer the established `demo/` organization over introducing shared helpers unless they are clearly justified during implementation.
- The change should improve discoverability of existing sortable-row primitives without turning drag sorting into an official table feature yet.
