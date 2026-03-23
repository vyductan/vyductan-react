# Card WithAction Width Design

**Date:** 2026-03-18

## Goal
Keep the `WithAction` story using shadcn-style responsive width classes while ensuring the Storybook preview gives it enough horizontal space to render closer to its intended max width.

## Context
- `WithAction` currently uses `w-full max-w-sm` in `@acme/ui/src/components/card/card.stories.tsx`.
- The file-level Storybook meta sets `layout: "centered"`, which can constrain the preview experience for width-responsive examples.
- Global Storybook preview in `@acme/ui/.storybook/preview.tsx` does not currently force centered layout.
- The issue appears scoped to how this story is rendered in its canvas/docs context rather than a problem with the Card component itself.

## Chosen Approach
Keep the story responsive and scoped by updating `WithAction` to use `w-full min-w-sm max-w-sm`, then override layout/presentation for this story only so the preview container is wider by default.

### Why this approach
- Preserves the shadcn-like API and width behavior.
- Avoids changing global Storybook behavior for every component.
- Minimizes blast radius to one story file unless a small local wrapper is needed.

## Planned Changes
- Update `WithAction` card classes in `@acme/ui/src/components/card/card.stories.tsx` to `w-full min-w-sm max-w-sm`.
- Add story-scoped preview behavior for `WithAction`, likely via:
  - story-level `parameters.layout = "padded"`, and/or
  - a lightweight wrapper with enough width for the card to expand.
- Prefer story-local changes over edits to `@acme/ui/.storybook/preview.tsx`.

## Non-goals
- Do not change global Storybook preview defaults unless required.
- Do not refactor unrelated Card stories.
- Do not change the Card component implementation.

## Verification
- Run fresh typecheck from the workspace root:
  - `pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui typecheck`
- If needed, inspect Storybook behavior locally after the scoped layout change.
