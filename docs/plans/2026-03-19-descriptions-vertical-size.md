# Descriptions vertical size Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make `Descriptions` apply visibly tighter spacing for `size="small"` in `layout="vertical"`, while preserving existing horizontal behavior.

**Architecture:** Update the class-name derivation in `@acme/ui/src/components/descriptions/descriptions.tsx` so the vertical `th` and `td` branches respond to `size` through vertical spacing changes only. Keep the rendering structure unchanged, and use the existing `Components/Descriptions` story to visually verify that `small` is tighter than `middle` in vertical layout.

**Tech Stack:** React 19, TypeScript, Tailwind utility classes, Storybook 10 (`@storybook/nextjs-vite`), PNPM workspace, `@acme/ui`

---

### Task 1: Add a failing visual verification target for vertical size

**Files:**
- Modify: `@acme/ui/src/components/descriptions/descriptions.stories.tsx:58-84`
- Reference: `@acme/ui/src/components/descriptions/descriptions.tsx:108-135`

**Step 1: Keep the comparison story focused on vertical layout**

Ensure the existing `CompareSizes` story remains a direct side-by-side comparison for:
- `layout="vertical"`
- `size="small"`
- `size="middle"`

The story should continue using the same `descriptionItems` data for both sections so spacing is the only meaningful difference.

**Step 2: Confirm the current story shows the problem before implementation**

Run Storybook locally if it is not already running:

```bash
pnpm -F @acme/ui storybook
```

Open `Components/Descriptions/Compare Sizes` and verify the current failure condition:
- `size="small"` looks the same or nearly the same as `size="middle"` in vertical layout

This is the failing reproduction target for the bugfix.

**Step 3: Do not change component logic yet**

At this stage, only confirm the bug visually. Do not implement the spacing fix before the failure condition is observed.

**Step 4: Commit**

```bash
git add @acme/ui/src/components/descriptions/descriptions.stories.tsx
git commit -m "test: capture vertical descriptions size comparison"
```

### Task 2: Implement vertical size spacing in the component

**Files:**
- Modify: `@acme/ui/src/components/descriptions/descriptions.tsx:108-135`
- Reference: `/Users/vyductan/developer/vyductan/refs/ant-design/components/descriptions/style/index.ts:229-242`

**Step 1: Write the minimal spacing mapping directly into the existing class logic**

Update the vertical branches of `thClassName` and `tdClassName` so `size` affects vertical spacing.

Current vertical class branches:

```tsx
layout === "vertical" && [
  "pb-1 pl-3 first:pl-0 last:pr-0",
  bordered && "px-6",
]
```

```tsx
layout === "vertical" && [
  "gap-1 pb-4 pl-3 pr-4 align-top first:pl-0 last:pr-0",
  bordered && "px-6",
]
```

Change them so vertical spacing varies by `size`, for example:

```tsx
layout === "vertical" && [
  "pl-3 first:pl-0 last:pr-0",
  size === "small" && "pb-0.5",
  (size === "middle" || !size) && "pb-1",
  bordered && "px-6",
]
```

```tsx
layout === "vertical" && [
  "gap-1 pl-3 pr-4 align-top first:pl-0 last:pr-0",
  size === "small" && "pb-3",
  (size === "middle" || !size) && "pb-4",
  bordered && "px-6",
]
```

The exact utility values may be adjusted slightly, but the rule is:
- `small` must be visibly tighter vertically than `middle`
- default behavior should stay aligned with the current non-small appearance
- do not add horizontal padding changes for non-bordered vertical layout in this task

**Step 2: Allow small local cleanup only if it improves readability**

If the class logic becomes repetitive, perform a small local cleanup inside the same file, such as extracting a tiny size condition or reordering the arrays for readability. Do not create broad abstractions or change rendering branches.

**Step 3: Keep all other behavior unchanged**

Do not modify:
- row generation (`createHorizontalRows`, `createVerticalRows`)
- the render tree structure
- public props or types
- horizontal size behavior

**Step 4: Commit**

```bash
git add @acme/ui/src/components/descriptions/descriptions.tsx
git commit -m "fix: apply vertical sizing in descriptions"
```

### Task 3: Verify the vertical size fix with fresh evidence

**Files:**
- Verify: `@acme/ui/src/components/descriptions/descriptions.tsx`
- Verify: `@acme/ui/src/components/descriptions/descriptions.stories.tsx`
- Reference: `@acme/ui/package.json:8-22`

**Step 1: Run typecheck after the component change**

From the repo root:

```bash
pnpm -F @acme/ui typecheck
```

Expected:
- PASS
- no TypeScript errors in `descriptions.tsx` or `descriptions.stories.tsx`

**Step 2: Lint the modified files directly**

Run targeted lint for both touched files:

```bash
pnpm -F @acme/ui exec eslint --flag unstable_native_nodejs_ts_config "src/components/descriptions/descriptions.tsx" "src/components/descriptions/descriptions.stories.tsx"
```

Expected:
- PASS with no output or no errors for those files

**Step 3: Re-check the visual reproduction in Storybook**

Open `Components/Descriptions/Compare Sizes` and verify:
- both examples still use `layout="vertical"`
- `size="small"` is visibly tighter than `size="middle"`
- the difference is driven by vertical spacing, not by new typography or horizontal padding changes

**Step 4: If the difference is still too subtle, adjust one spacing value only**

Make one small adjustment to the vertical `pb-*` utilities, then repeat Step 1 through Step 3. Do not bundle unrelated visual tweaks.

**Step 5: Commit**

```bash
git add @acme/ui/src/components/descriptions/descriptions.tsx @acme/ui/src/components/descriptions/descriptions.stories.tsx
git commit -m "test: verify vertical descriptions size behavior"
```
