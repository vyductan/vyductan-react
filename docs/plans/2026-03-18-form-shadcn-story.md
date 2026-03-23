# Form Shadcn Story Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a dedicated Storybook CSF story for the existing shadcn-style form demo so it appears as a standard Storybook story entry.

**Architecture:** Reuse the existing demo component at `@acme/ui/src/components/form/demo/shadcn.tsx` instead of duplicating form UI inside a story file. Add a single `form.stories.tsx` file in the form component directory that exports one `Shadcn` story with minimal Storybook metadata and leaves the current MDX docs page unchanged.

**Tech Stack:** React, TypeScript, Storybook CSF (`Meta`, `StoryObj`), PNPM, existing `@acme/ui` Storybook/Vitest setup.

---

### Task 1: Add a failing story discovery check

**Files:**
- Create: `@acme/ui/src/components/form/form.stories.tsx`
- Reference: `@acme/ui/src/components/form/form.mdx:1-92`
- Reference: `@acme/ui/src/components/form/demo/shadcn.tsx:1-336`

**Step 1: Create the minimal story file in a failing state**

Start with a deliberately incomplete story file so Storybook discovery/build or TypeScript validation fails before the final implementation. For example, create the file with only the import and a broken/incomplete `meta` export.

```tsx
import type { Meta } from "@storybook/react";
import ShadcnDemo from "./demo/shadcn";

const meta = {
  title: "Components/Form",
  component: ShadcnDemo,
} satisfies Meta<typeof ShadcnDemo>;

export default meta;

export const Shadcn = {
  // intentionally incomplete during RED step
};
```

**Step 2: Run type/story validation to verify RED**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec tsc --noEmit --emitDeclarationOnly false
```

Expected: FAIL for the intentionally incomplete story typing, proving the new file is part of the validated surface.

### Task 2: Implement the minimal Storybook story

**Files:**
- Create/Modify: `@acme/ui/src/components/form/form.stories.tsx`

**Step 1: Replace the failing placeholder with the minimal passing story**

Use a single-story CSF file that reuses the existing demo:

```tsx
import type { Meta, StoryObj } from "@storybook/react";

import ShadcnDemo from "./demo/shadcn";

const meta = {
  title: "Components/Form",
  component: ShadcnDemo,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof ShadcnDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Shadcn: Story = {};
```

Guidelines:
- Reuse `./demo/shadcn` directly
- Export only one story: `Shadcn`
- Keep the file minimal; do not add extra variants
- Do not modify `form.mdx` unless verification proves it is necessary

**Step 2: Keep naming aligned with the form area**

Check that the title matches the project’s Storybook organization style if there are nearby component stories. If there is an established local naming convention, adapt the title to match it exactly; otherwise keep `Components/Form`.

### Task 3: Verify the story integration

**Files:**
- Verify: `@acme/ui/src/components/form/form.stories.tsx`
- Verify: `@acme/ui/src/components/form/demo/shadcn.tsx`

**Step 1: Run typecheck to verify GREEN**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" typecheck
```

Expected: PASS

**Step 2: Run a Storybook-focused verification command**

If a lightweight check is available, run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" storybook:build
```

Expected: PASS and the story is discovered successfully.

If this command is too heavy for the environment or fails for unrelated pre-existing issues, record the exact failure and do not broaden the code changes.

**Step 3: Confirm scope stayed minimal**

Verify:
- the story renders `demo/shadcn.tsx`
- only one new story was added
- `form.mdx` remains unchanged unless absolutely required
- no demo UI was duplicated into the story file

### Task 4: Commit the focused Storybook change

**Files:**
- Stage: `@acme/ui/src/components/form/form.stories.tsx`

**Step 1: Stage only the relevant file(s)**

```bash
git add @acme/ui/src/components/form/form.stories.tsx
```

If another file had to change during verification, stage it explicitly by name only.

**Step 2: Create a focused commit**

```bash
git commit -m "feat: add shadcn form storybook story"
```

Expected: One small commit containing only the new Storybook story work.
