# Card WithAction Width Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep the `WithAction` Card story using shadcn-style width classes while giving the Storybook preview enough width to display it near its intended 384px max width by default.

**Architecture:** Scope the fix to the Card story file. Preserve responsive card sizing semantics and adjust only the `WithAction` story’s local preview/layout behavior so the canvas container does not artificially squeeze the example.

**Tech Stack:** React, TypeScript, Storybook (`@storybook/nextjs-vite`), Tailwind CSS, `@acme/ui`, PNPM

---

### Task 1: Update `WithAction` width classes

**Files:**
- Modify: `@acme/ui/src/components/card/card.stories.tsx:87-135`

**Step 1: Inspect the current `WithAction` story**
- Confirm the story currently uses `w-full max-w-sm`.
- Confirm the example should stay aligned with shadcn-style usage.

**Step 2: Apply the requested width classes**
- Change the card class list to `w-full min-w-sm max-w-sm`.
- Keep the rest of the story structure intact unless a small wrapper is required.

**Step 3: Re-read the story**
- Confirm the width classes are exactly as requested.
- Ensure there are no unrelated story changes.

### Task 2: Widen the `WithAction` preview locally

**Files:**
- Modify: `@acme/ui/src/components/card/card.stories.tsx:87-135`
- Reference only if needed: `@acme/ui/.storybook/preview.tsx`

**Step 1: Apply a story-scoped layout override**
- Prefer adding `parameters: { layout: "padded" }` on `WithAction` instead of changing global defaults.
- If layout alone is insufficient, add a local wrapper with enough width (for example a container that can grow beyond the centered intrinsic width).

**Step 2: Keep the fix story-local**
- Do not change the file-level `meta.parameters.layout` unless it is clearly necessary.
- Do not change `@acme/ui/.storybook/preview.tsx` unless the local story override cannot solve the problem.

**Step 3: Verify the story remains readable**
- Ensure the card still centers nicely in the canvas.
- Ensure the preview change does not distort surrounding stories.

### Task 3: Verify with a fresh package check

**Files:**
- Verify: `@acme/ui/src/components/card/card.stories.tsx`

**Step 1: Run fresh typecheck from workspace root**
Run:
```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui typecheck
```

**Expected:**
- Command succeeds without TypeScript errors.

**Step 2: State exact result**
- Only claim success if the fresh command completes cleanly.
- If it fails, report the actual error output.

### Task 4: Review scope before completion

**Files:**
- Review: `@acme/ui/src/components/card/card.stories.tsx`
- Review only if modified: `@acme/ui/.storybook/preview.tsx`

**Step 1: Confirm requirement coverage**
- `WithAction` uses `w-full min-w-sm max-w-sm`.
- The storybook preview is widened by default for this story, not necessarily globally.

**Step 2: Confirm blast radius**
- Prefer only one changed implementation file.
- Avoid unrelated Storybook configuration changes.

**Step 3: Prepare final report with evidence**
- Reference the exact story location.
- Include the verification command and result.
