# Table Drag Sorting Story Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two Storybook examples for `Table` that demonstrate row drag sorting with a dedicated handle and with full-row dragging, using colocated `demo/` files.

**Architecture:** Keep the change local to the existing table component directory. Build two self-contained demo components in `@acme/ui/src/components/table/demo/` and wire them into `table.stories.tsx` with minimal story exports. Stay within the approved spec scope: no public `Table` API changes, no docs changes, and manual Storybook verification as the required validation path.

**Tech Stack:** React 19, TypeScript, Storybook 10 (`@storybook/nextjs-vite`), `@dnd-kit/core`, `@dnd-kit/sortable`, `@tanstack/react-table`, PNPM workspace, `@acme/ui`

---

### Task 1: Create the handle-only drag sorting demo

**Files:**
- Create: `@acme/ui/src/components/table/demo/drag-sorting-with-handle.tsx`
- Reference: `@acme/ui/src/components/table/demo/basic.tsx`
- Reference: `@acme/ui/src/components/table/_components/table-sortable-row.tsx`

- [ ] **Step 1: Start from the existing table demo shape**

Use `@acme/ui/src/components/table/demo/basic.tsx` as the baseline for:
- `DataType`
- the three sample rows
- the main columns (`Name`, `Age`, `Address`, `Tags`, `Action`)

Keep the cell content realistic and consistent with the existing table examples.

- [ ] **Step 2: Add local reorder state and DnD setup**

Inside `drag-sorting-with-handle.tsx`, create local state with `useState(initialData)` and add DnD setup with `DndContext`, `PointerSensor`, `useSensor`, `useSensors`, `SortableContext`, `arrayMove`, and `verticalListSortingStrategy`.

Use this shape:

```tsx
const [data, setData] = useState(initialData);
const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
);

const onDragEnd = ({ active, over }: DragEndEvent) => {
  if (!over || active.id === over.id) return;

  setData((current) => {
    const oldIndex = current.findIndex((item) => item.key === active.id);
    const newIndex = current.findIndex((item) => item.key === over.id);

    return arrayMove(current, oldIndex, newIndex);
  });
};
```

Expected:
- row order is managed locally inside the demo
- no `Table` API changes are required

- [ ] **Step 3: Prepend the dedicated handle column**

Add a narrow leading column that renders `DragHandle`.

Use this shape:

```tsx
{
  key: "sort",
  title: "",
  width: 56,
  render: () => <DragHandle aria-label="Reorder row" />,
}
```

Expected:
- the handle-only story has a clear drag affordance
- the rest of the columns stay aligned with the existing table demo

- [ ] **Step 4: Connect the table body rows to the sortable row primitive**

Wrap the table in `DndContext` and `SortableContext`, then override `components.body.row` with `TableRowSortable` configured for handle-only dragging.

Use this shape:

```tsx
<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
  <SortableContext items={data.map((item) => item.key)} strategy={verticalListSortingStrategy}>
    <Table<DataType>
      columns={columns}
      dataSource={data}
      components={{
        body: {
          row: (props) => <TableRowSortable {...props} asHandle={false} />,
        },
      }}
    />
  </SortableContext>
</DndContext>
```

Expected:
- dragging starts only from the handle
- dropping a row updates the visible order

### Task 2: Create the full-row drag sorting demo

**Files:**
- Create: `@acme/ui/src/components/table/demo/drag-sorting-full-row.tsx`
- Reference: `@acme/ui/src/components/table/demo/drag-sorting-with-handle.tsx`
- Reference: `@acme/ui/src/components/table/demo/basic.tsx`

- [ ] **Step 1: Create a second self-contained demo file**

Create `drag-sorting-full-row.tsx` using the same sample data and main table columns as the handle-only demo.

Keep the demo self-contained. Do not extract shared helpers unless duplication becomes clearly harmful during implementation.

- [ ] **Step 2: Reuse the same local reorder pattern**

Use the same local DnD shape as Task 1:
- `useState(initialData)`
- `PointerSensor` with a small activation distance
- `onDragEnd` with `arrayMove`
- `SortableContext` keyed by row `key`

Expected:
- the full-row example manages ordering locally without touching table internals

- [ ] **Step 3: Remove the handle column and enable row-surface dragging**

Keep only the main columns and configure the row override with `asHandle` enabled.

Use this shape:

```tsx
components={{
  body: {
    row: (props) => <TableRowSortable {...props} asHandle />,
  },
}}
```

Expected:
- there is no dedicated drag handle column
- the row itself acts as the drag activator

### Task 3: Expose the new demos in `table.stories.tsx`

**Files:**
- Modify: `@acme/ui/src/components/table/table.stories.tsx`
- Reference: `@acme/ui/src/components/button/button.stories.tsx`

- [ ] **Step 1: Import the new demo components**

Add these imports near the top of `table.stories.tsx`:

```tsx
import DragSortingFullRowDemo from "./demo/drag-sorting-full-row";
import DragSortingWithHandleDemo from "./demo/drag-sorting-with-handle";
```

Expected:
- `table.stories.tsx` follows the same demo-import pattern used by `button.stories.tsx`

- [ ] **Step 2: Add minimal story exports for the two demos**

Add these stories near the other visual examples:

```tsx
export const DragSortingWithHandle: Story = {
  render: () => <DragSortingWithHandleDemo />,
};

export const DragSortingFullRow: Story = {
  render: () => <DragSortingFullRowDemo />,
};
```

Expected:
- Storybook shows both stories under `Components/Table`
- `table.stories.tsx` remains a registration file, not a logic-heavy demo file

### Task 4: Manually validate the new stories in Storybook

**Files:**
- Verify: `@acme/ui/src/components/table/demo/drag-sorting-with-handle.tsx`
- Verify: `@acme/ui/src/components/table/demo/drag-sorting-full-row.tsx`
- Verify: `@acme/ui/src/components/table/table.stories.tsx`

- [ ] **Step 1: Launch Storybook for `@acme/ui`**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui storybook
```

Expected:
- Storybook starts successfully on port 6006 unless that port is already in use

- [ ] **Step 2: Inspect the new stories manually**

Open these routes:

```text
http://localhost:6006/?path=/story/components-table--drag-sorting-with-handle
http://localhost:6006/?path=/story/components-table--drag-sorting-full-row
```

Confirm all of the following:
- `DragSortingWithHandle` only starts dragging from the handle column
- `DragSortingFullRow` allows dragging from the row surface
- dropping a row changes the visible order
- `Name`, `Tags`, and `Action` cells still render correctly after reordering

- [ ] **Step 3: Stop and surface blockers if imports fail unexpectedly**

If implementation reveals that direct `@dnd-kit/core` imports are not accepted by the package setup, stop and ask for approval before expanding scope to dependency-manifest changes. That dependency update is intentionally outside the current approved spec.
