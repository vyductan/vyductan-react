# Checkbox description-prop design

## Summary
Add a `description` prop to the shared `Checkbox` component so consumers can render stacked helper text without having to move label/description markup outside the component. This keeps `Checkbox` directly bound to form libraries such as `FormItem` while still supporting the existing `children`-based label API.

## Context
In [checkbox.tsx](../../packages/ui/src/components/checkbox/checkbox.tsx), the component currently treats `children` as the only built-in label content. When consumers need a label plus secondary descriptive text in a form field, they currently have to compose the checkbox separately from its text block, for example by placing `<Checkbox />` beside an external `<label>` and `<p>`.

That composition works visually, but it breaks the more convenient pattern where the form library binds directly to the `Checkbox` component with `valuePropName="checked"`. The requested change is to let `Checkbox` own its descriptive text so form-bound usage can stay on the component itself.

## Decision
- Add `description?: React.ReactNode` to `Checkbox` props.
- Do not add a `title` prop.
- Continue using `children` as the primary label content.
- If `description` is not provided, preserve the current rendering behavior.
- If `description` is provided:
  - Automatically change the outer layout alignment from `items-center` to `items-start`.
  - Keep rendering `children` as the primary label content.
  - Render the text content in a stacked block instead of the current single-line inline label treatment.
  - Wrap `description` in:

```tsx
<p className="text-muted-foreground text-xs">{description}</p>
```

- Apply this behavior to both `variant="default"` and `variant="card"`.
- Keep the existing rule that `loading` suppresses inline label content.
- Keep the existing empty-label behavior: if there is no renderable `children`, do not render the primary label wrapper.
- When `description` exists without renderable `children`, still render the description block.

## Why this approach
This is the smallest API addition that solves the actual form-integration problem.

Compared with alternatives:
- Adding both `title` and `description` would introduce two competing ways to express the primary label (`children` vs `title`) without solving an additional requirement.
- Requiring consumers to keep using external layout markup would preserve the current pain point for `FormItem` integration.
- Adding a nested object prop such as `label={{ description }}` would be more verbose without providing a clearer API.

## Non-goals
- No changes to checkbox group behavior.
- No changes to change-event payloads or `checked` handling.
- No changes to the public primitive/no-children dispatch heuristic in [index.tsx](../../packages/ui/src/components/checkbox/index.tsx).
- No new typography abstraction for checkbox descriptions.
- No change to the upstream-style ownership split in [shadcn/checkbox.tsx](../../packages/ui/src/shadcn/checkbox.tsx).

## Expected outcomes
- Consumers can write form-bound usage like:

```tsx
<FormItem name="p_allows_custom_start_time" valuePropName="checked">
  <Checkbox
    id="allow-custom-start-time"
    description="Customers can choose any time to start instead of selecting from predefined slots."
  >
    Allow custom start time
  </Checkbox>
</FormItem>
```

- `Checkbox` remains the form-bound control instead of being split away from its descriptive text.
- Default-variant checkboxes with `description` render stacked label + helper text and align from the top.
- Card-variant checkboxes with `description` render the same stacked content model inside the card layout.
- Existing `children`-only usage continues to render as it does today.

## Documentation notes
At implementation time, update the checkbox docs to explain that `description` exists primarily to support `FormItem`-style integrations where the checkbox must remain the bound field component. Show the form-bound example and contrast it with the more manual composable layout pattern.

## Verification notes
At implementation time, verify these cases:
1. `children={"Label"}` with no `description`: current default rendering stays unchanged.
2. `children={"Label"}` with `description`: wrapper alignment changes to `items-start`, label and description render as a stacked block, and description uses `text-muted-foreground text-xs`.
3. `variant="card"` with `children` and `description`: card layout still applies and the text content stays stacked.
4. `description` without renderable `children`: description still renders.
5. `loading` enabled with `description`: loading behavior remains correct and does not duplicate label content unexpectedly.
6. Accessible naming still comes from the primary label content (`children`), not from the description alone.
