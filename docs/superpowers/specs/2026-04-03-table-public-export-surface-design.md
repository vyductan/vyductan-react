# Table Public Export Surface Design

## Goal
Expand `@acme/ui/components/table` so consumers can import the stable table composition primitives they are expected to use, without importing from private `_components` paths.

## Scope
Add these named exports to the public table barrel in `packages/ui/src/components/table/index.tsx`:
- `TableToolbarRoot`
- `TableToolbarLeft`
- `TableToolbarRight`
- `TableViewOptions`
- `TableSummary`
- `TableSummaryRow`
- `TableSummaryCell`
- `TableRowSortable`
- `DragHandle`

## Non-goals
Do not expose internal rendering or layout machinery that is tightly coupled to the table implementation, including:
- `ColGroup`
- `TableHeadAdvanced`
- `FixedHolder`
- `table-header`
- `expand-icon`
- `table-summary-context`
- `TableWrapperHeader`
- `TableWrapperFooter`

## Rationale
These exports fall into two consumer-facing groups:
1. Composition primitives used to assemble table UI around the main `Table` component, such as toolbar and summary building blocks.
2. Drag-sort primitives (`TableRowSortable`, `DragHandle`) that allow consumers to compose row reordering behavior without depending on private paths.

The excluded items are implementation details of the table renderer. Exporting them would unnecessarily freeze internal DOM, layout, and state-management structure into the package's supported public API.

## Implementation
1. Extend the table public API regression test in `packages/ui/src/components/table/table.test.tsx` to assert the presence of all approved named exports.
2. Run the targeted unit test and confirm it fails because the new exports are missing.
3. Add the approved exports to `packages/ui/src/components/table/index.tsx` using the existing `_components` barrel.
4. Re-run the targeted unit test and confirm it passes.

## Verification
Use the unit test in `packages/ui/src/components/table/table.test.tsx` as the public API contract check for these exports. Avoid expanding scope into unrelated table behavior or existing unrelated test failures.
