# Descriptions colon verification story design

## Goal

Add a small Storybook story that makes the colon behavior easy to verify visually: horizontal non-bordered should show colons, while vertical non-bordered should not.

## Recommended approach

Add one comparison story to `@acme/ui/src/components/descriptions/descriptions.stories.tsx` that renders horizontal and vertical non-bordered `Descriptions` side by side using the same data.

## Why this approach

- It directly verifies the new layout-specific colon rule.
- It keeps the story surface small and focused.
- It avoids spreading the same verification across multiple separate stories.

## Scope

- Keep the existing `CompareSizes` story.
- Add a new `CompareColonBehavior` story.
- Reuse the existing `descriptionItems` dataset and title.
- Render one horizontal non-bordered example and one vertical non-bordered example side by side.

## Out of scope

- No component logic changes.
- No new controls or complex story interactions.
- No extra colon override demo unless later needed.

## Testing

- Run `pnpm -F @acme/ui typecheck`.
- Lint the modified Descriptions story file.
- Verify in Storybook that the horizontal example shows colons and the vertical example does not.
