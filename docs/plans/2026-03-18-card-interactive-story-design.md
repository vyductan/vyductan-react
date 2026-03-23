# Interactive Card Story Design

**Date:** 2026-03-18

## Goal
Fix the existing `Interactive` Card Storybook example so it no longer suggests the whole card is clickable when only the footer action is interactive.

## Context
- The story lives in `@acme/ui/src/components/card/card.stories.tsx`.
- The current `Interactive` story adds `cursor-pointer transition-all hover:shadow-lg` to the `Card`, which visually implies full-card interactivity.
- The actual interactive element is only the footer `Button`.
- A reviewer flagged this as a documentation/accessibility issue because consumers could copy a misleading pattern.

## Chosen Approach
Keep the existing story structure and content, but remove card-level click affordances so only the actual button reads as interactive.

### Why this approach
- Fixes the accessibility/documentation issue with the smallest possible diff.
- Avoids changing component APIs or adding wrapper semantics.
- Preserves the purpose of the story while making the interaction model honest.

## Planned Changes
- Update `Interactive` in `@acme/ui/src/components/card/card.stories.tsx`.
- Remove `cursor-pointer`, `transition-all`, and `hover:shadow-lg` from the `Card` container.
- Keep the footer `Open` button as the only interactive control.
- Leave the rest of the story content intact unless a tiny copy or layout tweak is needed for clarity.

## Non-goals
- Do not make the full card clickable.
- Do not refactor other stories.
- Do not change the Card component implementation.

## Verification
- Run a fresh targeted package check from the workspace root:
  - `pnpm -F @acme/ui typecheck`
- Confirm the story file still typechecks after the change.
