# Card Size Story Design

**Date:** 2026-03-19

## Goal
Update the Card `Sizes` Storybook story so it visually matches the simpler shadcn-style example the user provided while still demonstrating the difference between the default and `small` card sizes.

## Context
- `@acme/ui/src/components/card/card.stories.tsx` already contains a `Sizes` story that compares the default and `small` card spacing side by side.
- The current story demonstrates size differences, but its content is more verbose and less aligned with the compact example the user wants.
- The local Card API supports `size="small"`, not `size="sm"`, so the story should preserve the existing API while adopting the desired presentation.

## Chosen Approach
Keep the `Sizes` story as a side-by-side comparison, but simplify both cards so they share the same compact structure and visual style as the provided example.

### Why this approach
- Preserves the meaning of the `Sizes` story by continuing to compare default and small variants directly.
- Aligns the presentation more closely with the user’s desired example: centered cards, narrow max width, short copy, and a full-width footer action.
- Avoids unnecessary component API changes because the story can use the existing `size="small"` prop.

## Planned Story Structure
- Keep `export const Sizes`.
- Keep `parameters.layout = "padded"`.
- Render a responsive comparison layout with two cards:
  - one default card
  - one `size="small"` card
- Give each card `className="mx-auto w-full max-w-sm"`.
- Add lightweight labels above each card: `Default` and `Small`.
- Use the same simplified content structure in both cards:
  - `CardHeader`
  - `CardTitle`
  - `CardDescription`
  - `CardContent`
  - `CardFooter`
- Use a full-width footer button to match the example style.
- Keep the copy short and size-focused so spacing remains the main point of comparison.

## Content Direction
### Default card
- Title: `Default Card`
- Description: `This card uses the default size variant.`
- Body copy explains that the default card has the standard spacing and comfortable layout.

### Small card
- Title: `Small Card`
- Description: `This card uses the small size variant.`
- Body copy explains that the small card uses more compact spacing for tighter layouts.

## API Note
- Use `size="small"` in the story implementation because that matches the current Card API.
- Do not add support for `size="sm"` as part of this story change.
- If the shared `Button` component already supports a compact button size, it can use `size="sm"` to visually match the provided example.

## Non-goals
- Do not change the Card component API.
- Do not rename the story.
- Do not add controls or extra interactive behavior.
- Do not modify Card wrapper logic as part of this presentation update.

## Verification
- Run a targeted typecheck for `@acme/ui`:
  - `pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui typecheck`
- Re-read `@acme/ui/src/components/card/card.stories.tsx` after editing to confirm the `Sizes` story still clearly compares default and small variants while matching the requested visual structure.
