# Shadcn FieldLabel Auto-Required Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `FieldLabel` in shadcn-style forms automatically show the required asterisk from schema-derived field optionality without requiring manual `required` props.

**Architecture:** Reuse the existing form field identity concept already present in `packages/ui/src/components/form/context/index.tsx` by providing the active RHF field name around shadcn-style `Controller` render subtrees. Also provide the existing custom `Form` context around the demo subtree with `form={{ schema: formSchema }}` so `useRequiredFieldCheck` can see the active schema. Then teach `FieldLabel` to fall back to `useRequiredFieldCheck` only when `required` is not explicitly provided and a current field name exists in context.

**Tech Stack:** React, TypeScript, react-hook-form, Zod optionality inference, Vitest, Testing Library

---

## File map

- **Modify:** `packages/ui/src/components/field/field-label.tsx`
  - Add inferred required behavior that reads the current field name from form context and falls back to existing `required` prop precedence.
- **Modify:** `packages/ui/src/components/form/examples/shadcn.tsx`
  - Wrap the demo subtree in the custom `Form.Provider` with `form={{ schema: formSchema }}` so schema optionality is available in context.
  - Wrap each `Controller` render subtree in `FormFieldContext.Provider` so nested `FieldLabel` instances can infer required state.
- **Modify:** `packages/ui/src/components/form/examples/shadcn.test.tsx`
  - Add end-to-end demo coverage that proves required labels now show `*` automatically.
- **Create:** `packages/ui/src/components/field/field-label.test.tsx`
  - Add focused unit tests for explicit-vs-inferred required behavior.

---

### Task 1: Add a failing FieldLabel unit test for inferred required state

**Files:**
- Create: `packages/ui/src/components/field/field-label.test.tsx`
- Test: `packages/ui/src/components/field/field-label.test.tsx`

- [ ] **Step 1: Create the failing FieldLabel test file**

Create `packages/ui/src/components/field/field-label.test.tsx` with this content:

```tsx
import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { z } from "zod";

import { FieldLabel } from "./field-label";
import { Provider as FormProvider, FormFieldContext } from "../form/context";

describe("FieldLabel", () => {
  test("renders explicit required state without schema inference", () => {
    render(<FieldLabel required>Email</FieldLabel>);

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  test("explicit required false suppresses schema-inferred required state", () => {
    const form = {
      schema: z.object({
        email: z.string().min(1, "Email is required"),
      }),
    };

    render(
      <FormProvider id="test-form" form={form as never}>
        <FormFieldContext.Provider value={{ name: "email" as never }}>
          <FieldLabel required={false}>Email</FieldLabel>
        </FormFieldContext.Provider>
      </FormProvider>,
    );

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  test("infers required state from schema when a field name is provided by context", () => {
    const form = {
      schema: z.object({
        email: z.string().min(1, "Email is required"),
      }),
    };

    render(
      <FormProvider id="test-form" form={form as never}>
        <FormFieldContext.Provider value={{ name: "email" as never }}>
          <FieldLabel>Email</FieldLabel>
        </FormFieldContext.Provider>
      </FormProvider>,
    );

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  test("does not infer required state for optional schema fields", () => {
    const form = {
      schema: z.object({
        nickname: z.string().optional(),
      }),
    };

    render(
      <FormProvider id="test-form" form={form as never}>
        <FormFieldContext.Provider value={{ name: "nickname" as never }}>
          <FieldLabel>Nickname</FieldLabel>
        </FormFieldContext.Provider>
      </FormProvider>,
    );

    expect(screen.getByText("Nickname")).toBeInTheDocument();
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the new test to verify it fails**

Run:
```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run --project unit src/components/field/field-label.test.tsx
```

Expected: FAIL in the schema-inference test because `FieldLabel` currently only renders `*` from the explicit `required` prop and ignores `FormFieldContext`.

- [ ] **Step 3: Do not implement yet**

Keep the new failing test file in place and move directly to the minimal implementation task.

- [ ] **Step 4: Do not commit yet**

Keep the failing unit test grouped with the implementation in the next task.

---

### Task 2: Teach FieldLabel to infer required state from the current field context

**Files:**
- Modify: `packages/ui/src/components/field/field-label.tsx`
- Test: `packages/ui/src/components/field/field-label.test.tsx`

- [ ] **Step 1: Import the required inference dependencies into FieldLabel**

At the top of `packages/ui/src/components/field/field-label.tsx`, add these imports:

```tsx
import { FormFieldContext } from "../form/context";
import { useRequiredFieldCheck } from "../form/hooks/use-field-optionality-check";
```

Also change the React import line to include `useContext`:

```tsx
import { useContext } from "react";
```

- [ ] **Step 2: Read the current field name and infer required state**

Inside `FieldLabel`, add this logic just after the existing merged form layout variables:

```tsx
  const formFieldContext = useContext(FormFieldContext);
  const inferredRequired = useRequiredFieldCheck(formFieldContext?.name);
  const mergedRequired = required ?? inferredRequired ?? false;
```

Then replace the render condition at the bottom from:

```tsx
      {required && <span className="text-destructive ml-1">*</span>}
```

to:

```tsx
      {mergedRequired && <span className="text-destructive ml-1">*</span>}
```

- [ ] **Step 3: Keep explicit `required` precedence intact**

Do not alter the existing `required?: boolean` prop type or remove manual support. The intended precedence is:

```tsx
const mergedRequired = required ?? inferredRequired ?? false;
```

This means:
- explicit `required={true}` still forces `*`
- explicit `required={false}` suppresses `*`
- only missing `required` falls back to schema inference

- [ ] **Step 4: Confirm FormFieldContext remains exported from the form context barrel**

Verify `packages/ui/src/components/form/context/index.tsx` still exports `FormFieldContext` in this block:

```tsx
export {
  Provider,
  FormFieldContext,
  FormItemContext,
  FormContext,
  useFormContext,
  VariantContext,
};
```

If it is unchanged, do not add extra context types or duplicate exports.

- [ ] **Step 5: Run the focused FieldLabel unit test suite**

Run:
```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run --project unit src/components/field/field-label.test.tsx
```

Expected: PASS with all four tests green.

- [ ] **Step 6: Commit the FieldLabel inference change**

Run:
```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add \
  "packages/ui/src/components/field/field-label.tsx" \
  "packages/ui/src/components/field/field-label.test.tsx"

git -C "/Users/vyductan/Developer/vyductan/vyductan-react" commit -m "$(cat <<'EOF'
feat(ui): infer field label required state from form context
EOF
)"
```

Expected: a new commit containing only the FieldLabel inference work and its unit test.

---

### Task 3: Add a failing demo regression, then provide schema and field identity to shadcn-style Controller subtrees

**Files:**
- Modify: `packages/ui/src/components/form/examples/shadcn.test.tsx`
- Modify: `packages/ui/src/components/form/examples/shadcn.tsx`
- Test: `packages/ui/src/components/form/examples/shadcn.test.tsx`

- [ ] **Step 1: Add the required-label regression assertions to the example test**

Replace the current test body in `packages/ui/src/components/form/examples/shadcn.test.tsx` with this:

```tsx
test("renders automatic required indicators for schema-required labels", () => {
  const { container } = render(<ShadcnDemo />);

  expect(screen.getByText("Team Size")).toBeInTheDocument();
  expect(
    container.querySelector("#form-rhf-complex-teamSize"),
  ).toBeInTheDocument();
  expect(
    screen.getByText("Choose the team size for your workspace."),
  ).toBeInTheDocument();

  const usernameLabel = screen.getByText("Username").closest("label");
  const passwordLabel = screen.getByText("Password").closest("label");
  const billingPeriodLabel = screen.getByText("Billing Period").closest("label");
  const teamSizeLabel = screen.getByText("Team Size").closest("label");

  expect(usernameLabel).toHaveTextContent("Username*");
  expect(passwordLabel).toHaveTextContent("Password*");
  expect(billingPeriodLabel).toHaveTextContent("Billing Period*");
  expect(teamSizeLabel).toHaveTextContent("Team Size*");
});
```

- [ ] **Step 2: Run the example test to verify it fails before wiring the shadcn example**

Run:
```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run --project unit src/components/form/examples/shadcn.test.tsx
```

Expected: FAIL because the shadcn example does not yet provide the custom form schema context or the current field name to `FieldLabel`.

- [ ] **Step 3: Import Form provider utilities into the shadcn form example**

Add this import near the other form-related imports in `packages/ui/src/components/form/examples/shadcn.tsx`:

```tsx
import { FormFieldContext, Provider as FormProvider } from "@acme/ui/components/form";
```

- [ ] **Step 4: Wrap the demo form subtree in FormProvider with schema access**

Change the main form markup from:

```tsx
<form id="form-rhf-complex" onSubmit={form.handleSubmit(onSubmit)}>
  <FieldGroup>
    {/* existing controller blocks */}
  </FieldGroup>
</form>
```

to this shape:

```tsx
<FormProvider id="form-rhf-complex" form={{ schema: formSchema } as never}>
  <form id="form-rhf-complex" onSubmit={form.handleSubmit(onSubmit)}>
    <FieldGroup>
      {/* existing controller blocks */}
    </FieldGroup>
  </form>
</FormProvider>
```

This provider is required because `useRequiredFieldCheck` reads schema from the custom form context rather than directly from `react-hook-form`.

- [ ] **Step 5: Wrap the username controller subtree in FormFieldContext.Provider**

Change the username controller render from:

```tsx
render(({ field, fieldState }) => (
  <Field data-invalid={fieldState.invalid}>
    <FieldLabel htmlFor="form-rhf-input-username">
      Username
    </FieldLabel>
    <Input
      {...field}
      id="form-rhf-input-username"
      aria-invalid={fieldState.invalid}
      placeholder="shadcn"
      autoComplete="username"
    />
    <FieldDescription>
      This is your public display name. Must be between 3 and 10
      characters. Must only contain letters, numbers, and
      underscores.
    </FieldDescription>
    {fieldState.invalid && (
      <FieldError errors={[fieldState.error]} />
    )}
  </Field>
))
```

to:

```tsx
render(({ field, fieldState }) => (
  <FormFieldContext.Provider value={{ name: field.name }}>
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor="form-rhf-input-username">
        Username
      </FieldLabel>
      <Input
        {...field}
        id="form-rhf-input-username"
        aria-invalid={fieldState.invalid}
        placeholder="shadcn"
        autoComplete="username"
      />
      <FieldDescription>
        This is your public display name. Must be between 3 and 10
        characters. Must only contain letters, numbers, and
        underscores.
      </FieldDescription>
      {fieldState.invalid && (
        <FieldError errors={[fieldState.error]} />
      )}
    </Field>
  </FormFieldContext.Provider>
))
```

- [ ] **Step 6: Apply the same provider pattern to the other controller subtrees**

Wrap these controller subtrees the same way, using `value={{ name: field.name }}`:
- `password`
- `billingPeriod`
- `teamSize`
- `emailNotifications`
- `addons`
- `plan`

For grouped fields, wrap the provider around the whole controller subtree once, not around each individual option row. In particular:
- `plan` should provide the context around the full `FieldSet` / `RadioGroup` subtree so both radio option labels inherit the same required state.
- `addons` should provide the context around the full `FieldSet` / checkbox group subtree so descendant `FieldLabel` instances resolve against the `addons` field name without changing the per-item markup.

The target shape is always:

```tsx
<FormFieldContext.Provider value={{ name: field.name }}>
  {/* existing subtree unchanged */}
</FormFieldContext.Provider>
```

- [ ] **Step 7: Keep the existing shadcn-style field authoring structure unchanged**

Do not convert these controllers into a different form abstraction. Preserve:
- `Controller`
- `Field` / `FieldSet`
- `FieldLabel`
- existing `Input`, `Select`, `RadioGroup`, `Checkbox`, and `Switch` usage

The only structural changes should be the schema provider and field-name provider wrappers.

- [ ] **Step 8: Run the focused example test again to verify it passes**

Run:
```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run --project unit src/components/form/examples/shadcn.test.tsx
```

Expected: PASS with automatic `*` indicators visible on the schema-required labels.

- [ ] **Step 9: Commit the shadcn example wiring and regression test**

Run:
```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add \
  "packages/ui/src/components/form/examples/shadcn.tsx" \
  "packages/ui/src/components/form/examples/shadcn.test.tsx"

git -C "/Users/vyductan/Developer/vyductan/vyductan-react" commit -m "$(cat <<'EOF'
test(ui): cover auto-required labels in shadcn form example
EOF
)"
```

Expected: a new commit containing the provider wiring and the example regression test.

---

### Task 4: Run the final focused verification set

**Files:**
- Test: `packages/ui/src/components/field/field-label.test.tsx`
- Test: `packages/ui/src/components/form/examples/shadcn.test.tsx`

- [ ] **Step 1: Run the FieldLabel unit tests**

Run:
```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run --project unit src/components/field/field-label.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run the shadcn example regression test**

Run:
```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run --project unit src/components/form/examples/shadcn.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Run both focused suites together as a final check**

Run:
```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run --project unit src/components/field/field-label.test.tsx src/components/form/examples/shadcn.test.tsx
```

Expected: PASS with both suites green in one run.

- [ ] **Step 4: Commit the final verification checkpoint**

Run:
```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" commit --allow-empty -m "$(cat <<'EOF'
chore(ui): verify shadcn field label auto-required behavior
EOF
)"
```

Expected: an empty verification commit marking the final green checkpoint.
```
