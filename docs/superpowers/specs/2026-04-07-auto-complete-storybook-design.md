# AutoComplete Storybook Design

## Goal
Bring `packages/ui/src/components/auto-complete` up to the same Storybook documentation standard as `button`, with a complete docs surface made of colocated stories, MDX docs, live example source files, and regression tests that keep the docs/story structure intact.

## Scope
Add the following for `AutoComplete`:
- `auto-complete.stories.tsx` with a default playground story and visual stories for each major behavior cluster.
- `auto-complete.mdx` with feature overview, examples section, and API reference.
- `examples/*.tsx` source examples for each documented use case.
- `examples/*.mdx` partials that render live source via `ComponentSource`, matching the button docs pattern.
- Regression tests that verify the docs/stories stay wired to the example files.

## Required example coverage
Create separate example files so the structure mirrors button as closely as practical:
- Basic usage
- Combobox mode
- Input mode
- Allow clear
- Disabled state
- Loading state
- Custom option label / option render
- Search and filter behavior
- Dropdown customization

## Story structure
`auto-complete.stories.tsx` should:
1. Export Storybook metadata for `AutoComplete` under `Components/AutoComplete`.
2. Provide controls for the user-facing props that make sense in a playground (`mode`, `size`, `disabled`, `loading`, `allowClear`).
3. Include a default story for quick manual exploration.
4. Include visual stories that reuse the shared `examples/*.tsx` demo components, matching the button pattern.
5. Include a small number of interaction stories with `play` functions for important behaviors such as selecting an option, clearing a value, and typing/filtering in input mode.

## Docs structure
`auto-complete.mdx` should:
1. Import every example partial from `examples/*.mdx`.
2. Introduce the component and clarify the distinction between `combobox` mode and `input` mode.
3. Assemble the `## Examples` section from the imported MDX partials.
4. Include an `## API Reference` table for the main public props exposed by `AutoComplete`.
5. Keep the docs focused on current component behavior without expanding scope into unrelated refactors.

## Test strategy
Follow TDD for the new Storybook/docs surface:
1. Add a story structure regression test that fails until the stories import and reuse the expected example components.
2. Add a docs wiring regression test that fails until the MDX file imports the example partials and the partials point to the correct `examples/*.tsx` sources.
3. Implement the docs/stories/examples only after the tests are in place and observed failing.
4. Run targeted `@acme/ui` Storybook Vitest commands to verify the new tests pass.

## Non-goals
- Do not change `AutoComplete` runtime behavior unless a missing story/test uncovers a blocking defect.
- Do not refactor unrelated `select`, `command`, `input`, or `popover` internals.
- Do not introduce a different Storybook organization model from the one already used by `button`.

## Verification
Use targeted Storybook Vitest runs in `packages/ui` to verify:
- the new docs/stories structure tests pass,
- the interaction stories behave as expected,
- and the added docs/examples compile cleanly within the existing Storybook setup.
