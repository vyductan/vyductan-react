# Descriptions size small Storybook Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Storybook comparison story for `Descriptions` so `size="small"` can be visually compared against the default/middle spacing in one screen.

**Architecture:** Add a colocated CSF story file for the `Descriptions` component under the component directory. Keep the change documentation-only by reusing one shared `items` dataset and rendering two `Descriptions` instances side by side in a single comparison story, with no runtime component changes.

**Tech Stack:** React 19, TypeScript, Storybook 10 (`@storybook/nextjs-vite`), PNPM workspace, `@acme/ui`

---

### Task 1: Create the Descriptions Storybook file

**Files:**
- Create: `@acme/ui/src/components/descriptions/descriptions.stories.tsx`
- Reference: `@acme/ui/src/components/descriptions/descriptions.tsx:42-262`
- Reference: `@acme/ui/src/components/card/card.stories.tsx:1-207`
- Reference: `@acme/ui/src/components/badge/badge.stories.tsx:1-67`

**Step 1: Write the story file skeleton**

Create a CSF story file that matches the repo’s Storybook pattern:

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Descriptions } from ".";

const meta = {
  title: "Components/Descriptions",
  component: Descriptions,
} satisfies Meta<typeof Descriptions>;

export default meta;
type Story = StoryObj<typeof meta>;
```

**Step 2: Add one shared dataset for all comparisons**

Define one `items` array using the `Descriptions` prop shape so both examples render identical content. Reuse the same labels and values currently used by the demo component in `@acme/ui/src/components/descriptions/demo/basic.tsx:6-43`.

Example structure:

```tsx
const items = [
  { key: "1", label: "UserName", children: "Zhou Maomao" },
  { key: "2", label: "Telephone", children: "1810000000" },
  { key: "3", label: "Live", children: "Hangzhou, Zhejiang" },
  { key: "4", label: "First Name", children: "John" },
  { key: "5", label: "Last Name", children: "Doe", span: 2 },
  { key: "6", label: "Remark", children: "empty" },
  {
    key: "7",
    label: "Address",
    children: "No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China",
  },
];
```

**Step 3: Add a `CompareSizes` story that renders both variants side by side**

Use a custom `render` so the story shows two clearly labeled examples in one screen. Keep both examples `bordered` and horizontal because size-specific spacing is currently applied in the horizontal table cell classes inside `@acme/ui/src/components/descriptions/descriptions.tsx:108-129`.

Example render structure:

```tsx
export const CompareSizes: Story = {
  render: () => (
    <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-2">
      <section className="space-y-3">
        <h3 className="text-sm font-medium">size=&quot;small&quot;</h3>
        <Descriptions title="User Info" bordered size="small" items={items} />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">size=&quot;middle&quot;</h3>
        <Descriptions title="User Info" bordered size="middle" items={items} />
      </section>
    </div>
  ),
};
```

**Step 4: Keep the story focused on visual comparison only**

Do not add controls, helper abstractions, or extra variants unless they are required for the story to render. The purpose is to make the `small` spacing easy to inspect, not to redesign the docs surface.

**Step 5: Commit**

```bash
git add @acme/ui/src/components/descriptions/descriptions.stories.tsx
git commit -m "docs: add descriptions size comparison story"
```

### Task 2: Verify the story renders and isolates the size difference

**Files:**
- Test: `@acme/ui/src/components/descriptions/descriptions.stories.tsx`
- Reference: `@acme/ui/package.json:8-23`

**Step 1: Run Storybook test or targeted validation for the new story**

From the repo root, run one of the existing `@acme/ui` verification commands:

```bash
pnpm -F @acme/ui test -- --runInBand
```

If the Storybook Vitest project is too broad for the current change, use the package-level alias instead:

```bash
pnpm -F @acme/ui test:storybook -- --runInBand
```

**Step 2: Verify the expected result**

Expected:
- PASS without TypeScript or Storybook import errors
- The new story file is discovered successfully
- No regressions in existing story-based tests

If the command reports unrelated existing failures, record them and confirm the new story compiles cleanly before moving on.

**Step 3: Optional manual visual verification in Storybook**

If automated output is inconclusive, run:

```bash
pnpm -F @acme/ui storybook
```

Then open the `Components/Descriptions` story and confirm:
- the two panels render side by side on large screens
- both use the same content
- `size="small"` appears visually tighter than `size="middle"`

**Step 4: Commit**

```bash
git add @acme/ui/src/components/descriptions/descriptions.stories.tsx
git commit -m "test: verify descriptions comparison story"
```

### Task 3: Review for simplicity and project fit

**Files:**
- Review: `@acme/ui/src/components/descriptions/descriptions.stories.tsx`

**Step 1: Check the story against repo patterns**

Confirm the final story:
- uses `Meta`/`StoryObj` from `@storybook/nextjs-vite`
- uses the component directory title convention `Components/Descriptions`
- avoids one-off helpers unless they remove real duplication
- keeps the comparison understandable without additional docs text

**Step 2: Run formatting/linting only if needed**

If the new file triggers formatting or lint issues, run:

```bash
pnpm -F @acme/ui lint @acme/ui/src/components/descriptions/descriptions.stories.tsx
```

If that command shape is unsupported in this repo, use the package lint script instead:

```bash
pnpm -F @acme/ui lint
```

Expected:
- PASS, or only unrelated pre-existing issues

**Step 3: Commit**

```bash
git add @acme/ui/src/components/descriptions/descriptions.stories.tsx
git commit -m "chore: align descriptions story with storybook conventions"
```
