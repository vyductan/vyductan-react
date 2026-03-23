# Descriptions vertical size contrast Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Increase the visible spacing contrast between `size="small"` and `size="middle"` for `Descriptions` in `layout="vertical"`.

**Architecture:** Keep the implementation inside the existing vertical spacing helpers in `@acme/ui/src/components/descriptions/descriptions.tsx`. Make `small` tighter and `middle/default` slightly looser using vertical spacing utilities only, then verify the difference in the existing Storybook comparison story without changing API, typography, or horizontal behavior.

**Tech Stack:** React 19, TypeScript, Tailwind utility classes, Storybook 10 (`@storybook/nextjs-vite`), PNPM workspace, `@acme/ui`

---

### Task 1: Reproduce the current weak contrast in Storybook

**Files:**
- Test: `@acme/ui/src/components/descriptions/descriptions.stories.tsx:58-83`
- Reference: `@acme/ui/src/components/descriptions/descriptions.tsx:108-136`

**Step 1: Open the existing comparison story**

Run Storybook if needed:

```bash
pnpm -F @acme/ui storybook
```

Open `Components/Descriptions/Compare Sizes` and confirm the current issue:
- both examples are `layout="vertical"`
- `size="small"` and `size="middle"` differ, but not strongly enough for the desired visual contrast

**Step 2: Treat this as the failing reproduction target**

Do not change the story unless the current comparison becomes unusable. The issue to fix is the subtlety of the vertical spacing contrast, not story functionality.

**Step 3: Commit**

```bash
git add @acme/ui/src/components/descriptions/descriptions.stories.tsx
git commit -m "test: capture subtle vertical descriptions contrast"
```

### Task 2: Increase vertical spacing contrast in the component

**Files:**
- Modify: `@acme/ui/src/components/descriptions/descriptions.tsx:108-136`

**Step 1: Adjust only the vertical spacing helpers**

The current helpers are:

```tsx
const verticalThSpacingClass = isSmall
  ? "pb-0.5 pl-3 first:pl-0 last:pr-0"
  : "pb-1 pl-3 first:pl-0 last:pr-0";
const verticalTdSpacingClass = isSmall
  ? "gap-0.5 pb-3 pl-3 pr-4 align-top first:pl-0 last:pr-0"
  : "gap-1 pb-4 pl-3 pr-4 align-top first:pl-0 last:pr-0";
```

Change them to create a stronger contrast, for example:

```tsx
const verticalThSpacingClass = isSmall
  ? "pb-0 pl-3 first:pl-0 last:pr-0"
  : "pb-2 pl-3 first:pl-0 last:pr-0";
const verticalTdSpacingClass = isSmall
  ? "gap-0 pb-2 pl-3 pr-4 align-top first:pl-0 last:pr-0"
  : "gap-1 pb-4 pl-3 pr-4 align-top first:pl-0 last:pr-0";
```

This preserves the approved direction:
- `small` gets tighter vertically
- `middle/default` stays the looser comparison target
- only spacing changes

**Step 2: Keep scope tight**

Do not modify:
- horizontal spacing logic
- typography
- table/render structure
- public props or story API

**Step 3: If one value still feels too subtle, change one spacing token only**

For example, adjust only one of:
- `small` content `pb-*`
- `small` content `gap-*`
- `middle` label `pb-*`

Do not bundle multiple unrelated visual changes.

**Step 4: Commit**

```bash
git add @acme/ui/src/components/descriptions/descriptions.tsx
git commit -m "fix: increase vertical descriptions size contrast"
```

### Task 3: Verify the stronger contrast with fresh evidence

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
- no TypeScript errors in the modified Descriptions files

**Step 2: Lint the modified Descriptions files**

```bash
pnpm -F @acme/ui exec eslint --flag unstable_native_nodejs_ts_config "src/components/descriptions/descriptions.tsx" "src/components/descriptions/descriptions.stories.tsx"
```

Expected:
- PASS with no lint errors for those files

**Step 3: Re-check the Storybook comparison visually**

Open `Components/Descriptions/Compare Sizes` and verify:
- `size="small"` is now obviously tighter than `size="middle"`
- the difference is driven by vertical spacing only
- the story remains usable without additional compare variants

**Step 4: Commit**

```bash
git add @acme/ui/src/components/descriptions/descriptions.tsx @acme/ui/src/components/descriptions/descriptions.stories.tsx
git commit -m "test: verify stronger vertical descriptions contrast"
```
