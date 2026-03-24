# Segmented Story Design

**Goal:** Add a Storybook story for the existing `Segmented` component in `@acme/ui` and adjust its styling so inactive background changes feel immediate instead of slowly animating.

## Scope

- Add a colocated story file at `@acme/ui/src/components/segmented/segmented.stories.tsx`
- Showcase the current public API of `Segmented`
- Update the `Segmented` trigger styling to avoid animating background color changes through `transition-all`
- Keep the component API unchanged
- Do not add interaction tests in this pass

## Recommended approach

Use a small Storybook setup plus a focused styling change:
- add a `Playground` story for trying values quickly
- add a visual story that makes the inactive container background easy to inspect
- replace the broad `transition-all` class on the trigger with narrower transition classes so active/inactive background changes happen immediately

This is the best fit because it gives a direct visual check in Storybook while fixing the root cause of the sluggish color transition with the smallest possible code change.

## Story structure

The story file should:
- use `Meta` and `StoryObj` from `@storybook/nextjs-vite`
- register under `title: "Components/Segmented"`
- set `component: Segmented`
- expose controls for the existing props that are useful in Storybook, such as `block`, `size`, and `disabled`
- use realistic options so active and inactive backgrounds are easy to compare

## Proposed stories

1. `Playground`
   - interactive args for common props
   - primary story for quick manual checks

2. `BackgroundContrast`
   - uses a simple fixed option set and wrapper spacing so the inactive container background is easy to inspect while toggling active items

3. `Block`
   - shows full-width segmented behavior and ensures the styling change still feels correct when items stretch

## Styling change

Update the trigger class in `@acme/ui/src/components/segmented/segmented.tsx`:
- remove `transition-all`
- keep only targeted transitions that still make sense, such as shadow or text color, without animating the background fill

This should make switching between segments feel snappier and prevent the inactive background from appearing to fade slowly.

## Testing strategy

Manual validation is sufficient for this request:
- open Storybook for `Segmented`
- verify each story renders
- toggle between options and confirm the active background swaps immediately
- confirm inactive container background remains visually stable
- confirm block mode still lays out correctly

## Notes

- Keep the change minimal and local to the segmented component and its story
- Prefer story examples that make the visual issue obvious rather than adding extra implementation complexity
