# Popover default spacing and Storybook design

## Summary

Fix the root cause of `DatePicker` popover spacing by restoring the `Popover` wrapper's default spacing behavior to match the shadcn primitive, then document `Popover` with Storybook examples following the existing component-docs pattern used by `Combobox`.

## Problem

`DatePicker` currently depends on `align={{ offset: [0, 8] }}` in [packages/ui/src/components/date-picker/date-picker.tsx](../../packages/ui/src/components/date-picker/date-picker.tsx) to keep the popup from touching the input.

The likely root cause is not `DatePicker` itself, but the custom popover wrapper in [packages/ui/src/components/popover/_component.tsx](../../packages/ui/src/components/popover/_component.tsx). That wrapper renders `PopoverPrimitive.Content` directly and forwards `align`/`sideOffset` values that may be `undefined`, which bypasses the default values defined in [packages/ui/src/shadcn/popover.tsx](../../packages/ui/src/shadcn/popover.tsx).

## Decision

Use the wrapper-level fix.

- Keep the custom `PopoverContent` wrapper because it adds project-specific behavior (`container`, custom shadow, focus handling, wheel/touch propagation control).
- Restore shadcn-compatible defaults in the wrapper so spacing works without consumer-specific `align` offsets.
- Remove the `DatePicker`-specific spacing override once the wrapper behavior is corrected.
- Add Storybook coverage for `Popover` in the same documentation style already used by `Combobox`.

## Approaches considered

### Recommended: Fix the `Popover` wrapper

Update the wrapper so its default behavior matches shadcn for `align` and `sideOffset`, while preserving the project-specific customizations.

**Why this is preferred:**
- Fixes the abstraction instead of patching a single consumer.
- Prevents repeated `align={{ offset: [0, 8] }}` usage across components.
- Keeps the existing wrapper responsibilities intact.

### Rejected: Fix only `DatePicker`

Add spacing via class names, transforms, margin, or a different offset prop only in `DatePicker`.

**Why rejected:**
- Treats the symptom, not the cause.
- Leaves the shared `Popover` API inconsistent.

### Rejected: Replace wrapper usage entirely with `ShadcnPopoverContent`

Render the shadcn component directly instead of the custom wrapper.

**Why rejected:**
- The current wrapper contains real project-specific behavior that would still need to be reintroduced.
- Produces more churn than necessary for this fix.

## Implementation outline

1. Update [packages/ui/src/components/popover/_component.tsx](../../packages/ui/src/components/popover/_component.tsx) so `PopoverContent` restores shadcn-compatible defaults for `align` and `sideOffset`.
2. Verify [packages/ui/src/components/popover/popover.tsx](../../packages/ui/src/components/popover/popover.tsx) does not erase those defaults when optional offsets are absent.
3. Remove `align={{ offset: [0, 8] }}` from [packages/ui/src/components/date-picker/date-picker.tsx](../../packages/ui/src/components/date-picker/date-picker.tsx).
4. Add a regression test for the wrapper default spacing behavior in [packages/ui/src/components/popover/popover.test.tsx](../../packages/ui/src/components/popover/popover.test.tsx).
5. Add Storybook stories and example files for `Popover`, modeled after the colocated examples/story structure used by `Combobox`.

## Storybook scope

Add `Popover` stories that cover:

- Standard wrapper API (`content`, `title`, `description`, trigger usage)
- Composable API (`PopoverRoot`, `PopoverTrigger`, `PopoverContent`)
- At least one positioning/spacing-focused example that makes the default gap visible

The story organization should follow the `Combobox` docs approach: colocated examples and a story file that presents the examples clearly rather than relying only on raw args.

## Testing

Follow TDD during implementation:

- Add a failing regression test first for default popover content spacing/default-prop behavior.
- Run the targeted UI test command and confirm the failure is for the expected reason.
- Implement the minimal wrapper change to make the test pass.
- Run the targeted tests again.

## Out of scope

- General popover API redesign
- Changing all popover placements or animation behavior
- Refactoring unrelated date-picker logic
