# Interactive Card Story Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove misleading full-card click affordances from the existing `Interactive` Card story while preserving the footer button as the actual interaction.

**Architecture:** Keep the fix scoped to the Storybook story file by editing only the `Interactive` story markup. Avoid API or component logic changes; this is a documentation/example correction, not a component behavior change.

**Tech Stack:** React, TypeScript, Storybook (`@storybook/nextjs-vite`), `@acme/ui`, PNPM

---

### Task 1: Update the `Interactive` story styling

**Files:**
- Modify: `@acme/ui/src/components/card/card.stories.tsx:108-130`

**Step 1: Inspect the current `Interactive` story**
- Confirm the `Card` currently uses `cursor-pointer transition-all hover:shadow-lg`.
- Confirm the only actual interaction remains the footer `Button`.

**Step 2: Apply the minimal story fix**
- Remove the misleading interactive classes from the `Card` container.
- Keep the rest of the story structure unchanged unless required to maintain formatting.

**Step 3: Re-read the edited story**
- Ensure the card no longer visually implies full-card click behavior.
- Ensure the footer button remains the only obvious interactive element.

### Task 2: Verify the story file

**Files:**
- Verify: `@acme/ui/src/components/card/card.stories.tsx`

**Step 1: Run a fresh targeted typecheck from the workspace root**
Run:
```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui typecheck
```

**Expected:**
- Command succeeds without TypeScript errors.

**Step 2: If the command fails for workspace reasons, state the exact failure**
- Do not claim success from stale output.
- Only report passing if the fresh command exits cleanly.

### Task 3: Review scope and finish

**Files:**
- Review: `@acme/ui/src/components/card/card.stories.tsx`

**Step 1: Confirm scope**
- Verify only the intended Storybook file was changed for this fix.
- Do not introduce unrelated cleanups.

**Step 2: Confirm requirement coverage**
- The story should no longer teach a misleading clickable-card pattern.
- The footer button should remain intact as the actual interaction.

**Step 3: Prepare final report with evidence**
- Reference the updated story location.
- Include the verification command that was run and the result.
