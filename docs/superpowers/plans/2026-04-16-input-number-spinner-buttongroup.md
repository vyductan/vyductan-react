# InputNumber Spinner ButtonGroup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update `InputNumber` spinner mode to render with a real `ButtonGroup` shell while preserving all existing spinner behavior and API decisions.

**Architecture:** Keep spinner interaction logic inside `packages/ui/src/components/input/_components/rc-input-number.tsx`, but swap the spinner branch’s outer shell from a custom `div` to `ButtonGroup`. Keep the center field implemented with the existing `BaseInput + InternalInputNumber` composition so numeric parsing, focus management, and affix behavior remain local to `InputNumber`.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, Storybook, Tailwind utility classes, shadcn `ButtonGroup`

---

## File map

- **Modify:** `packages/ui/src/shadcn/button-group.tsx`
  - Add `forwardRef` support to `ButtonGroup` so spinner mode can keep attaching the existing root DOM ref
- **Modify:** `packages/ui/src/components/input/_components/rc-input-number.tsx`
  - Replace the spinner root shell with `ButtonGroup`
  - Keep left/right spinner buttons and center `BaseInput`
  - Adjust spinner-only classes so group layout, borders, and stretch behavior remain correct
- **Modify:** `packages/ui/src/components/input/input-number.test.tsx`
  - Add one structure-focused regression that proves spinner mode renders a real group shell without weakening behavior coverage
  - Keep current interaction assertions intact
- **Modify:** `packages/ui/src/components/input/input-number.stories.tsx`
  - Update spinner stories only if needed to better showcase the `ButtonGroup` shell change

---

### Task 1: Add ref support to ButtonGroup and a failing spinner-shell test

**Files:**
- Modify: `packages/ui/src/shadcn/button-group.tsx`
- Modify: `packages/ui/src/components/input/input-number.test.tsx`
- Test: `packages/ui/src/components/input/input-number.test.tsx`

- [ ] **Step 1: Add the failing spinner-shell test**

Add this test inside the existing `describe("InputNumber spinner mode", ...)` block:

```tsx
test("renders spinner mode inside a group shell", () => {
  render(
    <InputNumber mode="spinner" aria-label="Quantity" defaultValue={2} />,
  );

  const group = screen.getByRole("group");
  const input = screen.getByRole("spinbutton", { name: "Quantity" });
  const decreaseButton = screen.getByRole("button", { name: "Decrease value" });
  const increaseButton = screen.getByRole("button", { name: "Increase value" });

  expect(group).toBeInTheDocument();
  expect(group).toContainElement(decreaseButton);
  expect(group).toContainElement(input);
  expect(group).toContainElement(increaseButton);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run --project unit src/components/input/input-number.test.tsx
```

Expected: FAIL in the new test because spinner mode currently renders a custom `div` shell without `role="group"`.

- [ ] **Step 3: Add `forwardRef` support to ButtonGroup**

Replace the current `ButtonGroup` declaration in `packages/ui/src/shadcn/button-group.tsx` with this shape:

```tsx
const ButtonGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>
>(function ButtonGroup({ className, orientation, ...props }, ref) {
  return (
    <div
      ref={ref}
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
})
```

Add this display name directly below it:

```tsx
ButtonGroup.displayName = "ButtonGroup"
```

- [ ] **Step 4: Run focused lint on ButtonGroup before using the new ref path**

Run:
```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui lint src/shadcn/button-group.tsx
```

Expected: PASS.

- [ ] **Step 5: Do not commit yet**

Keep the `ButtonGroup` ref support and failing spinner-shell test together with the shell swap in the next task.

---

### Task 2: Switch spinner mode to a real ButtonGroup shell

**Files:**
- Modify: `packages/ui/src/components/input/_components/rc-input-number.tsx:905-1008`
- Modify: `packages/ui/src/components/input/input-number.test.tsx`
- Modify: `packages/ui/src/shadcn/button-group.tsx`
- Test: `packages/ui/src/components/input/input-number.test.tsx`

- [ ] **Step 1: Import ButtonGroup into rc-input-number**

Add this import near the other component imports:

```tsx
import { ButtonGroup } from "@acme/ui/components/button-group";
```

- [ ] **Step 2: Replace the spinner root shell with ButtonGroup**

In the `if (mode === "spinner")` branch, replace the opening and closing root element so it follows this shape:

```tsx
return (
  <ButtonGroup
    ref={inputNumberDomReference}
    data-slot="input-number-spinner"
    className={cn("w-[90px] overflow-hidden", className)}
    style={style}
  >
    {controls ? (
      <button
        type="button"
        aria-label="Decrease value"
        className="flex shrink-0 items-center justify-center px-3"
        disabled={disabled || rest.readOnly || downDisabled}
        onMouseDown={(event) => {
          handleSpinnerStepMouseDown(event, false);
        }}
        onMouseUp={safeStopSpinnerStep}
        onMouseLeave={cancelSpinnerStep}
        onClick={(event) => {
          if (suppressSpinnerClickReference.current) {
            event.preventDefault();
            event.stopPropagation();
            suppressSpinnerClickReference.current = false;
            return;
          }
          handleSpinnerStep(false);
        }}
      >
        {downHandler}
      </button>
    ) : null}

    <BaseInput
      className="min-w-0 flex-1 border-none shadow-none"
      triggerFocus={focus}
      value={value}
      disabled={disabled}
      prefix={prefix}
      suffix={middleSuffix}
      classNames={{
        ...classNames,
        input: cn("text-center", classNames?.input),
        affixWrapper: cn(
          "min-w-0 border-none bg-transparent shadow-none",
          classNames?.affixWrapper,
        ),
      }}
      components={{
        affixWrapper: "div",
        groupWrapper: "div",
        wrapper: "div",
        groupAddon: "div",
      }}
      ref={holderReference}
    >
      <InternalInputNumber
        disabled={disabled}
        ref={inputFocusReference}
        domRef={inputNumberDomReference}
        onStepRef={onStepReference}
        onDisabledChange={handleDisabledChange}
        upHandler={upHandler}
        downHandler={downHandler}
        controls={false}
        classNames={{
          input: cn("text-center", classNames?.input),
        }}
        {...rest}
      />
    </BaseInput>

    {controls ? (
      <button
        type="button"
        aria-label="Increase value"
        className="flex shrink-0 items-center justify-center px-3"
        disabled={disabled || rest.readOnly || upDisabled}
        onMouseDown={(event) => {
          handleSpinnerStepMouseDown(event, true);
        }}
        onMouseUp={safeStopSpinnerStep}
        onMouseLeave={cancelSpinnerStep}
        onClick={(event) => {
          if (suppressSpinnerClickReference.current) {
            event.preventDefault();
            event.stopPropagation();
            suppressSpinnerClickReference.current = false;
            return;
          }
          handleSpinnerStep(true);
        }}
      >
        {upHandler}
      </button>
    ) : null}
  </ButtonGroup>
);
```

- [ ] **Step 3: Keep spinner-specific center-field styling minimal**

After swapping the root shell, keep these class rules unchanged unless tests prove otherwise:

```tsx
className="min-w-0 flex-1 border-none shadow-none"
```

```tsx
affixWrapper: cn(
  "min-w-0 border-none bg-transparent shadow-none",
  classNames?.affixWrapper,
)
```

```tsx
input: cn("text-center", classNames?.input)
```

The point here is to let `ButtonGroup` own outer border merging while the middle field opts out of drawing an extra shell.

- [ ] **Step 4: Run the focused test suite**

Run:
```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run --project unit src/components/input/input-number.test.tsx
```

Expected: PASS. This should include:
- the new `role="group"` test,
- click increment/decrement,
- custom icon coverage,
- the cancelled-hold keyboard regression.

- [ ] **Step 5: Commit the shell swap**

Run:
```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add packages/ui/src/shadcn/button-group.tsx packages/ui/src/components/input/_components/rc-input-number.tsx packages/ui/src/components/input/input-number.test.tsx
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" commit -m "$(cat <<'EOF'
refactor(ui): use ButtonGroup in InputNumber spinner mode

Render spinner mode with a real ButtonGroup shell while preserving existing stepping and cancelled-hold behavior.
EOF
)"
```

---

### Task 3: Verify Storybook examples still describe spinner mode accurately

**Files:**
- Modify: `packages/ui/src/components/input/input-number.stories.tsx`
- Test: `packages/ui/src/components/input/input-number.test.tsx`

- [ ] **Step 1: Read the existing spinner stories and keep them unless the shell change makes them misleading**

The stories should remain focused on these cases:
- default spinner,
- prefix/suffix spinner,
- disabled spinner,
- read-only spinner,
- custom control icons.

If the current story file is still accurate after the shell swap, keep it unchanged.

- [ ] **Step 2: If needed, update one story wrapper to make the ButtonGroup shell easier to inspect**

Only if the shell change is hard to see in Storybook, adjust one story wrapper minimally, for example:

```tsx
export const Spinner: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-4">
      <InputNumber mode="spinner" defaultValue={3} min={1} max={10} />
    </div>
  ),
};
```

If no visual clarification is needed, skip this file.

- [ ] **Step 3: Re-run the focused tests after any story edits**

Run:
```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run --project unit src/components/input/input-number.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Run focused lint on changed files**

Run:
```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui lint src/components/input/_components/rc-input-number.tsx src/components/input/input-number.test.tsx src/components/input/input-number.stories.tsx
```

Expected: PASS with no errors.

- [ ] **Step 5: Commit the final polish if the story file changed**

If `input-number.stories.tsx` changed, run:

```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add packages/ui/src/components/input/input-number.stories.tsx
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" commit -m "$(cat <<'EOF'
docs(ui): align InputNumber spinner stories with ButtonGroup shell

Keep spinner stories accurate after switching spinner mode to a real ButtonGroup container.
EOF
)"
```

If the story file did not change, skip this commit.

---

## Final verification

- [ ] Run the focused test command one more time:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui exec vitest run --project unit src/components/input/input-number.test.tsx
```

- [ ] Run the focused lint command for all three relevant files:

```bash
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui lint src/components/input/_components/rc-input-number.tsx src/components/input/input-number.test.tsx src/components/input/input-number.stories.tsx
```

- [ ] Confirm the success criteria from the spec:
  - spinner mode renders with a real `ButtonGroup`,
  - click and hold interactions still behave the same,
  - cancelled-hold keyboard activation still works,
  - no public API changes were introduced,
  - non-spinner mode was not touched.
