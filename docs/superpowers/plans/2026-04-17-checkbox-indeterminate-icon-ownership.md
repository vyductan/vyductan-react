# Checkbox Indeterminate Icon Ownership Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move indeterminate icon ownership out of `src/shadcn/checkbox.tsx` so the design system can keep its custom default indicator while the shadcn file stays upstream-style.

**Architecture:** Introduce an internal checkbox control component under `src/components/checkbox/_components/` that wraps the Radix checkbox root/indicator and owns the default checked/indeterminate icons. Then update the public checkbox wrapper and the composable branch to use that internal control, while restoring `src/shadcn/checkbox.tsx` to a minimal upstream-style implementation.

**Tech Stack:** React, TypeScript, Radix UI checkbox primitive, lucide-react, Vitest, ESLint

---

## File Structure

- **Create:** `packages/ui/src/components/checkbox/_components/checkbox-control.tsx`
  - Internal design-system checkbox control that wraps the Radix checkbox primitive and owns indicator visuals.
- **Modify:** `packages/ui/src/components/checkbox/checkbox.tsx`
  - Replace direct use of `../../shadcn/checkbox` with the new internal control.
- **Modify:** `packages/ui/src/components/checkbox/index.tsx`
  - Point the composable/no-children branch at the new internal control instead of the shadcn file.
- **Modify:** `packages/ui/src/shadcn/checkbox.tsx`
  - Restore it to an upstream-style checkbox implementation with only the standard check indicator.
- **Modify:** `packages/ui/src/components/checkbox/checkbox.test.tsx`
  - Add a regression test that proves indeterminate state remains rendered through the public checkbox API after the ownership move.

---

### Task 1: Add a failing regression test for public indeterminate rendering

**Files:**
- Modify: `packages/ui/src/components/checkbox/checkbox.test.tsx`
- Test: `packages/ui/src/components/checkbox/checkbox.test.tsx`

- [ ] **Step 1: Write the failing test that locks public indeterminate rendering to the checkbox layer**

Add this test near the existing checkbox behavior tests in `packages/ui/src/components/checkbox/checkbox.test.tsx`:

```tsx
test("public Checkbox keeps an indicator when rendered as indeterminate", () => {
  const { container } = render(<PublicCheckbox checked="indeterminate" />);

  const checkbox = screen.getByRole("checkbox");
  const indicator = container.querySelector('[data-slot="checkbox-indicator"]');

  expect(checkbox).toHaveAttribute("data-state", "indeterminate");
  expect(indicator).not.toBeNull();
});
```

- [ ] **Step 2: Run the checkbox test file to verify the new test fails for the expected reason**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run src/components/checkbox/checkbox.test.tsx
```

Expected: FAIL only if the current public checkbox path depends on `src/shadcn/checkbox.tsx` ownership in a way that breaks once we start extracting the implementation. If it passes immediately, keep the test — it still serves as the regression lock before the refactor.

- [ ] **Step 3: Do not add snapshot testing or shadcn-file-specific assertions**

Keep the test focused on the public API contract (`PublicCheckbox` + `data-state` + indicator presence), not on implementation details of `src/shadcn/checkbox.tsx`.

- [ ] **Step 4: Commit the test change**

```bash
git add packages/ui/src/components/checkbox/checkbox.test.tsx
git commit -m "test: lock checkbox indeterminate indicator behavior"
```

---

### Task 2: Create the internal checkbox control and switch the public wrapper to it

**Files:**
- Create: `packages/ui/src/components/checkbox/_components/checkbox-control.tsx`
- Modify: `packages/ui/src/components/checkbox/checkbox.tsx`
- Test: `packages/ui/src/components/checkbox/checkbox.test.tsx`

- [ ] **Step 1: Create the internal checkbox control component**

Create `packages/ui/src/components/checkbox/_components/checkbox-control.tsx` with this implementation:

```tsx
import * as React from "react";
import { CheckIcon, MinusIcon } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";

import { cn } from "../../../lib/utils";

type CheckboxControlProperties = React.ComponentProps<
  typeof CheckboxPrimitive.Root
>;

function CheckboxControl({
  className,
  ...properties
}: CheckboxControlProperties) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "group peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-primary",
        "data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-primary",
        className,
      )}
      {...properties}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="hidden size-3.5 group-data-[state=checked]:block" />
        <MinusIcon className="hidden size-3.5 group-data-[state=indeterminate]:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { CheckboxControl };
export type { CheckboxControlProperties };
```

- [ ] **Step 2: Update `checkbox.tsx` to use the internal control**

Change the import in `packages/ui/src/components/checkbox/checkbox.tsx` from:

```tsx
import { Checkbox as ShadcnCheckbox } from "../../shadcn/checkbox";
```

to:

```tsx
import { CheckboxControl } from "./_components/checkbox-control";
```

Then update the rendered control from:

```tsx
<ShadcnCheckbox
```

to:

```tsx
<CheckboxControl
```

Leave the rest of the public wrapper behavior untouched.

- [ ] **Step 3: Run the checkbox test file to verify the wrapper still passes**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run src/components/checkbox/checkbox.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Commit the internal control extraction**

```bash
git add \
  packages/ui/src/components/checkbox/_components/checkbox-control.tsx \
  packages/ui/src/components/checkbox/checkbox.tsx \
  packages/ui/src/components/checkbox/checkbox.test.tsx
git commit -m "refactor: move checkbox indicator ownership into internal control"
```

---

### Task 3: Point the composable checkbox branch at the internal control

**Files:**
- Modify: `packages/ui/src/components/checkbox/index.tsx`
- Test: `packages/ui/src/components/checkbox/checkbox.test.tsx`

- [ ] **Step 1: Replace the shadcn import in `checkbox/index.tsx`**

Change the import in `packages/ui/src/components/checkbox/index.tsx` from:

```tsx
import { Checkbox as ShadcnCheckbox } from "../../shadcn/checkbox";
```

to:

```tsx
import { CheckboxControl } from "./_components/checkbox-control";
```

- [ ] **Step 2: Keep the branch logic but retarget the primitive branch**

Update these types/usages in `packages/ui/src/components/checkbox/index.tsx`:

```tsx
type ShadcnCheckboxProperties = Omit<
  React.ComponentProps<typeof CheckboxControl>,
  "onChange"
>;
```

and:

```tsx
return <CheckboxControl {...(properties as ShadcnCheckboxProperties)} />;
```

Do not change the `hasLabelContent` heuristic or the branch condition.

- [ ] **Step 3: Re-run the checkbox behavioral tests**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run src/components/checkbox/checkbox.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Commit the composable branch retargeting**

```bash
git add packages/ui/src/components/checkbox/index.tsx
git commit -m "refactor: use internal checkbox control in composable branch"
```

---

### Task 4: Restore the shadcn checkbox file to an upstream-style implementation

**Files:**
- Modify: `packages/ui/src/shadcn/checkbox.tsx`
- Test: `packages/ui/src/components/checkbox/checkbox.test.tsx`

- [ ] **Step 1: Replace the custom icon ownership in `src/shadcn/checkbox.tsx`**

Update `packages/ui/src/shadcn/checkbox.tsx` so it matches an upstream-style implementation with only the standard check indicator:

```tsx
"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@acme/ui/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-primary",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
```

- [ ] **Step 2: Run the checkbox behavioral tests again to prove the public API no longer depends on shadcn icon ownership**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run src/components/checkbox/checkbox.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Commit the shadcn cleanup**

```bash
git add packages/ui/src/shadcn/checkbox.tsx
git commit -m "refactor: restore upstream-style shadcn checkbox"
```

---

### Task 5: Final verification for the ownership split

**Files:**
- Test: `packages/ui/src/components/checkbox/checkbox.test.tsx`
- Test: `packages/ui/src/components/checkbox/checkbox.docs-config.test.ts`
- Modify: `packages/ui/src/components/checkbox/checkbox.test.tsx` (only if a final minimal cleanup is required)

- [ ] **Step 1: Run the checkbox behavior suite**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run src/components/checkbox/checkbox.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run the checkbox docs wiring suite**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run src/components/checkbox/checkbox.docs-config.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run checkbox-only lint on the touched TS/TSX files**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react/packages/ui" exec eslint \
  src/components/checkbox/_components/checkbox-control.tsx \
  src/components/checkbox/checkbox.tsx \
  src/components/checkbox/index.tsx \
  src/components/checkbox/checkbox.test.tsx \
  src/shadcn/checkbox.tsx
```

Expected: no output.

- [ ] **Step 4: Commit the final verification cleanup if anything minimal changed**

```bash
git add packages/ui/src/components/checkbox packages/ui/src/shadcn/checkbox.tsx
git commit -m "test: verify checkbox indicator ownership split"
```

---

## Self-Review

- **Spec coverage:** The plan covers extracting a design-system-owned control, retargeting both public checkbox branches to it, restoring the shadcn file to an upstream-style implementation, and verifying behavior/docs/lint afterward.
- **Placeholder scan:** No TODO/TBD placeholders remain; each task has exact files, code, and commands.
- **Type consistency:** The plan consistently uses `CheckboxControl` as the new internal component name and keeps the public API anchored on `Checkbox` / `PublicCheckbox` tests.
