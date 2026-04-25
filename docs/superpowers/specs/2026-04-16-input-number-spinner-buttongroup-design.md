# InputNumber spinner ButtonGroup design

## Summary

Update `InputNumber` spinner mode so it renders a real `ButtonGroup` shell while keeping the existing numeric input behavior and spinner interaction logic inside `InputNumber`.

## Goal

Align spinner mode with the existing `ButtonGroup` composition pattern used elsewhere in the UI package without regressing the current `InputNumber` spinner behavior.

## Scope

This design covers:
- changing the spinner-mode shell in `packages/ui/src/components/input/_components/rc-input-number.tsx` to use `ButtonGroup`,
- keeping the center field implemented with the existing `BaseInput + InternalInputNumber` structure,
- preserving current spinner interactions such as click stepping, press-and-hold repeat, cancelled-hold cleanup, and focus behavior,
- preserving current spinner-mode API decisions: keep `prefix` and `suffix`, omit `allowClear`, `addonBefore`, and `addonAfter`.

Out of scope for this iteration:
- changing the public `InputNumber` API,
- moving spinner behavior into `ButtonGroup`,
- introducing a new shared primitive below `ButtonGroup`,
- broad refactors to `ButtonGroup`, `BaseInput`, or `InternalInputNumber` outside what is needed for spinner composition,
- changing non-spinner `InputNumber` rendering.

## Decision

Use `ButtonGroup` as the outer spinner container, but keep the middle numeric field and all stepping behavior owned by `InputNumber`.

This keeps the visual composition aligned with the existing `ButtonGroup` pattern while avoiding behavior leakage into a purely presentational grouping primitive.

## Approaches considered

### Recommended: ButtonGroup as spinner shell only

Render `ButtonGroup` around three visual children:
1. decrement button,
2. center input field,
3. increment button.

The center child remains the existing `BaseInput` wrapper containing `InternalInputNumber`. The left and right controls remain owned by the spinner branch in `rc-input-number.tsx`.

**Why this is preferred:**
- Satisfies the requirement to use a real `ButtonGroup`.
- Reuses the existing border/radius/focus-stacking behavior from `ButtonGroup`.
- Keeps spinner-specific behavior local to `InputNumber`.
- Minimizes regression risk because stepping and input logic stay in the same place.

### Rejected: fully recompose spinner mode as generic ButtonGroup children

Treat spinner mode as a pure `ButtonGroup` composition problem and reshape the center field to behave like a generic sibling next to two generic buttons.

**Why rejected:**
- Increases coupling between `ButtonGroup` structure and `InputNumber` internals.
- Risks regressions around affix rendering, width management, focus handling, and numeric input behavior.
- Expands the scope beyond the user’s requested composition change.

### Rejected: keep custom shell and only mimic ButtonGroup styling

Leave the current custom spinner shell in place and copy the `ButtonGroup` look with classes.

**Why rejected:**
- Does not satisfy the requested direction to render a real `ButtonGroup`.
- Duplicates composition logic already available in the codebase.

## Component shape

The spinner branch in `packages/ui/src/components/input/_components/rc-input-number.tsx` should switch from a custom root `div` to `ButtonGroup`.

The rendered structure should still conceptually be:
- left step button,
- center numeric input,
- right step button.

The center numeric input should continue to use `BaseInput` and `InternalInputNumber` so existing focus, numeric parsing, disabled handling, and affix behavior remain intact.

## Styling expectations

Using `ButtonGroup` should provide the outer shell’s merge behavior for borders, radii, and focus stacking.

The spinner-specific center field classes should be adjusted only as needed so that:
- the middle field stretches correctly inside the group,
- border duplication does not appear,
- the numeric text remains centered,
- prefix and suffix continue to render correctly in spinner mode,
- disabled and read-only states remain visually coherent.

## Behavior requirements

The following existing spinner-mode behavior must remain unchanged:
- normal click increments and decrements by one step,
- press-and-hold repeats after the configured delay,
- cancelled holds clear suppression correctly,
- normal click suppression still prevents double-step,
- keyboard activation after a cancelled hold still works,
- the input remains editable unless disabled or read-only.

## Testing requirements

Existing focused spinner tests in `packages/ui/src/components/input/input-number.test.tsx` should continue to pass.

If the `ButtonGroup` shell changes any DOM assumptions in the current tests, update the tests only where necessary to reflect the new structure while preserving the same behavioral assertions.

Storybook coverage in `packages/ui/src/components/input/input-number.stories.tsx` should continue to demonstrate spinner mode accurately after the shell change.

## Success criteria

This design is successful when:
- spinner mode renders with a real `ButtonGroup`,
- visual grouping matches the existing ButtonGroup pattern,
- the current spinner interaction tests still pass,
- no public API changes are introduced,
- non-spinner `InputNumber` mode remains unaffected.
