# Button Ant Design-lite shared examples Design

**Goal:** Refactor Button docs and stories so visual examples share a single source of truth, following an Ant Design-lite pattern where each example has a `.tsx` demo file and a paired `.md` docs fragment.

## Scope

Visual example sections to refactor:
- Basic Usage
- Color & Variant
- Different Sizes
- Danger Button
- Disabled State
- Loading State
- Icon Button
- Button with Icon

Out of scope:
- Link as Button
- Form Integration
- Migration from Ant Design
- interaction stories/play functions
- API table

## Architecture

Each visual Button example will have a pair of files under `@acme/ui/src/components/button/demo/`:
- `<name>.tsx` — the React demo component used by both docs and stories
- `<name>.md` — the docs fragment for that example

`button.mdx` becomes a page assembler:
- imports each demo component from `demo/*.tsx`
- imports each docs fragment from `demo/*.md`
- renders the docs fragment content for the section
- renders the live preview via `ComponentSource`

`button.stories.tsx` reuses the same `demo/*.tsx` components for visual stories where appropriate, while leaving interaction-focused stories independent.

## Import strategy for `.md`

Preferred design is to import `.md` content directly into `button.mdx`.

Implementation should use the smallest viable mechanism supported by the current Storybook/Vite setup. If plain `.md` imports are not supported by the current pipeline, add the minimal loader/config needed for raw markdown imports instead of abandoning the structure.

## File layout target

Under `@acme/ui/src/components/button/demo/`:
- basic.tsx / basic.md
- color-variant.tsx / color-variant.md
- sizes.tsx / sizes.md
- danger.tsx / danger.md
- disabled.tsx / disabled.md
- loading.tsx / loading.md
- icon.tsx / icon.md
- with-icon.tsx / with-icon.md

## Story reuse strategy

Refactor only the visual stories that map cleanly to docs examples to reuse the demo `.tsx` files. Keep story-only behavior such as args/play tests separate.

Likely reuse targets:
- Sizes
- WithIcon
- IconOnly
- Loading
- Disabled
- possibly Default/Primary if they map cleanly to existing demos

Do not force reuse for stories whose purpose is controls, interaction tests, or arg-driven behavior.

## Risks

1. `.md` import support in Storybook MDX may need minimal Vite configuration.
2. Over-coupling docs page structure to story shape must be avoided.
3. The docs regression test may need to assert the new import/assembly pattern instead of only checking inline MDX content.

## Verification

- `pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts`
- `pnpm -F @acme/ui typecheck`
- Manual Storybook verification at `http://localhost:6006/?path=/docs/components-button--docs`
- Confirm imported markdown text renders in the expected sections
- Confirm live demo blocks still render for all visual sections
- Confirm Link as Button and Form Integration remain code-only sections

## Success criteria

- Visual Button examples are defined once in `demo/*.tsx`
- Per-example docs text lives in `demo/*.md`
- `button.mdx` composes the page from imported `.md` and `.tsx`
- visual stories reuse the shared demo components where appropriate
- tests and typecheck pass
- Storybook docs page renders correctly
