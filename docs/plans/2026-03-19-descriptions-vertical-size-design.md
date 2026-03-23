# Descriptions vertical size design

## Goal

Make `Descriptions` apply `size` visibly in `layout="vertical"`, so `size="small"` is meaningfully tighter than the default or middle size.

## Recommended approach

Update the existing size-based class logic in `@acme/ui/src/components/descriptions/descriptions.tsx` so the vertical layout also changes vertical spacing. Keep the change focused on spacing only.

## Why this approach

- Matches the existing mental model that `size` should affect spacing.
- Aligns with Ant Design’s implementation direction, where size influences row cell padding for Descriptions generally.
- Minimizes blast radius by avoiding API changes, row-generation changes, or unrelated visual refactors.

## Scope

- Modify `thClassName` and `tdClassName` so the vertical layout responds to `size`.
- Prefer tightening vertical padding/bottom spacing only.
- Allow small local cleanup if it directly improves readability of the size/layout class logic.
- Reuse the current Storybook comparison story to verify the visual change.

## Out of scope

- No prop/API changes.
- No changes to horizontal sizing behavior beyond incidental cleanup.
- No redesign of item rendering or table structure.
- No broad component refactor unrelated to size handling.

## Data flow

- `Descriptions` already receives `size` as a prop.
- The change stays inside the class-name derivation for table header/content cells.
- Existing row creation and render branches remain unchanged.

## Error handling

- No runtime logic or external data handling changes are required.
- Risk is limited to visual spacing differences in vertical layout.

## Testing

- Run `pnpm -F @acme/ui typecheck`.
- Lint the modified file(s) if needed.
- Verify the `Components/Descriptions/Compare Sizes` story visually with `layout="vertical"`.
