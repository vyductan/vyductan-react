# Descriptions colon behavior design

## Goal

Make `Descriptions` hide the colon for `layout="vertical"` when `bordered={false}`, while keeping the colon visible for `layout="horizontal"` when `bordered={false}`.

## Recommended approach

Update the `labelClassName` logic in `@acme/ui/src/components/descriptions/descriptions.tsx` so the pseudo-colon is applied only for the horizontal layout by default. Keep `colon={false}` as the explicit override that disables colons globally.

## Why this approach

- The current issue comes from a shared label class that always adds a pseudo-colon unless `colon={false}`.
- The desired behavior is layout-specific, so the smallest correct fix is to make the colon rule layout-aware.
- This avoids touching the render branches or row generation logic.

## Scope

- Modify only the label class composition logic in `Descriptions`.
- Preserve current horizontal non-bordered colon behavior.
- Remove the colon for vertical non-bordered layout by default.
- Preserve `colon={false}` as a hard-off switch.

## Out of scope

- No API changes.
- No row rendering changes.
- No typography or spacing changes.
- No additional story expansion unless needed for verification.

## Testing

- Run `pnpm -F @acme/ui typecheck`.
- Lint the modified Descriptions files directly.
- Verify in Storybook that horizontal non-bordered still shows a colon and vertical non-bordered does not.
