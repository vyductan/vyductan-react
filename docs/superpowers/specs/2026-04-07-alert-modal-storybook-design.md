# AlertModal Storybook Design

## Goal
Add a colocated `alert-modal.stories.tsx` Storybook surface for `AlertModal` and remove the current `examples/*`-driven Storybook pattern from both `alert-modal` and `button`, so stories read as the primary component contract instead of a thin index over demo files.

## Scope
This work covers two related Storybook cleanups inside `packages/ui/src/components`:
- Add `alert-modal.stories.tsx` under `alert-modal/`.
- Stop using `examples/*` imports inside `button.stories.tsx`.
- Keep Storybook content story-centric: stories should be defined inline in the story files instead of delegating to example components.
- Avoid adding any Storybook section framed as `Examples`.

## AlertModal story structure
`alert-modal.stories.tsx` should:
1. Export Storybook metadata for `AlertModal` under `Components/AlertModal`.
2. Include a default interactive story for the base confirm flow.
3. Include focused visual stories for the major semantic states: `Confirm`, `Danger`, `Warning`, `Info`, `Success`, and `Error`.
4. Include a controlled/open story so the dialog is visible immediately for visual review.
5. Expose controls only for props that are useful in Storybook exploration, such as `title`, `description`, `okText`, `cancelText`, `type`, `okType`, `confirmLoading`, and `open` where appropriate.
6. Keep each story self-contained in the story file instead of importing demo components from `examples/`.

## Button story cleanup
`button.stories.tsx` should be refactored so that stories currently backed by `examples/*` are rendered inline in the story file.

This applies to the current demo-driven stories such as:
- sizes
- with icon
- icon only
- loading
- disabled

The goal is not to redesign the `Button` stories, only to remove the extra `examples/` indirection so the file reads as a complete Storybook contract in one place.

## Docs and MDX
`alert-modal.mdx` may remain in place for docs content, but the Storybook navigation and primary review surface should come from `.stories.tsx`, not from `examples/*` content.

No new `examples/*.tsx` files should be added for this work.

Existing `alert-modal/examples/*` files may remain temporarily if they are still referenced by MDX, but they are out of scope unless removing them becomes trivial and does not expand the change.

## Testing strategy
Follow TDD for the Storybook surface changes:
1. Add or update targeted tests that lock the intended story structure where practical.
2. Verify the new `AlertModal` story file is discoverable by Storybook.
3. Run targeted Storybook/Vitest verification for `AlertModal` and `Button` after the refactor.
4. If interaction coverage is cheap to add, include one small interaction story for `AlertModal` confirm behavior; do not expand into broad behavioral test work.

## Non-goals
- Do not redesign `AlertModal` runtime behavior beyond the already identified `okType` fix.
- Do not refactor unrelated Storybook files outside `button` and `alert-modal`.
- Do not force removal of MDX docs if they are still useful.
- Do not create a new docs architecture for the whole component library.

## Verification
Use targeted `@acme/ui` Storybook/Vitest checks to confirm:
- `alert-modal.stories.tsx` loads correctly,
- `button.stories.tsx` no longer depends on `examples/*`,
- and the updated stories render the intended visual states without introducing Storybook regressions.
