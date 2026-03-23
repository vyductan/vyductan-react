# Descriptions colon behavior Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make `Descriptions` hide the colon in `layout="vertical"` when `bordered={false}`, while keeping the colon visible in `layout="horizontal"` when `bordered={false}`.

**Architecture:** Update the shared `labelClassName` composition in `@acme/ui/src/components/descriptions/descriptions.tsx` so the pseudo-colon is layout-aware instead of always enabled by default. Keep the change scoped to label-class logic only, preserve `colon={false}` as the explicit global opt-out, and use Storybook to verify horizontal and vertical non-bordered behavior.

**Tech Stack:** React 19, TypeScript, Tailwind utility classes, Storybook 10 (`@storybook/nextjs-vite`), PNPM workspace, `@acme/ui`

---

### Task 1: Reproduce the current colon behavior mismatch

**Files:**
- Test: `@acme/ui/src/components/descriptions/descriptions.tsx:89-97`
- Test: `@acme/ui/src/components/descriptions/descriptions.stories.tsx:58-83`

**Step 1: Confirm the current shared colon logic**

Read the existing label class logic:

```tsx
const labelClassName = cn(
  "text-muted-foreground inline-flex items-center font-medium",
  [
    "after:content-[':'] after:relative after:-mt-[0.5px] after:ml-0.5 after:mr-2",
    layout === "horizontal" && "after:mr-2",
    colon === false && "after:content-['']",
  ],
  classNames?.label,
);
```

This shows the root cause: the pseudo-colon is enabled by default for all layouts unless `colon={false}`.

**Step 2: Observe the current visual mismatch**

Run Storybook if needed:

```bash
pnpm -F @acme/ui storybook
```

Verify the current behavior in a non-bordered horizontal example and a non-bordered vertical example:
- vertical non-bordered still shows a colon (undesired)
- horizontal non-bordered shows a colon (desired)

If the existing `CompareSizes` story is not sufficient to observe both layouts, temporarily inspect an existing horizontal story or add a minimal local verification story in the next task only if required.

**Step 3: Commit**

```bash
git add @acme/ui/src/components/descriptions/descriptions.tsx @acme/ui/src/components/descriptions/descriptions.stories.tsx
git commit -m "test: capture descriptions colon behavior mismatch"
```

### Task 2: Make colon rendering layout-aware

**Files:**
- Modify: `@acme/ui/src/components/descriptions/descriptions.tsx:89-97`

**Step 1: Update the label class rule so horizontal owns the colon**

Replace the unconditional pseudo-colon with a layout-aware condition.

Current shape:

```tsx
[
  "after:content-[':'] after:relative after:-mt-[0.5px] after:ml-0.5 after:mr-2",
  layout === "horizontal" && "after:mr-2",
  colon === false && "after:content-['']",
]
```

Target shape:

```tsx
[
  layout === "horizontal" &&
    "after:content-[':'] after:relative after:-mt-[0.5px] after:ml-0.5 after:mr-2",
  colon === false && "after:content-['']",
]
```

This ensures:
- horizontal non-bordered keeps the colon
- vertical non-bordered does not get a colon by default
- `colon={false}` still disables the colon wherever it might otherwise appear

**Step 2: Keep the fix minimal**

Do not change:
- render branches
- row generation
- spacing logic
- props or types
- typography classes

If a tiny cleanup is helpful, keep it inside the label-class block only.

**Step 3: Commit**

```bash
git add @acme/ui/src/components/descriptions/descriptions.tsx
git commit -m "fix: make descriptions colon behavior layout aware"
```

### Task 3: Verify the colon behavior with fresh evidence

**Files:**
- Verify: `@acme/ui/src/components/descriptions/descriptions.tsx`
- Verify: `@acme/ui/src/components/descriptions/descriptions.stories.tsx`
- Reference: `@acme/ui/package.json:8-22`

**Step 1: Run typecheck**

```bash
pnpm -F @acme/ui typecheck
```

Expected:
- PASS
- no TypeScript errors in the Descriptions files

**Step 2: Lint the modified Descriptions files**

```bash
pnpm -F @acme/ui exec eslint --flag unstable_native_nodejs_ts_config "src/components/descriptions/descriptions.tsx" "src/components/descriptions/descriptions.stories.tsx"
```

Expected:
- PASS with no lint errors for those files

**Step 3: Re-verify visual behavior in Storybook**

Check:
- `layout="horizontal" && bordered={false}` shows colon
- `layout="vertical" && bordered={false}` does not show colon
- `colon={false}` still disables colon when explicitly set

If there is no existing story that makes both states easy to compare, add the smallest possible verification story and re-run Step 1 and Step 2.

**Step 4: Commit**

```bash
git add @acme/ui/src/components/descriptions/descriptions.tsx @acme/ui/src/components/descriptions/descriptions.stories.tsx
git commit -m "test: verify descriptions colon behavior"
```
