# Descriptions vertical fill Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make vertical `Descriptions` let the last item in an incomplete row consume the remaining columns, matching the horizontal fill behavior so a trailing `Address` item can span the leftover space.

**Architecture:** Keep the public API unchanged. Extend the vertical row-packing logic in `utils.ts` so both the label row and value row normalize the final item span when a row is incomplete, mirroring the existing horizontal fill behavior. Add targeted regression tests first, then update the Storybook/demo sample data to visually exercise the new vertical behavior.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, Storybook 10 (`@storybook/nextjs-vite`), Tailwind utility classes, PNPM workspace, `@acme/ui`

---

### Task 1: Add failing regression tests for vertical row fill

**Files:**
- Modify: `@acme/ui/src/components/descriptions/descriptions.test.tsx`
- Reference: `@acme/ui/src/components/descriptions/utils.ts`
- Reference: `@acme/ui/src/components/descriptions/descriptions.tsx`

**Step 1: Write the failing test for vertical fill on an incomplete row**

Add a focused test that renders `Descriptions` in `layout="vertical"` with `column={3}` and two items in the row, then verifies the last item expands to the remaining columns in both label and value rows.

Example target test shape:

```tsx
test("fills the remaining columns for the last item in an incomplete vertical row", () => {
  const { container } = render(
    <Descriptions
      layout="vertical"
      column={3}
      items={[
        {
          key: "username",
          label: "UserName",
          children: "Zhou Maomao",
        },
        {
          key: "address",
          label: "Address",
          children:
            "No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China",
        },
      ]}
    />,
  );

  const rows = container.querySelectorAll("tbody tr");
  const labelCell = screen.getByText("Address").closest("th");
  const valueCell = screen
    .getByText("No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China")
    .closest("td");

  expect(rows).toHaveLength(2);
  expect(labelCell).toHaveAttribute("colspan", "2");
  expect(valueCell).toHaveAttribute("colspan", "2");
});
```

**Step 2: Keep the existing horizontal and responsive tests intact**

Do not remove or weaken the current regression tests for:
- horizontal non-bordered spacing
- horizontal inline long-content layout
- horizontal remaining-column fill
- responsive default columns when `column` is omitted

**Step 3: Run the test file to verify RED**

Run:

```bash
pnpm -F @acme/ui exec vitest run src/components/descriptions/descriptions.test.tsx
```

Expected:
- FAIL
- the new vertical fill test fails because `createVerticalRows()` does not yet normalize the trailing cell span

**Step 4: Commit**

```bash
git add @acme/ui/src/components/descriptions/descriptions.test.tsx
git commit -m "test: add vertical descriptions fill regression"
```

### Task 2: Implement vertical row fill in the row packer

**Files:**
- Modify: `@acme/ui/src/components/descriptions/utils.ts`
- Verify: `@acme/ui/src/components/descriptions/descriptions.test.tsx`

**Step 1: Add a vertical row normalizer that fills the trailing cell span**

Create a small helper that mirrors the horizontal fill logic, but works on `VerticalCell[]`.

Example target structure:

```ts
function fillVerticalRow(
  row: VerticalCell[],
  columns: number,
  currentRowSpan: number,
): VerticalCell[] {
  if (row.length === 0 || currentRowSpan >= columns) {
    return [...row];
  }

  const remainingSpan = columns - currentRowSpan;
  const lastCell = row.at(-1);

  if (!lastCell) {
    return [...row];
  }

  return [
    ...row.slice(0, -1),
    {
      ...lastCell,
      span: lastCell.span + remainingSpan,
    },
  ];
}
```

**Step 2: Apply the normalizer when pushing completed vertical rows**

Update `createVerticalRows()` so both places that currently push a label row/value row pair normalize each row before pushing.

Example target structure:

```ts
if (currentRowLabels.length > 0) {
  rows.push(
    fillVerticalRow(currentRowLabels, columns, currentRowSpan),
    fillVerticalRow(currentRowValues, columns, currentRowSpan),
  );
}
```

Apply this in:
- the overflow branch where a new row starts
- the final trailing-row push after the loop

**Step 3: Keep existing wrapping rules unchanged**

Do not change the rule that starts a new row when `currentRowSpan + itemSpan > columns`.

**Step 4: Run the test file to verify GREEN**

Run:

```bash
pnpm -F @acme/ui exec vitest run src/components/descriptions/descriptions.test.tsx
```

Expected:
- PASS
- the new vertical fill regression passes
- existing horizontal and responsive regressions still pass

**Step 5: Commit**

```bash
git add @acme/ui/src/components/descriptions/utils.ts @acme/ui/src/components/descriptions/descriptions.test.tsx
git commit -m "feat: fill incomplete vertical descriptions rows"
```

### Task 3: Update Storybook/demo data to showcase the vertical fill case

**Files:**
- Modify: `@acme/ui/src/components/descriptions/descriptions.stories.tsx`
- Modify: `@acme/ui/src/components/descriptions/demo/basic.tsx`
- Optional verify: `@acme/ui/src/components/descriptions/descriptions.stories.tsx`

**Step 1: Adjust the sample item order so `Address` is the trailing item in vertical mode**

Keep the sample simple and align it with the horizontal sample pattern, so the long `Address` item is the row-ending item that demonstrates fill behavior.

Example target shape:

```tsx
const descriptionItems = [
  { key: "1", label: "UserName", children: "Zhou Maomao" },
  { key: "2", label: "Telephone", children: "1810000000" },
  { key: "3", label: "Live", children: "Hangzhou, Zhejiang" },
  { key: "4", label: "Remark", children: "empty" },
  {
    key: "5",
    label: "Address",
    children: "No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China",
  },
];
```

Mirror the same ordering in `demo/basic.tsx` if that demo is still intended to represent the core default example.

**Step 2: Keep stories otherwise unchanged**

Do not add new props or stories unless needed for visual verification.

**Step 3: Run targeted lint checks**

Run:

```bash
pnpm -F @acme/ui exec eslint --flag unstable_native_nodejs_ts_config "src/components/descriptions/utils.ts" "src/components/descriptions/descriptions.test.tsx" "src/components/descriptions/descriptions.stories.tsx" "src/components/descriptions/demo/basic.tsx"
```

Expected:
- PASS with no lint errors in the touched Descriptions files

**Step 4: Run package typecheck**

Run:

```bash
pnpm -F @acme/ui typecheck
```

Expected:
- PASS
- if unrelated baseline failures appear, report them exactly and confirm no new errors were introduced in the touched Descriptions files

**Step 5: Verify in Storybook**

Run if needed:

```bash
pnpm -F @acme/ui storybook
```

Open:

```text
http://localhost:6006/?path=/story/components-descriptions--compare-sizes
```

Confirm visually:
- in vertical mode, the trailing `Address` item spans the remaining columns
- horizontal behavior remains unchanged
- the existing size contrast and colon stories still render sensibly

**Step 6: Commit**

```bash
git add @acme/ui/src/components/descriptions/utils.ts @acme/ui/src/components/descriptions/descriptions.test.tsx @acme/ui/src/components/descriptions/descriptions.stories.tsx @acme/ui/src/components/descriptions/demo/basic.tsx
git commit -m "test: verify vertical descriptions fill behavior"
```
