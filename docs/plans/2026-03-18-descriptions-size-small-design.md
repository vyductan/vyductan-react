# Descriptions size small Storybook design

## Goal

Add Storybook coverage to compare `Descriptions` with `size="small"` against the default/middle sizing so spacing differences are visible in one screen.

## Recommended approach

Create a single comparison story that renders two `Descriptions` examples side by side using the same data. One example will use `size="small"`, and the other will use the default or `size="middle"` sizing.

## Why this approach

- Makes spacing differences visible immediately without switching stories or controls.
- Matches the reported issue that `size="small"` appears to have no effect.
- Gives a stable visual regression surface for Storybook and Chromatic.

## Story scope

- Add a new Storybook file for `Descriptions`.
- Include a `CompareSizes` story.
- Use the horizontal bordered layout because the component currently applies size-dependent table cell spacing there.
- Reuse a single shared `items` dataset so the only visible difference is size.

## Data flow

- The story will import `Descriptions` from the component package.
- The story will define one shared `items` array.
- The story layout will render two comparison panels with labels for each size variant.

## Error handling

- No runtime behavior changes are planned.
- This is documentation-only coverage intended to make existing behavior observable.

## Testing

- Validate the story renders in Storybook.
- Optionally run the targeted `@acme/ui` test/lint workflow if needed after implementation.
