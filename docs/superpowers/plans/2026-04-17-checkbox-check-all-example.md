# Checkbox Check All Example Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a docs-first "Check all" checkbox example that demonstrates `indeterminate` with `Checkbox.Group` in Storybook and the Checkbox MDX docs.

**Architecture:** Add a dedicated example component for the "check all" interaction, then wire it into both the Storybook story exports and the MDX docs partials following the existing checkbox docs-first pattern. Reuse the existing checkbox docs config test to lock in story/docs wiring instead of introducing a new test style.

**Tech Stack:** React, TypeScript, Vitest, Storybook MDX, `@acme/ui` Checkbox components

---

## File Structure

- **Create:** `packages/ui/src/components/checkbox/examples/check-all.tsx`
  - Self-contained demo using `Checkbox`, `Checkbox.Group`, and local React state to drive `checked`, `indeterminate`, and `checkedList`.
- **Create:** `packages/ui/src/components/checkbox/examples/check-all.mdx`
  - MDX partial that documents the new example through `ComponentSource`.
- **Modify:** `packages/ui/src/components/checkbox/checkbox.stories.tsx`
  - Import the new example and export a dedicated `CheckAll` story.
- **Modify:** `packages/ui/src/components/checkbox/checkbox.mdx`
  - Import the new MDX partial and include it in the docs examples list.
- **Modify:** `packages/ui/src/components/checkbox/checkbox.docs-config.test.ts`
  - Extend the example inventory assertions so docs/stories fail if the new example is missing or wired incorrectly.

---

### Task 1: Add the failing docs-config test coverage for the new example

**Files:**
- Modify: `packages/ui/src/components/checkbox/checkbox.docs-config.test.ts`
- Test: `packages/ui/src/components/checkbox/checkbox.docs-config.test.ts`

- [ ] **Step 1: Write the failing test inventory entry for the new example**

Update the inventory near the top of `packages/ui/src/components/checkbox/checkbox.docs-config.test.ts` to include the new example:

```ts
  {
    heading: "Check All",
    sourcePath: "checkbox/examples/check-all.tsx",
    partialImportPath: "./examples/check-all.mdx",
    partialComponentName: "CheckAllExample",
  },
```

- [ ] **Step 2: Run the docs-config test to verify it fails**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run src/components/checkbox/checkbox.docs-config.test.ts
```

Expected: FAIL because `./examples/check-all.mdx`, the docs import, and the story wiring do not exist yet.

- [ ] **Step 3: Keep the rest of the test file unchanged**

Do not add a new test block. The existing inventory-driven assertions should be the only failing signal, which keeps this aligned with the current Checkbox docs contract.

- [ ] **Step 4: Commit the failing test change**

```bash
git add packages/ui/src/components/checkbox/checkbox.docs-config.test.ts
git commit -m "test: require checkbox check-all docs wiring"
```

---

### Task 2: Implement the new Check All example component

**Files:**
- Create: `packages/ui/src/components/checkbox/examples/check-all.tsx`
- Test: `packages/ui/src/components/checkbox/checkbox.docs-config.test.ts`

- [ ] **Step 1: Create the example component with local state and derived flags**

Create `packages/ui/src/components/checkbox/examples/check-all.tsx` with this implementation:

```tsx
import type React from "react";
import { useMemo, useState } from "react";

import { Checkbox } from "@acme/ui/components/checkbox";

const plainOptions = ["Apple", "Pear", "Orange"] as const;

type PlainOption = (typeof plainOptions)[number];

const App: React.FC = () => {
  const [checkedList, setCheckedList] = useState<PlainOption[]>(["Apple", "Pear"]);

  const indeterminate =
    checkedList.length > 0 && checkedList.length < plainOptions.length;
  const checkAll = checkedList.length === plainOptions.length;
  const groupOptions = useMemo(
    () => plainOptions.map((option) => ({ label: option, value: option })),
    [],
  );

  return (
    <div className="grid gap-3">
      <Checkbox
        checked={checkAll}
        indeterminate={indeterminate}
        onChange={(event) => {
          setCheckedList(event.target.checked ? [...plainOptions] : []);
        }}
      >
        Check all
      </Checkbox>
      <div className="bg-border h-px w-full" />
      <Checkbox.Group
        options={groupOptions}
        value={checkedList}
        onChange={(values) => {
          setCheckedList(values as PlainOption[]);
        }}
      />
    </div>
  );
};

export default App;
```

- [ ] **Step 2: Run the docs-config test to confirm it still fails for missing docs wiring**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run src/components/checkbox/checkbox.docs-config.test.ts
```

Expected: FAIL, but now only because the MDX partial and story/docs imports are still missing.

- [ ] **Step 3: Commit the example component**

```bash
git add packages/ui/src/components/checkbox/examples/check-all.tsx
git commit -m "feat: add checkbox check-all example component"
```

---

### Task 3: Wire the example into Storybook stories and MDX docs

**Files:**
- Create: `packages/ui/src/components/checkbox/examples/check-all.mdx`
- Modify: `packages/ui/src/components/checkbox/checkbox.stories.tsx`
- Modify: `packages/ui/src/components/checkbox/checkbox.mdx`
- Test: `packages/ui/src/components/checkbox/checkbox.docs-config.test.ts`

- [ ] **Step 1: Create the MDX partial for the new example**

Create `packages/ui/src/components/checkbox/examples/check-all.mdx`:

```mdx
import { Meta } from "@storybook/addon-docs/blocks";

import { ComponentSource } from "@acme/ui/components/mdx";

import CheckAllExample from "./check-all";

<Meta isTemplate />

### Check All

The indeterminate property can help you to achieve a 'check all' effect.

<ComponentSource
  src="checkbox/examples/check-all.tsx"
  __comp__={CheckAllExample}
/>
```

- [ ] **Step 2: Add the story export in `checkbox.stories.tsx`**

Make these edits in `packages/ui/src/components/checkbox/checkbox.stories.tsx`:

```tsx
import CheckAllExample from "./examples/check-all";
```

Add this story after `CheckboxGroup` and before `WithDescription`:

```tsx
export const CheckAll: Story = {
  render: () => (
    <ComponentSource
      src="checkbox/examples/check-all.tsx"
      __comp__={CheckAllExample}
    />
  ),
};
```

- [ ] **Step 3: Add the MDX partial to `checkbox.mdx`**

Make these edits in `packages/ui/src/components/checkbox/checkbox.mdx`:

```mdx
import CheckAllExample from "./examples/check-all.mdx";
```

Then include it in the examples section between `<BasicExample />` and `<CardExample />`:

```mdx
<BasicExample />

<CheckAllExample />

<CardExample />
```

- [ ] **Step 4: Run the docs-config test to verify the docs wiring passes**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run src/components/checkbox/checkbox.docs-config.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the docs/story wiring**

```bash
git add \
  packages/ui/src/components/checkbox/examples/check-all.mdx \
  packages/ui/src/components/checkbox/checkbox.stories.tsx \
  packages/ui/src/components/checkbox/checkbox.mdx
git commit -m "feat: document checkbox check-all example"
```

---

### Task 4: Verify the example behavior and keep existing checkbox docs green

**Files:**
- Modify: `packages/ui/src/components/checkbox/checkbox.docs-config.test.ts` (only if the inventory needs final ordering cleanup)
- Test: `packages/ui/src/components/checkbox/checkbox.docs-config.test.ts`
- Test: `packages/ui/src/components/checkbox/checkbox.test.tsx`

- [ ] **Step 1: Run the checkbox docs-config test again as a final guard**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run src/components/checkbox/checkbox.docs-config.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run the existing checkbox behavioral test file to confirm no regressions**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run src/components/checkbox/checkbox.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Run checkbox-only lint across the touched docs/example files**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react/packages/ui" exec eslint \
  src/components/checkbox/checkbox.stories.tsx \
  src/components/checkbox/checkbox.mdx \
  src/components/checkbox/checkbox.docs-config.test.ts \
  src/components/checkbox/examples/check-all.tsx
```

Expected: no output.

- [ ] **Step 4: Commit the verification pass if any final cleanup was needed**

```bash
git add packages/ui/src/components/checkbox
git commit -m "test: verify checkbox check-all docs example"
```

---

## Self-Review

- **Spec coverage:** The plan covers the dedicated Check All example component, Storybook story export, MDX docs inclusion, and docs wiring verification.
- **Placeholder scan:** No TODO/TBD placeholders remain; each task lists exact files, code, and commands.
- **Type consistency:** The example consistently uses `CheckAllExample` for the MDX partial import name and `check-all.tsx` as the source path across tests, stories, and docs.
