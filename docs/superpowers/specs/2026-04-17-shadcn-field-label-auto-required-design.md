# Shadcn FieldLabel Auto-Required Design

## Summary

Enable `FieldLabel` in shadcn-style forms to automatically render the required asterisk based on the active field name and the current form schema, matching the existing behavior already present in the legacy/custom form component.

The approved direction is to use a small field-name context for shadcn-style `Controller` subtrees (Approach A), so consumers can keep the current explicit `Controller` + `Field` + `FieldLabel` structure without passing `required` manually.

## Goals

- Preserve the current shadcn-style authoring pattern used in files like `packages/ui/src/components/form/examples/shadcn.tsx`.
- Make `FieldLabel` automatically show `*` when the corresponding field is required by the active form schema.
- Reuse the existing schema optionality logic already implemented by `useRequiredFieldCheck`.
- Keep manual `required` support working so explicit props can still override inferred behavior.

## Non-Goals

- Do not redesign the public authoring API for shadcn-style forms.
- Do not require consumers to pass `name` into `FieldLabel`.
- Do not move required-indicator responsibility into `Field`.
- Do not change validation behavior, error messages, or field registration semantics.

## Existing Patterns to Reuse

### Required inference already exists

The legacy/custom form path already infers required state from schema in `packages/ui/src/components/form/_components/form-field.tsx` by calling `useRequiredFieldCheck(name)` and forwarding the result to `FieldLabel`.

### `FieldLabel` already supports rendering required UI

`packages/ui/src/components/field/field-label.tsx` already accepts a `required?: boolean` prop and renders the destructive asterisk when that prop is truthy.

### Schema optionality logic already exists

`packages/ui/src/components/form/hooks/use-field-optionality-check.ts` already resolves whether a field is optional by reading the current form schema from form context and inspecting the field path in the Zod schema.

## Proposed Design

### 1. Add a lightweight field-name context for shadcn-style field subtrees

Introduce a small internal context whose responsibility is only to expose the current field name for the active shadcn-style field subtree.

This context should:
- hold `name?: string`
- be internal to the form/field integration layer
- have no user-facing API

### 2. Provide the field name from the shadcn-style controller boundary

Where shadcn-style fields are currently rendered through `Controller`, wrap the rendered subtree in the new provider so that descendants such as `FieldLabel` can resolve the active field name.

This keeps the current usage style intact:
- user still writes `Controller`
- user still writes `Field`
- user still writes `FieldLabel`
- no extra prop is required on `FieldLabel`

### 3. Teach `FieldLabel` to infer required state when not explicitly provided

Update `FieldLabel` so it keeps its current explicit behavior first:
- if `required` prop is passed, use it directly
- otherwise, try to infer required state from:
  - active field name from the new field-name context
  - active form schema via the existing form context
  - the existing `useRequiredFieldCheck` hook

This preserves backward compatibility and keeps manual override support.

### 4. Scope of automatic behavior

Automatic required rendering should only happen when all required information exists:
- there is an active field-name provider
- there is a form context with schema
- the schema lookup succeeds

If that information is missing, `FieldLabel` should behave exactly as it does today.

## Expected Authoring Experience

### Before

Consumers write:
- `Controller`
- `Field`
- `FieldLabel`
- manual `required` if they want an asterisk

### After

Consumers keep writing the same shadcn-style structure, but `FieldLabel` will automatically show the required asterisk when its field is required by schema.

Example target experience:
- `username` label auto-shows `*`
- `password` label auto-shows `*`
- `billingPeriod` label auto-shows `*`
- `teamSize` label auto-shows `*`
- optional fields remain unchanged

## Error Handling

- Explicit `required` prop continues to win over inferred behavior.
- If there is no schema in form context, inference is skipped.
- If there is no current field-name provider, inference is skipped.
- If a field cannot be found in schema, follow the existing `useRequiredFieldCheck` behavior rather than inventing a new fallback path.

## Testing Strategy

### Unit coverage

Add focused tests that verify:
- `FieldLabel` still renders `*` when `required` is explicitly passed.
- `FieldLabel` auto-renders `*` when used under a shadcn-style field subtree with a required schema field.
- `FieldLabel` does not render `*` for optional schema fields.
- `FieldLabel` does not regress when used outside schema-aware form context.

### Example coverage

Update or add an example-level test around `packages/ui/src/components/form/examples/shadcn.tsx` to verify the labels in the demo reflect required fields automatically without manual `required` props.

## Files Likely Involved

- `packages/ui/src/components/field/field-label.tsx`
- `packages/ui/src/components/form/hooks/use-field-optionality-check.ts` (reuse, likely unchanged or minimally adjusted)
- form integration layer file(s) where the shadcn-style `Controller` subtree can provide current field name
- tests for `FieldLabel` and/or shadcn form example

## Trade-Offs

### Benefits

- Matches the existing form component behavior users already expect.
- Keeps the shadcn-style API clean and low-noise.
- Reuses existing schema inference logic instead of duplicating required detection.

### Costs

- Adds implicit behavior via context, which is more magical than explicit props.
- `FieldLabel` becomes aware of field identity indirectly rather than only presentational concerns.
- Automatic behavior depends on correct subtree structure.

## Recommendation

Implement the field-name context approach because it gives the desired zero-prop authoring experience while aligning with the existing auto-required behavior already present elsewhere in the form system.
