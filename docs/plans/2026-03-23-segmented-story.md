# Segmented Story Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Storybook coverage for `Segmented` and remove the sluggish background transition so switching active items feels immediate.

**Architecture:** Keep the change local to the existing segmented component directory. Add a colocated story file that exercises the current public API and highlights the inactive container background, then make a minimal styling change in the trigger classes by replacing the broad transition rule with narrower transitions that do not animate background fills.

**Tech Stack:** React 19, TypeScript, Storybook 10 (`@storybook/nextjs-vite`), Radix Tabs, Tailwind CSS, Vitest, PNPM workspace, `@acme/ui`

---

### Task 1: Lock the trigger transition behavior with a focused source-level regression test

**Files:**
- Create: `@acme/ui/src/components/segmented/segmented.style.test.ts`
- Reference: `@acme/ui/src/components/segmented/segmented.tsx`

**Step 1: Write the failing test**

Create a small Vitest file that reads `segmented.tsx` as text and asserts the trigger class string no longer uses `transition-all`.

Suggested test:

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("Segmented trigger styles", () => {
  test("does not animate all properties on trigger state changes", () => {
    const source = readFileSync(
      resolve(import.meta.dirname, "./segmented.tsx"),
      "utf8",
    );

    expect(source).not.toContain("transition-all");
  });
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/segmented/segmented.style.test.ts
```

Expected:
- FAIL because `segmented.tsx` still contains `transition-all`

**Step 3: Write minimal implementation target**

Do not change `segmented.tsx` yet. Keep the test red until Task 3.

**Step 4: Re-run the targeted test after implementation**

Run the same command after Task 3.

Expected:
- PASS

**Step 5: Commit**

```bash
git add @acme/ui/src/components/segmented/segmented.style.test.ts @acme/ui/src/components/segmented/segmented.tsx
git commit -m "test: lock segmented trigger transition behavior"
```

### Task 2: Add a colocated Segmented Storybook story file

**Files:**
- Create: `@acme/ui/src/components/segmented/segmented.stories.tsx`
- Reference: `@acme/ui/src/components/segmented/segmented.tsx`
- Reference: `@acme/ui/src/components/button/button.stories.tsx`

**Step 1: Write the failing test**

Create a second test in `@acme/ui/src/components/segmented/segmented.style.test.ts` or a separate `segmented.story-structure.test.ts` file that asserts the story file exists and contains the expected exports.

Suggested assertion target:

```ts
test("defines segmented stories for playground and background inspection", () => {
  const source = readFileSync(
    resolve(import.meta.dirname, "./segmented.stories.tsx"),
    "utf8",
  );

  expect(source).toContain('title: "Components/Segmented"');
  expect(source).toContain("export const Playground");
  expect(source).toContain("export const BackgroundContrast");
  expect(source).toContain("export const Block");
});
```

**Step 2: Run test to verify it fails**

Run one of:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/segmented/segmented.style.test.ts
```

or, if you use a separate file:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/segmented/segmented.story-structure.test.ts
```

Expected:
- FAIL because the story file does not exist yet

**Step 3: Write minimal story implementation**

Create `segmented.stories.tsx` with:
- `Meta` and `StoryObj` from `@storybook/nextjs-vite`
- `title: "Components/Segmented"`
- `component: Segmented`
- centered or padded layout suitable for inspecting the muted container background
- controls for `size`, `block`, and `disabled`
- realistic `options` args such as `Daily`, `Weekly`, `Monthly`

Suggested story structure:

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Segmented } from "./segmented";

const meta = {
  title: "Components/Segmented",
  component: Segmented,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    size: {
      control: "radio",
      options: ["default", "sm", "lg"],
    },
    block: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
  },
  args: {
    defaultValue: "daily",
    options: [
      { label: "Daily", value: "daily" },
      { label: "Weekly", value: "weekly" },
      { label: "Monthly", value: "monthly" },
    ],
  },
} satisfies Meta<typeof Segmented>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const BackgroundContrast: Story = {
  render: (args) => (
    <div className="rounded-xl bg-background p-6">
      <Segmented {...args} />
    </div>
  ),
};

export const Block: Story = {
  args: {
    block: true,
  },
  render: (args) => (
    <div className="w-96 rounded-xl bg-background p-6">
      <Segmented {...args} />
    </div>
  ),
};
```

Keep the story file minimal. Do not add interaction tests unless truly needed.

**Step 4: Run the targeted test to verify it passes**

Run the same Vitest command from Step 2.

Expected:
- PASS

**Step 5: Commit**

```bash
git add @acme/ui/src/components/segmented/segmented.stories.tsx @acme/ui/src/components/segmented/segmented.style.test.ts
git commit -m "feat: add segmented storybook stories"
```

### Task 3: Remove background animation from Segmented trigger state changes

**Files:**
- Modify: `@acme/ui/src/components/segmented/segmented.tsx:95-98`
- Reference: `@acme/ui/src/components/segmented/segmented.style.test.ts`

**Step 1: Use the failing transition test from Task 1**

Keep the existing red assertion that forbids `transition-all`.

**Step 2: Run the targeted test and confirm the red state**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/segmented/segmented.style.test.ts
```

Expected:
- FAIL because the trigger class still contains `transition-all`

**Step 3: Write minimal implementation**

Edit the trigger classes in `segmented.tsx` and replace `transition-all` with a narrower transition that does not animate background color.

Recommended minimal change:

```tsx
className={cn(
  "ring-offset-background focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm",
  block && "flex-1",
)}
```

If Tailwind arbitrary transition syntax is awkward in this codebase, the fallback minimal change is to remove the transition utility entirely.

**Step 4: Run the targeted test to verify it passes**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/segmented/segmented.style.test.ts
```

Expected:
- PASS

**Step 5: Commit**

```bash
git add @acme/ui/src/components/segmented/segmented.tsx @acme/ui/src/components/segmented/segmented.style.test.ts
git commit -m "fix: remove segmented background transition lag"
```

### Task 4: Verify Segmented stories and component behavior

**Files:**
- Verify: `@acme/ui/src/components/segmented/segmented.stories.tsx`
- Verify: `@acme/ui/src/components/segmented/segmented.tsx`
- Verify: `@acme/ui/src/components/segmented/segmented.style.test.ts`

**Step 1: Run focused automated checks**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/segmented/segmented.style.test.ts
pnpm -F @acme/ui typecheck
```

Expected:
- PASS

**Step 2: Open the stories in Storybook**

Use these routes:

```text
http://localhost:6006/?path=/story/components-segmented--playground
http://localhost:6006/?path=/story/components-segmented--background-contrast
http://localhost:6006/?path=/story/components-segmented--block
```

Confirm:
- all three stories render
- inactive container background stays visually stable
- active item background switches immediately when changing tabs
- block mode stretches evenly without layout issues

**Step 3: Re-run final verification**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/segmented/segmented.style.test.ts
pnpm -F @acme/ui typecheck
```

Expected:
- PASS

**Step 4: Commit**

```bash
git add @acme/ui/src/components/segmented/segmented.tsx @acme/ui/src/components/segmented/segmented.stories.tsx @acme/ui/src/components/segmented/segmented.style.test.ts
git commit -m "feat: document segmented states in storybook"
```
