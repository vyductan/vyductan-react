# Checkbox Empty Label Rendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update `Checkbox` so it omits the label `<span>` when `children` has no renderable label content, while preserving the outer `<label>` wrapper and current loading behavior.

**Architecture:** Keep the change local to the shared checkbox component and add a focused test file beside it. Use a tiny renderability check for `children` that matches the approved spec: treat `undefined`, `null`, `false`, and `""` as no label content, while continuing to render `0`, non-empty strings, and normal React nodes. Verification should rely on focused Vitest coverage for DOM output plus a targeted lint-safe implementation change in the existing component file.

**Tech Stack:** React, TypeScript, Testing Library, Vitest, pnpm

---

## File Structure

### Existing files to modify
- `@acme/ui/src/components/checkbox/checkbox.tsx`
  - Add the minimal label renderability check.
  - Keep the outer `<label>`, loading branch, and checkbox behavior unchanged.
- `@acme/ui/src/components/checkbox/index.tsx`
  - Inspect only if needed to confirm no public API changes are required.

### Files to create
- `@acme/ui/src/components/checkbox/checkbox.test.tsx`
  - Add focused rendering tests for empty-label and non-empty-label cases.

### Existing files to inspect during implementation
- `docs/superpowers/specs/2026-03-26-checkbox-empty-label-design.md`
  - Approved rendering rules and verification scope.
- `@acme/ui/src/components/checkbox/checkbox.stories.tsx`
  - Optional reference if a quick usage example is needed while reading the component.
- `@acme/ui/package.json`
  - Source of the package-local test command.
- `@acme/ui/vitest.config.ts`
  - Confirms the package supports the `unit` Vitest project for focused jsdom tests.
- `@acme/ui/src/components/button/loading-icon.tsx`
  - Source of a stable loading selector (`svg.animate-spin`) used by the checkbox loading test.

### Existing files that must remain unchanged
- `@acme/ui/src/components/checkbox/checkbox-group.tsx`
- `@acme/ui/src/components/checkbox/group-context.ts`
- `@acme/ui/src/components/checkbox/use-bubble-lock.ts`

This is a narrow component maintenance change. Do not broaden it into a checkbox API redesign, group refactor, or Storybook cleanup.

---

### Task 1: Add focused failing tests for checkbox label rendering

**Files:**
- Create: `@acme/ui/src/components/checkbox/checkbox.test.tsx`
- Inspect: `docs/superpowers/specs/2026-03-26-checkbox-empty-label-design.md`
- Inspect: `@acme/ui/src/components/date-picker/date-picker.test.tsx`
- Inspect: `@acme/ui/package.json`

- [ ] **Step 1: Re-read the approved spec before writing tests**

Read: `docs/superpowers/specs/2026-03-26-checkbox-empty-label-design.md`

Expected reminders:
- keep the outer `<label>`
- keep `LoadingIcon` behavior unchanged
- omit the label `<span>` for `undefined`, `null`, `false`, and `""`
- keep rendering the label `<span>` for visible values such as `"Label"` and `0`

- [ ] **Step 2: Re-read an existing component test for local conventions**

Read:
- `@acme/ui/src/components/date-picker/date-picker.test.tsx`
- `@acme/ui/package.json`
- `@acme/ui/vitest.config.ts`
- `@acme/ui/src/components/button/loading-icon.tsx`

Expected findings:
- component tests use Testing Library with Vitest
- the package exposes a `unit` Vitest project for focused jsdom component tests
- `LoadingIcon` renders an `svg` with the `animate-spin` class, which provides a stable loading assertion target for checkbox tests

- [ ] **Step 3: Write the failing checkbox rendering tests**

Create `@acme/ui/src/components/checkbox/checkbox.test.tsx` with focused DOM assertions only.

Include tests equivalent to this coverage:

```tsx
import React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Checkbox } from "./checkbox";

globalThis.React = React;

afterEach(() => {
  cleanup();
});

describe("Checkbox label rendering", () => {
  test("renders the outer label wrapper", () => {
    const { container } = render(<Checkbox>Label</Checkbox>);

    expect(container.querySelector("label")).not.toBeNull();
  });

  test("renders the label span for visible label text", () => {
    render(<Checkbox>Label</Checkbox>);

    expect(screen.getByText("Label")).toHaveAttribute("data-slot", "checkbox-label");
  });

  test("renders the label span for numeric zero", () => {
    render(<Checkbox>{0}</Checkbox>);

    expect(screen.getByText("0")).toHaveAttribute("data-slot", "checkbox-label");
  });

  test("omits the label span when children is undefined", () => {
    const { container } = render(<Checkbox />);

    expect(container.querySelector('[data-slot="checkbox-label"]')).toBeNull();
  });

  test("omits the label span when children is null", () => {
    const { container } = render(<Checkbox>{null}</Checkbox>);

    expect(container.querySelector('[data-slot="checkbox-label"]')).toBeNull();
  });

  test("omits the label span when children is false", () => {
    const { container } = render(<Checkbox>{false}</Checkbox>);

    expect(container.querySelector('[data-slot="checkbox-label"]')).toBeNull();
  });

  test("omits the label span when children is an empty string", () => {
    const { container } = render(<Checkbox>{""}</Checkbox>);

    expect(container.querySelector('[data-slot="checkbox-label"]')).toBeNull();
  });

  test("renders the loading indicator without the label span", () => {
    const { container } = render(<Checkbox loading>Label</Checkbox>);

    expect(container.querySelector('[data-slot="checkbox-label"]')).toBeNull();
    expect(container.querySelector("label")).not.toBeNull();
    expect(container.querySelector("svg.animate-spin")).not.toBeNull();
  });
});
```

Notes:
- `children={null}` is required coverage, not optional.
- Use `svg.animate-spin` for the loading assertion because `LoadingIcon` currently renders that exact selector in `@acme/ui/src/components/button/loading-icon.tsx`.
- Do not add interaction, group, or change-event tests in this file.
- Keep the test file focused on render output and the approved edge cases only.

- [ ] **Step 4: Run the focused test file to verify it fails first**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/checkbox/checkbox.test.tsx
```

Expected before implementation:
- FAIL
- current failures should show that the empty-label `<span>` is still rendered for at least one of the no-content cases

- [ ] **Step 5: Commit the failing test baseline**

```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add @acme/ui/src/components/checkbox/checkbox.test.tsx
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" commit -m "test: cover checkbox empty label rendering"
```

If the repo already contains unrelated staged changes, stage only the new checkbox test file before committing.

---

### Task 2: Implement the minimal checkbox rendering change

**Files:**
- Modify: `@acme/ui/src/components/checkbox/checkbox.tsx`
- Inspect: `docs/superpowers/specs/2026-03-26-checkbox-empty-label-design.md`
- Test: `@acme/ui/src/components/checkbox/checkbox.test.tsx`

- [ ] **Step 1: Re-read the checkbox component before editing**

Read: `@acme/ui/src/components/checkbox/checkbox.tsx`

Expected findings:
- the outer `<label>` wraps both the checkbox control and label content
- the loading branch currently swaps the label `<span>` for `LoadingIcon`
- the label `<span>` is always rendered when `loading` is false

- [ ] **Step 2: Implement the smallest possible renderability check**

Edit `@acme/ui/src/components/checkbox/checkbox.tsx` to compute whether `children` contains renderable label content before the JSX return.

Implementation constraints:
- Preserve the outer `<label>` exactly.
- Preserve `LoadingIcon` behavior exactly.
- Preserve existing props and exports.
- Omit the label `<span>` only when the normalized content is effectively empty.
- Keep `0` renderable.

A minimal implementation can follow this shape:

```tsx
const hasLabelContent = React.Children.toArray(children).some((child) => {
  if (typeof child === "boolean") {
    return false;
  }

  return child !== "";
});
```

Then update the JSX branch to this logical structure:

```tsx
{loading ? (
  <LoadingIcon />
) : hasLabelContent ? (
  <span
    data-slot="checkbox-label"
    className={cn("leading-line-height px-2", classNames?.label)}
  >
    {children}
  </span>
) : null}
```

Do not add a helper file unless the existing component becomes materially harder to read.

- [ ] **Step 3: Re-read the edited component before running tests**

Read: `@acme/ui/src/components/checkbox/checkbox.tsx`

Expected:
- the outer `<label>` is still present
- `LoadingIcon` still renders in the loading branch
- the label `<span>` is conditional on the new renderability check
- `classNames?.label` remains attached to the `<span>` when it renders

- [ ] **Step 4: Run the focused checkbox test file again**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/checkbox/checkbox.test.tsx
```

Expected after implementation:
- PASS
- all label rendering cases in the new test file pass

- [ ] **Step 5: Commit the implementation once the focused tests pass**

```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add @acme/ui/src/components/checkbox/checkbox.tsx @acme/ui/src/components/checkbox/checkbox.test.tsx
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" commit -m "fix: skip empty checkbox label wrapper"
```

If the repo still has unrelated staged changes, stage only these checkbox files before committing.

---

### Task 3: Final verification and handoff

**Files:**
- Inspect: `@acme/ui/src/components/checkbox/checkbox.tsx`
- Inspect: `@acme/ui/src/components/checkbox/checkbox.test.tsx`
- Inspect: `docs/superpowers/specs/2026-03-26-checkbox-empty-label-design.md`

- [ ] **Step 1: Run one final focused verification command**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/checkbox/checkbox.test.tsx
```

Expected:
- PASS
- no new failures in the focused checkbox test file

- [ ] **Step 2: Re-read the final source and test files for contract alignment**

Read:
- `@acme/ui/src/components/checkbox/checkbox.tsx`
- `@acme/ui/src/components/checkbox/checkbox.test.tsx`

Confirm:
- the outer `<label>` remains the wrapper, with executable coverage already present in `checkbox.test.tsx`
- `LoadingIcon` behavior is still covered by the loading test in `checkbox.test.tsx`
- the label `<span>` is omitted for `undefined`, `null`, `false`, and `""`
- the label `<span>` still renders for `"Label"` and `0`
- no unrelated checkbox behavior was changed

- [ ] **Step 3: Prepare the implementation summary with evidence**

Summarize:
- which files were created or modified
- the exact renderability rule used for label content
- the focused Vitest command that passed
- that the implementation stayed within the approved spec and did not change checkbox group behavior or public API

- [ ] **Step 4: Stop after verified delivery**

Do not:
- refactor checkbox group internals
- add Storybook changes unless tests prove they are required
- broaden the rule beyond the approved renderability cases
- touch unrelated files from the current dirty working tree
