# CardAction Story Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a dedicated Storybook story that demonstrates `CardAction` usage in the Card header with shadcn-style composition.

**Architecture:** Keep the change scoped to the existing Card Storybook file by adding one new story variant. Reuse the already exported Card composition primitives so the example reflects the intended public API without modifying component logic.

**Tech Stack:** React, TypeScript, Storybook (`@storybook/nextjs-vite`), `@acme/ui` component library, PNPM

---

### Task 1: Update Card Storybook imports

**Files:**
- Modify: `@acme/ui/src/components/card/card.stories.tsx`

**Step 1: Inspect the current story imports**
- Confirm whether `CardAction` is already imported from `@acme/ui/components/card`.
- Keep all existing imports unless they become unused.

**Step 2: Write the minimal import change**
- Add `CardAction` to the existing card component import list.
- Do not change unrelated imports or formatting.

**Step 3: Verify the story file remains clean**
- Ensure import ordering still matches the file’s current style.
- Ensure there are no newly unused imports.

### Task 2: Add the `WithAction` story

**Files:**
- Modify: `@acme/ui/src/components/card/card.stories.tsx`

**Step 1: Add a new story block named `WithAction`**
- Place it near other single-card examples such as `WithFooter` / `Interactive` so it is easy to discover.
- Use `Story` as the type, matching the file’s established pattern.

**Step 2: Render the shadcn-style card composition**
- Use this structure inside `render`:
  - `Card className="w-[350px]"`
  - `CardHeader`
  - `CardTitle`
  - `CardDescription`
  - `CardAction`
  - `CardContent`
- Put the action inside `CardAction` directly rather than using the `extra` prop.
- Use a simple small action control that reads naturally in Storybook, for example a subtle button or text action.

**Step 3: Keep content minimal and focused**
- Use short copy that explains the purpose of the example.
- Avoid footer content unless it is required to clarify layout.
- Do not refactor existing stories.

### Task 3: Verify the story compiles

**Files:**
- Verify: `@acme/ui/src/components/card/card.stories.tsx`

**Step 1: Run a targeted check from the repository root**
Run:
```bash
pnpm -F @acme/ui typecheck
```

**Expected:**
- Command succeeds without TypeScript errors caused by the new story.

**Step 2: If typecheck is too broad or unavailable, use a targeted fallback**
Run:
```bash
pnpm -F @acme/ui lint
```

**Expected:**
- The story file passes linting and import usage checks.

**Step 3: Confirm the change scope**
- Verify only the intended story file changed for implementation.
- Do not make unrelated cleanups.

### Task 4: Review and simplify the change

**Files:**
- Review: `@acme/ui/src/components/card/card.stories.tsx`

**Step 1: Check the new story against nearby patterns**
- Ensure naming, spacing, and class usage match surrounding stories.
- Ensure the example demonstrates `CardAction` clearly.

**Step 2: Keep the implementation minimal**
- Remove any extra UI elements that are not necessary for demonstrating `CardAction`.
- Prefer the smallest example that still looks realistic.

**Step 3: Prepare for final verification**
- Re-run the chosen verification command if the review caused edits.
- Only then report completion.
