# CardAction Story Design

**Date:** 2026-03-18

## Goal
Add a new Storybook example for the Card component that demonstrates `CardAction` usage in the header following the shadcn composition style.

## Context
- The current Card stories in `@acme/ui/src/components/card/card.stories.tsx` do not include a dedicated `CardAction` example.
- The Card implementation already supports `CardAction` as part of the composed API exported from `@acme/ui/src/components/card/index.tsx`.
- The user requested a usage pattern "như shadcn", meaning the story should use `CardAction` directly within `CardHeader`, not indirectly via the `extra` prop.

## Chosen Approach
Add a new standalone story named `WithAction` to `@acme/ui/src/components/card/card.stories.tsx`.

### Why this approach
- Keeps existing stories unchanged.
- Makes the shadcn-style composition explicit and easy to discover.
- Minimizes blast radius to a single story file.

## Story Structure
The new story will render:
- `Card`
- `CardHeader`
- `CardTitle`
- `CardDescription`
- `CardAction`
- `CardContent`

The layout should match the existing card story sizing pattern (`w-[350px]`) and use a small action control in the header to make the `CardAction` slot visually obvious.

## Non-goals
- No changes to Card component implementation.
- No changes to existing stories unless required for imports.
- No new abstractions or helper components.

## Verification
- Run targeted Storybook/type-safe validation for the `@acme/ui` package if needed.
- Confirm the new story compiles and is consistent with existing story patterns.
