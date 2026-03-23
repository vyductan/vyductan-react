# Descriptions Ant Design parity Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make `Descriptions` behave closer to Ant Design by giving omitted `column` a responsive default and letting the last horizontal item fill remaining columns in its row.

**Architecture:** Update `Descriptions` so its internal default `column` value is a responsive breakpoint map rather than a fixed number. Update horizontal row packing in `utils.ts` so each completed row normalizes the last item's span to consume leftover columns, while preserving explicit spans and existing wrapping behavior. Add regression tests in `descriptions.test.tsx` to lock both behaviors before touching implementation.

**Tech Stack:** React 19, TypeScript, Storybook 10 (`@storybook/nextjs-vite`), Vitest, Testing Library, Tailwind utility classes, PNPM workspace, `@acme/ui`

---

### Task 1: Add failing tests for responsive default columns and horizontal row fill

**Files:**
- Modify: `@acme/ui/src/components/descriptions/descriptions.test.tsx`
- Reference: `@acme/ui/src/components/descriptions/descriptions.tsx`
- Reference: `@acme/ui/src/components/descriptions/utils.ts`

**Step 1: Write the failing test for horizontal row fill**

Add a focused test that renders `Descriptions` in horizontal mode with three implicit columns and two items in one row, then verifies the last item consumes the remaining columns.

Example target test shape:

```tsx
test("fills the remaining horizontal columns with the last item in a row", () => {
  cleanup();

  render(
    <Descriptions
      layout="horizontal"
      column={3}
      items={[
        { key: "username", label: "UserName", children: "Zhou Maomao" },
        {
          key: "address",
          label: "Address",
          children: "No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China",
        },
      ]}
    />,
  );

  const addressCell = screen.getByText("Address").closest("td");
  expect(addressCell).toHaveAttribute("colspan", "2");
});
```

**Step 2: Write the failing test for omitted-column responsive default**

Mock `useResponsive` so omitted `column` resolves to a smaller breakpoint column count, then verify row packing reflects that responsive default instead of a fixed `3`.

Example target test shape:

```tsx
vi.mock("@acme/ui/hooks/use-responsive", () => ({
  useResponsive: () => ({ xs: true, sm: false, md: false, lg: false, xl: false, xxl: false }),
}));

test("uses responsive default columns when column is omitted", () => {
  cleanup();

  render(
    <Descriptions
      layout="horizontal"
      items={[
        { key: "1", label: "UserName", children: "Zhou Maomao" },
        { key: "2", label: "Telephone", children: "1810000000" },
      ]}
    />,
  );

  const rows = document.querySelectorAll("tbody tr");
  expect(rows).toHaveLength(2);
});
```

Adjust the exact mock shape to match the project’s `Screens` values used by `useResponsive`.

**Step 3: Run the new tests to verify RED**

Run:

```bash
pnpm -F @acme/ui exec vitest run src/components/descriptions/descriptions.test.tsx
```

Expected:
- FAIL
- one or both new tests fail because current implementation still uses fixed `column = 3` and does not fill remaining horizontal columns

**Step 4: Keep the previously added spacing tests intact**

Do not remove or weaken the existing tests that verify:
- no double spacing when colon is shown
- wrapper gap when `colon={false}`
- long content stays inline without breaking table cells

**Step 5: Commit**

```bash
git add @acme/ui/src/components/descriptions/descriptions.test.tsx
git commit -m "test: add descriptions parity regression tests"
```

### Task 2: Implement responsive default columns and horizontal row fill

**Files:**
- Modify: `@acme/ui/src/components/descriptions/descriptions.tsx:42-81`
- Modify: `@acme/ui/src/components/descriptions/utils.ts:5-39`
- Verify: `@acme/ui/src/components/descriptions/descriptions.test.tsx`

**Step 1: Implement a responsive default column map**

Replace the fixed default `column = 3` behavior with an internal responsive default map while preserving caller-provided `column` values.

Example target structure:

```tsx
const DEFAULT_COLUMN: Partial<Record<Screens, number>> = {
  xs: 1,
  sm: 2,
  md: 3,
};

function Descriptions({
  // ...
  column,
  // ...
}: DescriptionsProps): ReactElement {
  const responsiveInfo = useResponsive();
  const mergedColumnProp = column ?? DEFAULT_COLUMN;

  let mergedColumn = 0;
  if (typeof mergedColumnProp === "number") {
    mergedColumn = mergedColumnProp;
  } else {
    const mergedColumnWithScreen: Partial<Record<Screens, number | undefined>> = {};
    for (const [k] of Object.entries(responsiveInfo)) {
      mergedColumnWithScreen[k as Screens] =
        responsiveInfo[k as Screens] && mergedColumnProp[k as Screens]
          ? mergedColumnProp[k as Screens]
          : undefined;
    }
    const matched = Object.entries(mergedColumnWithScreen).findLast(([, v]) => v)?.[0] as Screens;
    mergedColumn = mergedColumnProp[matched] ?? 0;
  }
```

**Step 2: Implement last-item fill for completed horizontal rows**

Update `createHorizontalRows()` so whenever a row is completed with leftover columns, the last item in that row gets its `span` increased by the remaining amount.

Example target structure:

```ts
function normalizeHorizontalRow(
  row: DescriptionsItem[],
  columns: number,
): DescriptionsItem[] {
  const total = row.reduce((sum, item) => sum + (item.span ?? 1), 0);
  const remaining = columns - total;

  if (remaining <= 0 || row.length === 0) {
    return row;
  }

  const lastItem = row.at(-1)!;
  return [
    ...row.slice(0, -1),
    {
      ...lastItem,
      span: (lastItem.span ?? 1) + remaining,
    },
  ];
}
```

Use that normalization when pushing a finished row into `rows`.

**Step 3: Keep wrapping rules stable**

Do not change the existing rule that starts a new row when `currentRowSpan + itemSpan > columns`.

**Step 4: Run the tests to verify GREEN**

Run:

```bash
pnpm -F @acme/ui exec vitest run src/components/descriptions/descriptions.test.tsx
```

Expected:
- PASS
- all existing spacing tests still pass
- both new parity tests pass

**Step 5: Commit**

```bash
git add @acme/ui/src/components/descriptions/descriptions.tsx @acme/ui/src/components/descriptions/utils.ts @acme/ui/src/components/descriptions/descriptions.test.tsx
git commit -m "feat: align descriptions layout with ant design"
```

### Task 3: Verify typecheck, lint, and Storybook behavior

**Files:**
- Verify: `@acme/ui/src/components/descriptions/descriptions.tsx`
- Verify: `@acme/ui/src/components/descriptions/utils.ts`
- Verify: `@acme/ui/src/components/descriptions/descriptions.test.tsx`
- Verify: `@acme/ui/src/components/descriptions/descriptions.stories.tsx`
- Reference: `@acme/ui/package.json:8-22`

**Step 1: Run targeted lint checks**

Run:

```bash
pnpm -F @acme/ui exec eslint --flag unstable_native_nodejs_ts_config "src/components/descriptions/descriptions.tsx" "src/components/descriptions/utils.ts" "src/components/descriptions/descriptions.test.tsx" "src/components/descriptions/descriptions.stories.tsx"
```

Expected:
- PASS with no lint errors in the touched Descriptions files

**Step 2: Run package typecheck**

Run:

```bash
pnpm -F @acme/ui typecheck
```

Expected:
- If workspace baseline is clean: PASS
- If unrelated baseline failures remain elsewhere, report them exactly and confirm no new TypeScript errors were introduced in the touched Descriptions files

**Step 3: Verify visually in Storybook**

Run if needed:

```bash
pnpm -F @acme/ui storybook
```

Open:

```text
http://localhost:6006/?path=/story/components-descriptions--compare-colon-behavior
```

Also inspect the default `Descriptions` rendering where applicable.

Confirm visually:
- omitted `column` no longer behaves as a fixed 3-column layout on narrow breakpoints
- a long trailing horizontal item can consume remaining row columns instead of leaving empty trailing columns
- previously fixed colon spacing behavior still looks correct

**Step 4: Commit**

```bash
git add @acme/ui/src/components/descriptions/descriptions.tsx @acme/ui/src/components/descriptions/utils.ts @acme/ui/src/components/descriptions/descriptions.test.tsx @acme/ui/src/components/descriptions/descriptions.stories.tsx
git commit -m "test: verify descriptions ant design parity"
```
