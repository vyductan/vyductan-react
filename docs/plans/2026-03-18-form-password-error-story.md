# Form Password Error Story Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a real `Password` field to the shadcn form demo and expose a Storybook variant that shows that field in an initial error state.

**Architecture:** Extend the existing `@acme/ui/src/components/form/demo/shadcn.tsx` demo so it can render both the normal form and a password-error scenario using the same component. Then update `@acme/ui/src/components/form/form.stories.tsx` to keep the existing `Shadcn` story and add a second story that enables the password-error scenario without duplicating form markup.

**Tech Stack:** React, TypeScript, Zod, react-hook-form, Storybook CSF (`Meta`, `StoryObj`), PNPM.

---

### Task 1: Add a failing type-level validation target for the new story/demo shape

**Files:**
- Modify: `@acme/ui/src/components/form/form.stories.tsx:1-17`
- Modify: `@acme/ui/src/components/form/demo/shadcn.tsx:1-336`

**Step 1: Introduce a failing story reference to a not-yet-supported error scenario**

Temporarily update `form.stories.tsx` to reference a second story variant that passes props the current demo does not support yet, for example:

```tsx
export const ShadcnWithPasswordError: Story = {
  render: () => <ShadcnDemo showPasswordError />,
};
```

Do this before updating `demo/shadcn.tsx` so the verification step fails for the expected reason.

**Step 2: Run typecheck to verify RED**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" typecheck
```

Expected: FAIL because `showPasswordError` (or the chosen prop) does not yet exist on `ShadcnDemo`.

### Task 2: Add the password field to the shadcn demo

**Files:**
- Modify: `@acme/ui/src/components/form/demo/shadcn.tsx:59-97`
- Modify: `@acme/ui/src/components/form/demo/shadcn.tsx:125-153`

**Step 1: Extend the form schema and default values**

Add a `password` field to the schema and defaults.

Example minimal shape:

```tsx
password: z.string().min(8, "Password must be at least 8 characters"),
```

And in `defaultValues`:

```tsx
password: "",
```

If using a scenario prop like `showPasswordError`, choose default values so:
- normal story uses a valid or neutral initial state
- error story starts with an invalid password value such as `"123"` and has validation triggered automatically

**Step 2: Add a typed prop for the demo scenario**

Add a small prop surface to `FormRhfComplex`, for example:

```tsx
type FormRhfComplexProps = {
  showPasswordError?: boolean;
};

export default function FormRhfComplex({
  showPasswordError = false,
}: FormRhfComplexProps) {
```

Keep it minimal. Do not create a generic scenario system unless the implementation truly needs it.

**Step 3: Render the new password field**

Add a new `Controller` and `Field` block near the username field. Reuse the existing form component patterns:

```tsx
<Controller
  name="password"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor="form-rhf-input-password">Password</FieldLabel>
      <Input
        {...field}
        id="form-rhf-input-password"
        type="password"
        aria-invalid={fieldState.invalid}
        placeholder="Enter password"
        autoComplete="new-password"
      />
      <FieldDescription>
        Must be at least 8 characters.
      </FieldDescription>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

### Task 3: Make the password error visible in the scenario story

**Files:**
- Modify: `@acme/ui/src/components/form/demo/shadcn.tsx:87-125`
- Modify: `@acme/ui/src/components/form/form.stories.tsx:1-17`

**Step 1: Trigger validation for the error scenario**

Inside the demo component, when `showPasswordError` is true, ensure the password field becomes visibly invalid on initial render.

A minimal approach is:
- initialize password with an invalid value such as `"123"`
- trigger validation after mount for the `password` field

Example direction:

```tsx
useEffect(() => {
  if (showPasswordError) {
    void form.trigger("password");
  }
}, [form, showPasswordError]);
```

Use the smallest real-validation mechanism that makes the Storybook error state visible.

**Step 2: Add the second story**

Update `form.stories.tsx` to keep the current story and add:

```tsx
export const ShadcnWithPasswordError: Story = {
  render: () => <ShadcnDemo showPasswordError />,
};
```

Keep `Shadcn` unchanged unless a render function is needed for consistency.

### Task 4: Verify the change

**Files:**
- Verify: `@acme/ui/src/components/form/demo/shadcn.tsx`
- Verify: `@acme/ui/src/components/form/form.stories.tsx`

**Step 1: Run typecheck to verify GREEN**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" typecheck
```

Expected: PASS

**Step 2: Run Storybook build**

Run:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" storybook:build
```

Expected: PASS

**Step 3: Confirm requirements manually**

Verify that:
- `Password` exists in the shadcn demo
- `Shadcn` still renders the normal demo
- `ShadcnWithPasswordError` exists as a second story
- the password error is produced by real validation, not hardcoded markup

### Task 5: Commit the focused change

**Files:**
- Stage: `@acme/ui/src/components/form/demo/shadcn.tsx`
- Stage: `@acme/ui/src/components/form/form.stories.tsx`

**Step 1: Stage only the relevant files**

```bash
git add @acme/ui/src/components/form/demo/shadcn.tsx @acme/ui/src/components/form/form.stories.tsx
```

**Step 2: Create a focused commit**

```bash
git commit -m "feat: add password error state to form story"
```

Expected: One small commit containing the demo extension and new story variant.
