# Table Registry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a core-only `table` registry item to `@acme/ui` so the existing shadcn registry build publishes the Table component without demos, stories, or tests.

**Architecture:** Keep `@acme/ui/src/registry.json` as the only source-of-truth manifest. First trace the runtime dependency closure for the table public surface, then add a narrow `table` registry item with explicit package dependencies and only the required source files. Finally, build the registry and inspect the generated output to confirm the published item matches the approved boundary.

**Tech Stack:** shadcn registry JSON, TypeScript, React, pnpm, TanStack Table, ahooks, lodash

---

## File Structure

### Existing files to modify
- `@acme/ui/src/registry.json`
  - Add the new inline `table` registry item.

### Existing files to reference during implementation
- `@acme/ui/package.json`
  - Reference only for the existing `registry:build` script and package dependency names.

### Existing files to inspect during implementation
- `@acme/ui/src/components/table/index.tsx`
- `@acme/ui/src/components/table/types.ts`
- `@acme/ui/src/components/table/styles.ts`
- `@acme/ui/src/components/table/util.tsx`
- `@acme/ui/src/components/table/_components/index.tsx`
- `@acme/ui/src/components/table/_components/base.tsx`
- `@acme/ui/src/components/table/_components/col-group.tsx`
- `@acme/ui/src/components/table/_components/table-head-advanced.tsx`
- `@acme/ui/src/components/table/hooks/use-columns.tsx`
- `@acme/ui/src/components/table/hooks/use-expand.tsx`
- `@acme/ui/src/components/table/hooks/use-filter.tsx`
- `@acme/ui/src/components/table/hooks/use-lazy-kv-map.ts`
- `@acme/ui/src/components/table/hooks/use-pagination.tsx`
- `@acme/ui/src/components/table/hooks/use-sorter.tsx`
- `@acme/ui/src/components/table/hooks/use-table.tsx`
- `@acme/ui/src/components/table/locale/en-us.ts`
- `@acme/ui/src/components/table/locale/vi-vn.ts`

### Files that may need to be created
- `@acme/ui/src/components/table/registry.tsx`
  - Create this only if `components/table/index.tsx` is too broad for the approved `table core only` public surface.

### Generated output to inspect
- `@acme/ui/public/registry/registry.json`
  - Confirm the built registry index contains the new `table` item.
- `@acme/ui/public/registry/table.json`
  - Confirm the built table item resolves to the intended files and excludes stories, demos, and tests.

### Design reference files
- `docs/superpowers/specs/2026-03-25-table-registry-design.md`

---

### Task 1: Trace the table runtime boundary

**Files:**
- Modify: none
- Inspect: `@acme/ui/src/components/table/index.tsx`
- Inspect: `@acme/ui/src/components/table/table.tsx`
- Inspect: `@acme/ui/src/components/table/types.ts`
- Inspect: `@acme/ui/src/components/table/styles.ts`
- Inspect: `@acme/ui/src/components/table/util.tsx`
- Inspect: `@acme/ui/src/components/table/_components/index.tsx`
- Inspect: `@acme/ui/src/components/table/_components/base.tsx`
- Inspect: `@acme/ui/src/components/table/_components/col-group.tsx`
- Inspect: `@acme/ui/src/components/table/_components/table-head-advanced.tsx`
- Inspect: `@acme/ui/src/components/table/hooks/use-columns.tsx`
- Inspect: `@acme/ui/src/components/table/hooks/use-expand.tsx`
- Inspect: `@acme/ui/src/components/table/hooks/use-filter.tsx`
- Inspect: `@acme/ui/src/components/table/hooks/use-lazy-kv-map.ts`
- Inspect: `@acme/ui/src/components/table/hooks/use-pagination.tsx`
- Inspect: `@acme/ui/src/components/table/hooks/use-sorter.tsx`
- Inspect: `@acme/ui/src/components/table/hooks/use-table.tsx`
- Inspect: `@acme/ui/src/components/table/locale/en-us.ts`
- Inspect: `@acme/ui/src/components/table/locale/vi-vn.ts`
- Inspect: `@acme/ui/package.json`
- Test: none

- [ ] **Step 1: Read the spec again before touching code**

Read: `docs/superpowers/specs/2026-03-25-table-registry-design.md`
Expected: clear reminder of scope: core-only table registry item, no stories, demos, or tests.

- [ ] **Step 2: Read the current public table entry**

Read: `@acme/ui/src/components/table/index.tsx`
Expected: confirm whether the current barrel file exports only the intended public contract or whether it leaks locale and `_components` exports.

- [ ] **Step 3: Read the main table implementation imports**

Read: `@acme/ui/src/components/table/table.tsx`
Expected: identify package imports and local imports that drive the runtime closure.

- [ ] **Step 4: Review the existing registry items before classifying dependencies**

Read: `@acme/ui/src/registry.json`
Expected: know which local items already exist so `registryDependencies` decisions are based on the current manifest rather than guesses.

- [ ] **Step 5: Resolve and read every non-local source file reached from the import graph before classifying it**

For each source import that falls outside `@acme/ui/src/components/table/`, resolve its exact file path and read that file before classifying it as:
- package `dependencies`
- local `registryDependencies`
- or a non-local shared source blocker

Expected: no non-local source dependency is classified from guesswork alone.

- [ ] **Step 6: Stop immediately if Task 1 found a non-local shared source blocker**

If the dependency review discovered a broad non-local shared source dependency that is not already represented by a valid `registryDependencies` entry, stop before editing `@acme/ui/src/registry.json` and surface that blocker.

Expected: either a clear blocker report, or confirmation that Task 2 may proceed without widening scope.

- [ ] **Step 7: Decide whether a narrower registry-facing entry file is required**

Decision rule:
- If `@acme/ui/src/components/table/index.tsx` can be used without exposing extra API surface, reuse it.
- If it is too broad, create `@acme/ui/src/components/table/registry.tsx` as a narrow entry that exports only the approved `Table` surface and table-core types.

Expected: a single chosen public entry file for the registry item.

- [ ] **Step 8: Draft the `table` registry item payload before editing the manifest**

Draft the exact `table` item payload to be inserted into `@acme/ui/src/registry.json`, including:
- the chosen registry-facing public entry file
- the exact `dependencies` array
- the exact `files` array
- any `registryDependencies` entries if Task 1 proved they exist and are valid

Expected: one concrete registry item payload ready to paste into the manifest.

- [ ] **Step 9: Check the draft payload against the exclusion rules before editing the manifest**

Confirm the drafted `files` array includes none of these:
- any file ending in `.stories.tsx`
- any file under `@acme/ui/src/components/table/demo/`
- any test file under `@acme/ui/src/components/table/`
- `@acme/ui/src/components/table/_components/table-sortable-row.tsx` unless the reviewed runtime closure proved it is part of the approved core boundary
- `@acme/ui/src/components/table/table-container-overflow.test.ts`

Expected: the draft payload is already within the approved scope before it is added to the manifest.


---

### Task 2: Add the table registry item with the reviewed dependency closure

**Files:**
- Create (only if needed): `@acme/ui/src/components/table/registry.tsx`
- Modify: `@acme/ui/src/registry.json`
- Test: none

- [ ] **Step 1: Create the narrow registry-facing entry file if Task 1 required it**

If needed, write `@acme/ui/src/components/table/registry.tsx` with only the approved public exports.

The file should look like this shape, adjusted to real imports discovered in Task 1:

```tsx
export { Table } from "./index"
export type {
  TableProps,
  TableColumnsType,
  TableColumnType,
  TableColumnGroupType,
  TablePaginationConfig,
} from "./index"
```

If `./index` is too broad even for re-exporting, import directly from the narrower source files instead.

Expected: registry-facing entry is narrower than the general barrel when necessary.

- [ ] **Step 2: Update `@acme/ui/src/registry.json` with the new table item**

Add an inline item shaped like this, but filled with the exact reviewed closure from Task 1:

```json
{
  "name": "table",
  "title": "Table",
  "path": "components/table",
  "type": "registry:component",
  "dependencies": ["@tanstack/react-table", "ahooks", "lodash"],
  "files": [
    {
      "path": "components/table/registry.tsx",
      "target": "components/table/registry.tsx",
      "type": "registry:file"
    }
  ]
}
```

Rules:
- Use `components/table/index.tsx` instead of `registry.tsx` only if Task 1 proved the existing public entry is narrow enough.
- Include only reviewed runtime files.
- Do not include stories, demos, or tests.
- Represent required external packages in `dependencies`.
- Use `registryDependencies` only if Task 1 proved a dependency is already modeled as another local registry item.

Expected: manifest reflects the approved table runtime boundary.

- [ ] **Step 3: Re-read the manifest entry before building**

Verify directly in `@acme/ui/src/registry.json` that the new item:
- is named `table`
- declares explicit package `dependencies`
- points at the chosen registry-facing public entry
- excludes stories, demos, and tests from `files`

Expected: manifest reflects the approved table runtime boundary before build verification.

---

### Task 3: Build and inspect the generated registry output

**Files:**
- Modify: `@acme/ui/src/registry.json` (only if follow-up fixes are needed)
- Inspect: `@acme/ui/public/registry/registry.json`
- Inspect: `@acme/ui/public/registry/table.json`
- Test: generated output inspection via build command

- [ ] **Step 1: Run the full registry build**

Run:

```bash
cd "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" && pnpm registry:build
```

Expected: exit code 0 and generated registry output in `@acme/ui/public/registry`.

- [ ] **Step 2: Inspect the generated registry index and item artifacts**

Read:
- `@acme/ui/public/registry/registry.json`
- `@acme/ui/public/registry/table.json`

Confirm:
- `registry.json` contains a `table` item
- `table.json` resolves to the intended file paths
- `table.json` does not include stories, demos, or tests

Expected: generated registry matches the manifest boundary.

- [ ] **Step 3: If the build or generated output reveals missing runtime files, add the minimum required files**

Rules:
- only add files proven necessary by the reviewed dependency closure or generated output
- do not widen scope to unrelated shared internals just to quiet the build
- if the missing dependency is a broad non-local shared source dependency, stop and surface it instead of silently broadening the registry item

Expected: either no manifest change is needed, or the manifest is adjusted minimally and intentionally.

- [ ] **Step 4: Re-run the build after any manifest fix**

Run the same build command again.
Expected: PASS with corrected generated output.


---

### Task 4: Final handoff

**Files:**
- Inspect: `@acme/ui/src/registry.json`
- Inspect: `@acme/ui/public/registry/registry.json`
- Inspect: `@acme/ui/public/registry/table.json`
- Inspect: `docs/superpowers/specs/2026-03-25-table-registry-design.md`
- Test: final build result from Task 3

- [ ] **Step 1: Prepare the implementation summary**

Summarize with evidence:
- which file became the registry-facing public entry
- which package dependencies were declared
- which table runtime files were included
- which out-of-scope assets were intentionally excluded
- which verification commands passed

