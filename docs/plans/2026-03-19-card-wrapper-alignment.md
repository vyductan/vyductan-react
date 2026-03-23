# Card Wrapper Alignment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove local Card wrapper overrides that drift from shadcn header spacing while preserving the current Card API and existing size support.

**Architecture:** Limit implementation to the local Card wrapper layer in `@acme/ui/src/components/card/_components/index.tsx`. Keep the protected shadcn reference untouched, preserve the current public component exports, and make the smallest changes needed to restore shadcn-like header behavior.

**Tech Stack:** React, TypeScript, Storybook, Tailwind CSS, `@acme/ui`, PNPM

---

### Task 1: Align `CardTitle` and `CardAction` wrapper behavior

**Files:**
- Modify: `@acme/ui/src/components/card/_components/index.tsx`
- Reference only: `@acme/ui/src/shadcn/card.tsx`
- Reference only: `/Users/vyductan/Developer/vyductan/refs/ui/apps/v4/examples/radix/ui/card.tsx`

**Step 1: Inspect the current local wrapper overrides**
- Confirm `CardTitle` adds `flex-1`.
- Confirm `CardAction` adds `row-span-1`.
- Confirm the shadcn/reference implementations do not add those overrides.

**Step 2: Apply the minimal alignment fix**
- Remove `flex-1` from the local `CardTitle` wrapper.
- Remove `row-span-1` from the local `CardAction` wrapper.
- Keep exports and component signatures unchanged.

**Step 3: Re-read the file after editing**
- Ensure no accidental changes were introduced.
- Ensure the wrapper still compiles conceptually and continues to pass through custom `className` values.

### Task 2: Review existing `size` support for consistency

**Files:**
- Modify only if needed: `@acme/ui/src/components/card/_components/index.tsx`
- Reference only: `/Users/vyductan/Developer/vyductan/refs/ui/apps/v4/examples/radix/ui/card.tsx`

**Step 1: Inspect current size handling**
- Confirm which wrappers respond to `size === "small"`.
- Compare this to the external reference’s size-driven spacing model.

**Step 2: Keep changes minimal**
- Preserve the existing `size` API.
- Only adjust small-size classes if there is an obvious inconsistency directly related to the alignment work.
- Do not port the full reference typography/surface system.

**Step 3: Avoid unnecessary redesign**
- If current small-size support is acceptable, leave it unchanged.
- Prefer no-op over speculative style churn.

### Task 3: Verify the wrapper change through package checks

**Files:**
- Verify: `@acme/ui/src/components/card/_components/index.tsx`
- Verify indirectly: `@acme/ui/src/components/card/card.stories.tsx`

**Step 1: Run fresh typecheck from workspace root**
Run:
```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui typecheck
```

**Expected:**
- Command succeeds without TypeScript errors.

**Step 2: Inspect story usage if needed**
- Check `WithAction` and related Card stories to ensure the header still renders with the intended composition.
- Prefer Storybook inspection only if clarification is needed beyond typecheck.

### Task 4: Review scope and report findings

**Files:**
- Review: `@acme/ui/src/components/card/_components/index.tsx`
- Review if relevant: `@acme/ui/src/components/card/card.stories.tsx`

**Step 1: Confirm requirement coverage**
- Local wrapper drift from shadcn is reduced.
- Existing size support remains available.

**Step 2: Confirm protected paths were respected**
- `@acme/ui/src/shadcn/` remains unchanged.
- Only local wrapper files were modified unless strictly necessary.

**Step 3: Prepare final report with evidence**
- Reference the exact modified file.
- Include the verification command and result.
