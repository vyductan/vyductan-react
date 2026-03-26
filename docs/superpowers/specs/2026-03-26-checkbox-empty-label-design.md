# Checkbox empty-label rendering design

## Summary
Update the shared `Checkbox` component so it does not render an empty label wrapper when the `children` prop does not contain renderable label content. The outer `<label>` stays in place to preserve checkbox semantics, click behavior, and the existing component API.

## Context
In [checkbox.tsx](../../../../@acme/ui/src/components/checkbox/checkbox.tsx), the component currently renders the label `<span data-slot="checkbox-label">` whenever it is not in the loading state. That means cases with no meaningful label content still produce an extra DOM node and keep label padding that is not visually needed.

## Decision
- Keep the existing outer `<label>` structure.
- Keep the current loading behavior: when `loading` is true, continue rendering `LoadingIcon`.
- When `loading` is false, render the label `<span>` only if `children` contains renderable label content.
- Define renderable label content with React child normalization:
  - Treat `null`, `undefined`, and boolean children as no label content.
  - Treat numbers, non-empty strings, elements, fragments, and arrays containing renderable children as label content.
  - Treat the empty string (`""`) as no label content so the component does not render an empty wrapper for a visually empty label.
- If there is no renderable label content, do not render the label `<span>` at all.

## Why this approach
This is the smallest change that fixes the unwanted empty label node without affecting the checkbox API or its interaction model.

Compared with alternatives:
- Keeping the `<span>` and only stripping classes would still leave unnecessary DOM.
- Removing the outer `<label>` would risk changing semantics and click behavior.

## Non-goals
- No API changes to `Checkbox` props.
- No changes to group behavior, change events, or disabled handling.
- No broader refactor of checkbox layout or styling.

## Expected outcomes
- Checkboxes with renderable label content continue to render a label `<span>`.
- Checkboxes without renderable label content no longer render an empty label `<span>`.
- Unlabeled checkboxes no longer inherit label-text padding from an empty wrapper.
- `classNames?.label` continues to apply when the label `<span>` is rendered, and naturally has no effect when the label `<span>` is omitted.

## Verification notes
At implementation time, verify these cases:
1. `children={"Label"}`: label span still renders.
2. `children={0}`: label span still renders.
3. `children={undefined}`, `children={null}`, or `children={false}`: label span is omitted.
4. `children={""}`: label span is omitted.
5. `loading` enabled: `LoadingIcon` still renders as before.
6. Outer `<label>` remains the wrapping element in all cases.
