# Editor Playground retest surface design

## Goal

Keep the dedicated `Playground` Storybook story as the stable target for the editor clipboard retest, while removing the Storybook `play` interaction from that story and avoiding any automated lock on the new retest documentation file.

## Current state

- [`@acme/ui/src/components/editor/editor.stories.tsx`](../../../@acme/ui/src/components/editor/editor.stories.tsx) exposes a dedicated `Playground` story that renders `PlaygroundDemo`.
- That story also includes a `play` function that runs an interaction check against the block picker.
- [`@acme/ui/playwright/editor-notion-clipboard.spec.mjs`](../../../@acme/ui/playwright/editor-notion-clipboard.spec.mjs) depends on the `components-editor--playground` story URL as the Storybook retest surface.
- [`@acme/ui/src/components/editor/editor.story-structure.test.ts`](../../../@acme/ui/src/components/editor/editor.story-structure.test.ts) already protects the existence of the dedicated `Playground` story.
- [`@acme/ui/STORYBOOK_NOTION_CLIPBOARD_RETEST.md`](../../../@acme/ui/STORYBOOK_NOTION_CLIPBOARD_RETEST.md) documents how to run the retest flow.

## Decision

1. Keep the dedicated `Playground` story.
2. Remove the `play` function from `Playground` so the story becomes a neutral retest/demo surface.
3. Do not add an automated test that locks the existence of `STORYBOOK_NOTION_CLIPBOARD_RETEST.md`.
4. Keep the existing structure test that protects the dedicated `Playground` story entry point.

## Rationale

### Why remove `play`

The `Playground` story now serves as an operational surface for the clipboard retest, not just an interaction demo. Keeping Storybook interaction assertions attached to that story adds side effects and mixes two concerns:

- stable retest target
- interactive Storybook validation

Removing `play` keeps the story predictable for Playwright and simpler for future maintenance.

### Why not lock the doc file with a test

The retest command, config, and Playwright spec are the real contracts of the workflow. The markdown file is supporting documentation. Locking the documentation file with a structure test would create noisy failures for a non-runtime artifact without improving product behavior.

## Scope

### In scope

- Edit [`@acme/ui/src/components/editor/editor.stories.tsx`](../../../@acme/ui/src/components/editor/editor.stories.tsx)
- Remove the `play` block from the `Playground` story
- Remove any `storybook/test` imports that become unused after that cleanup
- Leave the existing `Playground` structure coverage in place
- Make no changes to the retest markdown file or its automated coverage

### Out of scope

- Moving the removed interaction check into a new story or separate test
- Changing the Storybook story id used by the clipboard retest
- Adding documentation existence tests
- Changing the clipboard Playwright retest workflow itself

## Implementation shape

### Storybook story

`Playground` should remain a minimal dedicated story with this shape:

```tsx
export const Playground: Story = {
  render: () => <PlaygroundDemo />,
};
```

### Test posture

- Keep the current structure test that ensures the dedicated `Playground` story exists.
- Do not add a new test for `STORYBOOK_NOTION_CLIPBOARD_RETEST.md`.
- No new interaction coverage is required as part of this change.

## Architecture and behavior impact

- No runtime editor behavior changes
- No clipboard serialization changes
- No Storybook route changes
- No package command changes
- No data flow changes
- No new error handling paths

This is a small maintenance change that narrows the Storybook story responsibility without changing editor functionality.

## Verification plan

After implementation, verify:

1. [`@acme/ui/src/components/editor/editor.stories.tsx`](../../../@acme/ui/src/components/editor/editor.stories.tsx) keeps the dedicated `Playground` story, no longer contains the removed `play` block, and no longer imports unused Storybook interaction helpers.
2. [`@acme/ui/src/components/editor/editor.story-structure.test.ts`](../../../@acme/ui/src/components/editor/editor.story-structure.test.ts) still matches the dedicated story shape we want to preserve. Removal of `play` is verified by direct source inspection, not by adding a new lock.
3. The clipboard retest still targets the same story URL in [`@acme/ui/playwright/editor-notion-clipboard.spec.mjs`](../../../@acme/ui/playwright/editor-notion-clipboard.spec.mjs).

## Risks

The main risk is accidentally changing the dedicated story shape or story id while removing `play`. Keeping the story entry itself unchanged avoids that.

## Recommended next step

Write a short implementation plan for the single-file story cleanup, then apply the edit and run the focused verification for the story structure test.