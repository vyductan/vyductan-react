# Descriptions colon story stacked layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Change `CompareColonBehavior` so the horizontal and vertical examples are stacked vertically instead of rendered side by side.

**Architecture:** Keep the story content unchanged and update only the wrapper layout in `renderCompareColonBehavior()` inside `@acme/ui/src/components/descriptions/descriptions.stories.tsx`. Replace the current two-column grid container with a vertical stack so the two sections render top-to-bottom in the Storybook canvas.

**Tech Stack:** React 19, TypeScript, Storybook 10 (`@storybook/nextjs-vite`), Tailwind utility classes, PNPM workspace, `@acme/ui`

---

### Task 1: Change the colon verification story wrapper to a vertical stack

**Files:**
- Modify: `@acme/ui/src/components/descriptions/descriptions.stories.tsx:102-109`

**Step 1: Update only the wrapper container**

Current implementation:

```tsx
function renderCompareColonBehavior(): ReactElement {
  return (
    <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-2">
      {renderColonBehaviorVariant("horizontal")}
      {renderColonBehaviorVariant("vertical")}
    </div>
  );
}
```

Change it to a vertical stack, for example:

```tsx
function renderCompareColonBehavior(): ReactElement {
  return (
    <div className="flex w-full max-w-6xl flex-col gap-6">
      {renderColonBehaviorVariant("horizontal")}
      {renderColonBehaviorVariant("vertical")}
    </div>
  );
}
```

Alternative acceptable version:

```tsx
<div className="grid w-full max-w-6xl grid-cols-1 gap-6">
```

**Step 2: Keep everything else unchanged**

Do not change:
- section labels
- helper names
- existing `CompareSizes`
- component logic
- props or data passed to `Descriptions`

**Step 3: Commit**

```bash
git add @acme/ui/src/components/descriptions/descriptions.stories.tsx
git commit -m "docs: stack descriptions colon story vertically"
```

### Task 2: Verify the stacked story with fresh evidence

**Files:**
- Verify: `@acme/ui/src/components/descriptions/descriptions.stories.tsx`
- Reference: `@acme/ui/package.json:8-22`

**Step 1: Run typecheck**

```bash
pnpm -F @acme/ui typecheck
```

Expected:
- PASS
- no TypeScript errors in the story file

**Step 2: Lint the Descriptions files directly**

```bash
pnpm -F @acme/ui exec eslint --flag unstable_native_nodejs_ts_config "src/components/descriptions/descriptions.tsx" "src/components/descriptions/descriptions.stories.tsx"
```

Expected:
- PASS with no lint errors for those files

**Step 3: Verify visually in Storybook**

Open `Components/Descriptions/CompareColonBehavior` and confirm:
- the horizontal example appears first
- the vertical example appears below it
- the two sections are stacked vertically, not side by side

**Step 4: Commit**

```bash
git add @acme/ui/src/components/descriptions/descriptions.stories.tsx
git commit -m "test: verify stacked descriptions colon story"
```
