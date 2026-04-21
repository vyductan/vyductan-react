# Checkbox Description Prop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `description` prop to `Checkbox` so form-bound checkbox usage can render built-in secondary text without splitting the checkbox away from its label/description markup.

**Architecture:** Extend the wrapped checkbox implementation in `packages/ui/src/components/checkbox/checkbox.tsx` so `children` remains the primary label and `description` optionally upgrades the text area into a stacked label + helper-text block. Keep the primitive/no-children branch logic in `index.tsx` unchanged, update behavioral tests to lock the new rendering rules, and add a docs example that demonstrates the `FormItem` integration case this prop is meant to support.

**Tech Stack:** React, TypeScript, Vitest, Storybook MDX, React Hook Form-based `FormItem`, Tailwind utility classes

---

## File Structure

- **Modify:** `packages/ui/src/components/checkbox/checkbox.tsx`
  - Add `description?: React.ReactNode` to the public wrapper props and render stacked helper text when provided.
- **Modify:** `packages/ui/src/components/checkbox/checkbox.test.tsx`
  - Add regression coverage for `description` in default and card variants, plus the interaction with empty `children`.
- **Create:** `packages/ui/src/components/checkbox/examples/form-item-description.tsx`
  - Add the docs example showing `Checkbox` used directly inside `FormItem` with `valuePropName="checked"`.
- **Create:** `packages/ui/src/components/checkbox/examples/form-item-description.mdx`
  - Add the MDX partial for the new docs section.
- **Modify:** `packages/ui/src/components/checkbox/checkbox.stories.tsx`
  - Wire the new example into Storybook stories.
- **Modify:** `packages/ui/src/components/checkbox/checkbox.mdx`
  - Include the new docs partial in the main Checkbox docs page.
- **Modify:** `packages/ui/src/components/checkbox/checkbox.docs-config.test.ts`
  - Add the new example inventory entry so docs wiring stays locked.

---

### Task 1: Add failing behavioral tests for `description`

**Files:**
- Modify: `packages/ui/src/components/checkbox/checkbox.test.tsx`
- Test: `packages/ui/src/components/checkbox/checkbox.test.tsx`

- [ ] **Step 1: Add regression tests for stacked description rendering**

Add these tests in `packages/ui/src/components/checkbox/checkbox.test.tsx` near the existing wrapper behavior tests:

```tsx
test("renders stacked description content for the default variant", () => {
  renderCheckbox(
    {
      description:
        "Customers can choose any time to start instead of selecting from predefined slots.",
    },
    "Allow custom start time",
  );

  const checkbox = screen.getByRole("checkbox", {
    name: "Allow custom start time",
  });
  const wrapper = checkbox.closest("label");
  const labelContent = screen
    .getByText("Allow custom start time")
    .closest('[data-slot="checkbox-label"]');
  const description = screen.getByText(
    "Customers can choose any time to start instead of selecting from predefined slots.",
  );

  expect(wrapper).toHaveClass("items-start");
  expect(labelContent?.tagName).toBe("DIV");
  expect(labelContent).toHaveClass("mt-px", "flex", "flex-col", "gap-0.5");
  expect(description.tagName).toBe("P");
  expect(description).toHaveClass("text-muted-foreground", "text-xs");
});

test("renders stacked description content for the card variant", () => {
  renderCheckbox(
    {
      variant: "card",
      description: "Starting with your OS.",
    },
    "Auto Start",
  );

  const checkbox = screen.getByRole("checkbox", { name: /Auto Start/i });
  const wrapper = checkbox.closest("label");
  const labelContent = screen
    .getByText("Auto Start")
    .closest('[data-slot="checkbox-label"]');
  const description = screen.getByText("Starting with your OS.");

  expect(wrapper).toHaveClass("items-start");
  expect(labelContent?.tagName).toBe("DIV");
  expect(labelContent).toHaveClass("mt-px", "w-full", "flex", "flex-col");
  expect(description.tagName).toBe("P");
  expect(description).toHaveClass("text-muted-foreground", "text-xs");
});

test("renders description even when children are omitted", () => {
  const { container } = renderCheckbox({ description: "Only description" });

  expect(screen.getByText("Only description")).toBeInTheDocument();
  expect(container.querySelector('[data-slot="checkbox-label"]')).toBeNull();
});
```

- [ ] **Step 2: Run the checkbox test file to confirm the new tests fail for the current implementation**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run src/components/checkbox/checkbox.test.tsx
```

Expected: FAIL because `Checkbox` does not yet understand the `description` prop or the stacked layout behavior.

- [ ] **Step 3: Keep the assertions focused on public wrapper behavior**

Do not add snapshot tests and do not assert against internal implementation details outside the wrapper contract. The tests should lock:
- top alignment when `description` exists
- stacked text layout
- description wrapper tag/classes
- description-only rendering without inventing a fake primary label

- [ ] **Step 4: Commit the test change**

```bash
git add packages/ui/src/components/checkbox/checkbox.test.tsx
git commit -m "test(checkbox): lock description prop behavior"
```

---

### Task 2: Implement `description` in the wrapped Checkbox component

**Files:**
- Modify: `packages/ui/src/components/checkbox/checkbox.tsx`
- Test: `packages/ui/src/components/checkbox/checkbox.test.tsx`

- [ ] **Step 1: Extend the wrapped Checkbox props with `description`**

In `packages/ui/src/components/checkbox/checkbox.tsx`, update `AbstractCheckboxProperties` from:

```tsx
  // render
  children?: React.ReactNode;
```

to:

```tsx
  // render
  children?: React.ReactNode;
  description?: React.ReactNode;
```

- [ ] **Step 2: Read and normalize `description` in the component body**

In the destructuring section of `Checkbox`, change:

```tsx
    // render
    children,
```

to:

```tsx
    // render
    children,
    description,
```

Then add this normalized flag below `hasLabelContent`:

```tsx
  const hasDescriptionContent = React.Children.toArray(description).some(
    (child) => {
      if (typeof child === "boolean") {
        return false;
      }

      return child !== "";
    },
  );
```

- [ ] **Step 3: Update the wrapper alignment and label rendering rules**

In the outer `<Label>` className, change the base alignment from:

```tsx
          "inline-flex shrink-0 cursor-pointer items-center text-sm",
```

to:

```tsx
          "inline-flex shrink-0 cursor-pointer text-sm",
          hasDescriptionContent ? "items-start" : "items-center",
```

Then replace the existing label-content rendering block:

```tsx
        {!loading &&
          hasLabelContent &&
          (variant === "card" ? (
            <div
              data-slot="checkbox-label"
              className={cn(
                "mt-px flex w-full flex-col gap-0.5",
                "leading-none font-medium",
                classNames?.label,
              )}
            >
              {children}
            </div>
          ) : (
            <span
              data-slot="checkbox-label"
              className={cn("mt-px px-2 leading-none", classNames?.label)}
            >
              {children}
            </span>
          ))}
```

with:

```tsx
        {!loading &&
          (hasDescriptionContent ? (
            <div
              className={cn(
                "mt-px flex flex-col gap-0.5",
                variant === "card" ? "w-full leading-none font-medium" : "px-2",
              )}
            >
              {hasLabelContent ? (
                <div
                  data-slot="checkbox-label"
                  className={cn(
                    variant === "card" ? "w-full leading-none font-medium" : "leading-none",
                    classNames?.label,
                  )}
                >
                  {children}
                </div>
              ) : null}
              <p className="text-muted-foreground text-xs">{description}</p>
            </div>
          ) : hasLabelContent ? (
            variant === "card" ? (
              <div
                data-slot="checkbox-label"
                className={cn(
                  "mt-px flex w-full flex-col gap-0.5",
                  "leading-none font-medium",
                  classNames?.label,
                )}
              >
                {children}
              </div>
            ) : (
              <span
                data-slot="checkbox-label"
                className={cn("mt-px px-2 leading-none", classNames?.label)}
              >
                {children}
              </span>
            )
          ) : null)}
```

This preserves current rendering when `description` is absent, while switching to the new stacked layout only when `description` has renderable content.

- [ ] **Step 4: Run the checkbox behavior suite and make sure the new tests pass**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run src/components/checkbox/checkbox.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit the wrapper implementation**

```bash
git add packages/ui/src/components/checkbox/checkbox.tsx packages/ui/src/components/checkbox/checkbox.test.tsx
git commit -m "feat(checkbox): add description prop support"
```

---

### Task 3: Add the `FormItem` description example to Storybook docs

**Files:**
- Create: `packages/ui/src/components/checkbox/examples/form-item-description.tsx`
- Create: `packages/ui/src/components/checkbox/examples/form-item-description.mdx`
- Modify: `packages/ui/src/components/checkbox/checkbox.stories.tsx`
- Modify: `packages/ui/src/components/checkbox/checkbox.mdx`
- Test: `packages/ui/src/components/checkbox/checkbox.docs-config.test.ts`

- [ ] **Step 1: Add the live example source file**

Create `packages/ui/src/components/checkbox/examples/form-item-description.tsx` with this example:

```tsx
import type React from "react";
import { z } from "zod";

import { Checkbox } from "@acme/ui/components/checkbox";
import { Form, FormItem, useForm } from "@acme/ui/components/form";

const formSchema = z.object({
  p_allows_custom_start_time: z.boolean().default(false),
});

const App: React.FC = () => {
  const form = useForm({
    schema: formSchema,
    defaultValues: {
      p_allows_custom_start_time: false,
    },
    onSubmit: (values) => {
      void values;
    },
  });

  return (
    <Form form={form} style={{ maxWidth: 420 }}>
      <FormItem
        name="p_allows_custom_start_time"
        control={form.control}
        valuePropName="checked"
      >
        <Checkbox
          id="allow-custom-start-time"
          description="Customers can choose any time to start instead of selecting from predefined slots."
        >
          Allow custom start time
        </Checkbox>
      </FormItem>
    </Form>
  );
};

export default App;
```

- [ ] **Step 2: Add the MDX partial with the documentation note**

Create `packages/ui/src/components/checkbox/examples/form-item-description.mdx` with:

```mdx
import { Meta } from "@storybook/addon-docs/blocks";

import { ComponentSource } from "@acme/ui/components/mdx";

import FormItemDescriptionExample from "./form-item-description";

<Meta isTemplate />

### FormItem Description

Use the `description` prop when the checkbox needs to stay as the field component inside `FormItem`. This keeps `valuePropName="checked"` bound to `Checkbox` while still rendering helper text.

<ComponentSource
  src="checkbox/examples/form-item-description.tsx"
  __comp__={FormItemDescriptionExample}
/>
```

- [ ] **Step 3: Wire the new example into stories and the main docs page**

In `packages/ui/src/components/checkbox/checkbox.stories.tsx`, add:

```tsx
import FormItemDescriptionExample from "./examples/form-item-description";
```

Then add this story after `WithDescription`:

```tsx
export const FormItemDescription: Story = {
  render: () => (
    <ComponentSource
      src="checkbox/examples/form-item-description.tsx"
      __comp__={FormItemDescriptionExample}
    />
  ),
};
```

In `packages/ui/src/components/checkbox/checkbox.mdx`, add:

```mdx
import FormItemDescriptionExample from "./examples/form-item-description.mdx";
```

and insert:

```mdx
<FormItemDescriptionExample />
```

below `<CheckAllExample />` and above `<CardExample />`.

- [ ] **Step 4: Update the docs-config inventory test**

In `packages/ui/src/components/checkbox/checkbox.docs-config.test.ts`, add this entry to `checkboxExampleInventory`:

```ts
  {
    heading: "FormItem Description",
    sourcePath: "checkbox/examples/form-item-description.tsx",
    partialImportPath: "./examples/form-item-description.mdx",
    partialComponentName: "FormItemDescriptionExample",
  },
```

- [ ] **Step 5: Run the docs wiring suite and confirm everything passes**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run src/components/checkbox/checkbox.docs-config.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit the docs update**

```bash
git add \
  packages/ui/src/components/checkbox/examples/form-item-description.tsx \
  packages/ui/src/components/checkbox/examples/form-item-description.mdx \
  packages/ui/src/components/checkbox/checkbox.stories.tsx \
  packages/ui/src/components/checkbox/checkbox.mdx \
  packages/ui/src/components/checkbox/checkbox.docs-config.test.ts
git commit -m "docs(checkbox): add form item description example"
```

---

### Task 4: Final verification for the description prop feature

**Files:**
- Test: `packages/ui/src/components/checkbox/checkbox.test.tsx`
- Test: `packages/ui/src/components/checkbox/checkbox.docs-config.test.ts`
- Modify: `packages/ui/src/components/checkbox/checkbox.tsx` (only if a final minimal cleanup is needed)

- [ ] **Step 1: Re-run the checkbox behavior suite**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run src/components/checkbox/checkbox.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Re-run the checkbox docs wiring suite**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run src/components/checkbox/checkbox.docs-config.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run checkbox-only lint on the touched TS/TSX files**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react/packages/ui" exec eslint \
  src/components/checkbox/checkbox.tsx \
  src/components/checkbox/checkbox.test.tsx \
  src/components/checkbox/checkbox.stories.tsx \
  src/components/checkbox/checkbox.docs-config.test.ts \
  src/components/checkbox/examples/form-item-description.tsx
```

Expected: no output.

- [ ] **Step 4: Commit the final cleanup if anything minimal changed**

```bash
git add packages/ui/src/components/checkbox
git commit -m "test(checkbox): verify description prop integration"
```

---

## Self-Review

- **Spec coverage:** The plan covers the new `description` prop, the `items-start` alignment rule, the `<p className="text-muted-foreground text-xs">` wrapper, description-only behavior, and the documentation note/example for `FormItem` integration.
- **Placeholder scan:** No TODO/TBD placeholders remain; every task includes concrete code, file paths, and commands.
- **Type consistency:** The plan uses `description?: React.ReactNode` consistently in the wrapper, tests, and docs example, and keeps `children` as the primary label across all tasks.
