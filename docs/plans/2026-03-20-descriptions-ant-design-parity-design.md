# Descriptions Ant Design parity design

## Goal

Make `Descriptions` behave closer to Ant Design in two ways:
- default `column` becomes responsive when the prop is omitted
- horizontal rows automatically fill remaining columns with the last item in the row instead of leaving trailing empty space

## Recommended approach

Update the core `Descriptions` implementation so omitted `column` uses a built-in responsive column map, and update horizontal row packing to normalize the last item in each row to consume leftover columns.

## Why this approach

- It matches the behavior the user expects from Ant Design without changing the public API.
- It keeps the behavior deterministic and easy to test.
- It avoids fragile heuristics such as measuring text length to decide span.

## Scope

- Change default `column` behavior in `@acme/ui/src/components/descriptions/descriptions.tsx`.
- Change horizontal row packing in `@acme/ui/src/components/descriptions/utils.ts`.
- Add regression tests in `@acme/ui/src/components/descriptions/descriptions.test.tsx`.
- Optionally add or update a story only if needed for visual verification.

## Out of scope

- No text-length measurement or dynamic content-based span calculation.
- No API redesign for `DescriptionsItem`.
- No unrelated changes to vertical spacing, colon rules, or story structure beyond verification needs.

## Behavior details

### 1. Responsive default columns

Current behavior:
- `column` defaults to `3`
- `<Descriptions title="User Info" items={items} />` stays fixed at 3 columns

Proposed behavior:
- if `column` is omitted, use a built-in responsive map
- if `column` is provided by the caller, preserve existing precedence and use it unchanged

Recommended default map:

```ts
const DEFAULT_COLUMN: Partial<Record<Screens, number>> = {
  xs: 1,
  sm: 2,
  md: 3,
};
```

### 2. Horizontal remaining-column fill

Current behavior:
- horizontal row packing respects explicit `span`
- leftover columns at the end of a row remain unused

Proposed behavior:
- after collecting a horizontal row, if the row total is below the active column count, increase the last item's span by the remaining amount
- preserve explicit spans for all earlier items
- preserve wrapping behavior when a new item would exceed the row width

Example with 3 columns:
- items with spans `[1, 1]` become `[1, 2]` for that row
- items with spans `[1, 2]` stay `[1, 2]`
- items with spans `[2, 1]` stay `[2, 1]`

## Testing

- Add regression tests for horizontal row fill behavior in `descriptions.test.tsx`.
- Add regression tests for default responsive column behavior.
- Re-run targeted Descriptions tests.
- Re-run targeted lint checks.
- Run package typecheck and report baseline failures honestly if unrelated files remain broken.

## Risks and mitigations

- Risk: changing default columns could alter existing story snapshots or layout expectations.
  - Mitigation: keep user-provided `column` behavior unchanged and verify Storybook examples.
- Risk: auto-filling the last horizontal item could affect row rendering unexpectedly.
  - Mitigation: cover row packing with explicit unit-style regression tests.
