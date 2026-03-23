# Descriptions vertical size contrast design

## Goal

Increase the visible contrast between `size="small"` and `size="middle"` for `Descriptions` in `layout="vertical"`.

## Recommended approach

Keep the change limited to vertical spacing, but widen the gap between the small and middle/default spacing values so the comparison is obvious in Storybook.

## Why this approach

- Preserves the existing design decision that size affects spacing, not typography.
- Makes the difference easier to perceive in the current side-by-side comparison story.
- Minimizes blast radius by adjusting only the vertical spacing utilities already introduced.

## Scope

- Update the vertical spacing class values in `@acme/ui/src/components/descriptions/descriptions.tsx`.
- Make `small` tighter and `middle/default` slightly looser to create clearer contrast.
- Reuse the existing Storybook comparison story for validation.

## Out of scope

- No prop or API changes.
- No typography changes.
- No horizontal layout changes.
- No story expansion unless verification shows the current story is insufficient.

## Testing

- Run `pnpm -F @acme/ui typecheck`.
- Lint the modified Descriptions files directly.
- Verify the `Components/Descriptions/Compare Sizes` story visually with `layout="vertical"`.
