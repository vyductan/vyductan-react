# CodeBlock Story Design

**Goal:** Add a Storybook story for the existing `CodeBlock` component in `@acme/ui` that matches the style and organization used by other component stories, especially `button.stories.tsx`.

## Scope

- Add a colocated story file at `@acme/ui/src/components/code-block/code-block.stories.tsx`
- Showcase the current public API only:
  - `language`
  - `children`
- Do not change the `CodeBlock` component implementation
- Do not add interaction tests in this pass

## Recommended approach

Use a mixed Storybook setup:
- one `Playground` story with controls for `language` and `children`
- several preset stories to demonstrate common rendering cases

This is the best fit because it matches the existing component-story pattern used in `button.stories.tsx`, gives a useful interactive surface for manual testing, and still provides quick visual examples for common languages.

## Story structure

The story file should:
- use `Meta` and `StoryObj` from `@storybook/nextjs-vite`
- register under `title: "Components/CodeBlock"`
- set `component: CodeBlock`
- expose controls for:
  - `language` as a select control with a small curated list such as `typescript`, `bash`, `json`, `text`
  - `children` as a text control
- define a default render area suitable for wide code snippets

## Proposed stories

1. `Playground`
   - interactive args for `language` and `children`
   - primary story for trying different snippets quickly

2. `TypeScript`
   - demonstrates syntax highlighting with a realistic TS snippet

3. `Shell`
   - demonstrates command-line formatting

4. `PlainTextFallback`
   - uses `text` to show non-highlighted/plain content behavior

## Testing strategy

No new automated interaction test is required for this request.
Manual validation is sufficient:
- open Storybook
- verify each preset renders
- verify the playground updates when `language` and `children` change
- verify the story layout remains readable for multiline code

## Notes

- Keep the implementation minimal and consistent with nearby component stories
- Prefer colocated sample strings in the story file instead of creating extra demo files unless clearly needed
