# Descriptions colon story stacked layout design

## Goal

Change the `CompareColonBehavior` Storybook story so the horizontal and vertical examples are stacked vertically instead of shown side by side.

## Recommended approach

Update only the wrapper layout in `renderCompareColonBehavior()` inside `@acme/ui/src/components/descriptions/descriptions.stories.tsx`.

## Why this approach

- It directly addresses the presentation request without changing the story content.
- It keeps the story easy to scan in a narrower canvas.
- It is the smallest possible change.

## Scope

- Modify only the `CompareColonBehavior` story wrapper.
- Keep the two existing sections and labels intact.
- Preserve all component props and story data.

## Out of scope

- No component logic changes.
- No changes to `CompareSizes`.
- No new stories or controls.

## Testing

- Run `pnpm -F @acme/ui typecheck`.
- Lint the modified Descriptions files directly.
- Verify in Storybook that `CompareColonBehavior` now stacks the two sections vertically.
