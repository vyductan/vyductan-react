# Table Public Export Surface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose the approved consumer-facing table composition primitives from `@acme/ui/components/table` without exposing internal table rendering machinery.

**Architecture:** Keep the implementation constrained to the public table barrel and the existing table public API regression test. First extend the test so it fails on the missing drag-sort exports, then add the minimal re-export change through the existing `_components` barrel.

**Tech Stack:** TypeScript, React, Vitest

---

## File map

- Modify: `packages/ui/src/components/table/table.test.tsx` — public API contract test for the table module
- Modify: `packages/ui/src/components/table/index.tsx` — public export surface for `@acme/ui/components/table`
- Reference only: `packages/ui/src/components/table/_components/index.tsx` — existing internal barrel that already exposes `TableRowSortable` and `DragHandle`
- Reference only: `docs/superpowers/specs/2026-04-03-table-public-export-surface-design.md` — approved scope and non-goals

### Task 1: Extend the public API regression test

**Files:**
- Modify: `packages/ui/src/components/table/table.test.tsx:97-105`
- Test: `packages/ui/src/components/table/table.test.tsx`

- [ ] **Step 1: Write the failing test**

Update the existing public API assertion so it also requires the drag-sort primitives:

```ts
test("re-exports useful table subcomponents", () => {
  expect(tableModule).toHaveProperty("TableToolbarRoot");
  expect(tableModule).toHaveProperty("TableToolbarLeft");
  expect(tableModule).toHaveProperty("TableToolbarRight");
  expect(tableModule).toHaveProperty("TableViewOptions");
  expect(tableModule).toHaveProperty("TableSummary");
  expect(tableModule).toHaveProperty("TableSummaryRow");
  expect(tableModule).toHaveProperty("TableSummaryCell");
  expect(tableModule).toHaveProperty("TableRowSortable");
  expect(tableModule).toHaveProperty("DragHandle");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/packages/ui" exec vitest --project unit src/components/table/table.test.tsx -t "re-exports useful table subcomponents"
```

Expected: FAIL with an assertion that `TableRowSortable` or `DragHandle` is missing from the table module export surface.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/table/table.test.tsx
git commit -m "test: cover table drag-sort public exports"
```

### Task 2: Add the approved public exports

**Files:**
- Modify: `packages/ui/src/components/table/index.tsx:43-51`
- Reference only: `packages/ui/src/components/table/_components/index.tsx`
- Test: `packages/ui/src/components/table/table.test.tsx`

- [ ] **Step 1: Write minimal implementation**

Extend the existing `_components` re-export block in the public barrel to include only the approved drag-sort primitives:

```ts
export {
  DragHandle,
  TableRowSortable,
  TableSummary,
  TableSummaryCell,
  TableSummaryRow,
  TableToolbarLeft,
  TableToolbarRight,
  TableToolbarRoot,
  TableViewOptions,
} from "./_components";
```

Do not add any other `_components` exports.

- [ ] **Step 2: Run test to verify it passes**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/packages/ui" exec vitest --project unit src/components/table/table.test.tsx -t "re-exports useful table subcomponents"
```

Expected: PASS with the single targeted export-surface test green.

- [ ] **Step 3: Run a focused type-safety check for the edited files**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/packages/ui" exec tsc --noEmit --pretty false 2>&1 | rg "src/components/table/(index|table\.test)\.tsx" || true
```

Expected: no output for `src/components/table/index.tsx` or `src/components/table/table.test.tsx`.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/components/table/index.tsx packages/ui/src/components/table/table.test.tsx
git commit -m "feat: export table drag-sort primitives"
```

## Self-check against spec

- Spec coverage: the plan covers all approved public exports from the spec, including `TableRowSortable` and `DragHandle`, and explicitly excludes the non-goal internal render helpers.
- Placeholder scan: no TODO/TBD placeholders remain; every code-changing step includes concrete code and commands.
- Type consistency: the names used in tests and exports match the current `_components` barrel names exactly: `TableRowSortable` and `DragHandle`.
