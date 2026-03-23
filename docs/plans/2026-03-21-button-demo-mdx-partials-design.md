# Button demo MDX partials Design

**Goal:** Keep `button.mdx` as the Button docs page root while moving each visual example section into its own `demo/*.mdx` partial that contains both prose and `ComponentSource`.

## Scope

In scope:
- keep `@acme/ui/src/components/button/button.mdx` as the docs page root
- replace the current `demo/*.md` prose fragments with `demo/*.mdx` section partials
- each visual example partial should contain:
  - section heading
  - per-example prose
  - `ComponentSource` wired to the matching `demo/*.tsx`
- update docs regression tests to assert the new `.mdx` partial assembly pattern
- verify Storybook docs still render correctly

Recommended in scope for consistency:
- include `Button Types` in the same partial pattern via `demo/types.mdx`

Out of scope:
- changing the visual demo `.tsx` implementations beyond imports needed by partials
- refactoring story reuse further than the work already completed
- changing code-only sections:
  - `Link as Button`
  - `Form Integration`
  - `Migration from Ant Design`

## Current problem

The current implementation imports `demo/*.md` with `?raw` and renders them through `ReactMarkdown` inside `button.mdx`.

That works for prose-only fragments, but it prevents the per-demo files from owning their own `ComponentSource` blocks. Attempting to treat plain `.md` as executable content caused the runtime error `Unexpected identifier 'simplest'`, because plain markdown text is not valid JSX/MDX component code when imported directly as a module body.

## Recommended approach

Use `demo/*.mdx` partials as the unit of composition.

Each partial will:
- import `ComponentSource`
- import the matching demo `.tsx` component
- render its own section heading, prose, and live preview

`button.mdx` will:
- import each section partial from `demo/*.mdx`
- render them in order under `## Examples`
- remain the page-level assembler only

This removes the need for:
- `?raw`
- `ReactMarkdown`
- prose/content assembly logic in `button.mdx`

## File layout target

Under `@acme/ui/src/components/button/demo/`:
- `basic.tsx`
- `basic.mdx`
- `color-variant.tsx`
- `color-variant.mdx`
- `sizes.tsx`
- `sizes.mdx`
- `types.tsx`
- `types.mdx`  ← recommended to eliminate the last special case
- `danger.tsx`
- `danger.mdx`
- `disabled.tsx`
- `disabled.mdx`
- `loading.tsx`
- `loading.mdx`
- `icon.tsx`
- `icon.mdx`
- `with-icon.tsx`
- `with-icon.mdx`

The old `demo/*.md` files should be removed once all imports and tests have migrated.

## Partial structure

Each visual section partial should follow the same pattern:

```mdx
import { ComponentSource } from "@acme/ui/components/mdx";
import BasicDemo from "./basic";

### Basic Usage

The simplest way to use Button with different types.

<ComponentSource src="button/demo/basic.tsx" __comp__={BasicDemo} />
```

This keeps each visual section self-contained and makes the parent docs page responsible only for ordering.

## `button.mdx` structure after refactor

`button.mdx` should keep:
- page title
- intro text
- features list
- `## Examples`
- code-only sections
- API reference
- migration notes

But inside `## Examples`, it should become a simple ordered composition of partials, for example:

```mdx
import BasicSection from "./demo/basic.mdx";
import ColorVariantSection from "./demo/color-variant.mdx";
// ...

## Examples

<BasicSection />
<ColorVariantSection />
<SizesSection />
<TypesSection />
```

## Testing impact

The docs regression test should change from asserting:
- `.md` imports
- `?raw`
- `ReactMarkdown`

To asserting:
- `button.mdx` imports the expected `demo/*.mdx` partials
- `button.mdx` renders the expected section components
- `button.mdx` no longer relies on raw markdown rendering for these visual examples

The story reuse test can stay focused on story/demo reuse and should not need major changes.

## Risks

1. If `Button Types` remains outside the partial pattern, the docs page will still have one notable special case.
2. MDX partial imports can become noisy if naming is inconsistent.
3. Regressions are more likely if tests continue checking old raw-markdown assumptions after the migration.

## Recommendation

Migrate all visual example sections, including `Button Types`, into `demo/*.mdx` partials so the docs page has one consistent assembly pattern.

## Verification

Automated:
- `pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts src/components/button/button.story-structure.test.ts`
- `pnpm -F @acme/ui typecheck`

Manual Storybook:
- `http://localhost:6008/?path=/docs/components-button--docs`

Confirm:
- every visual section renders from its own partial
- live previews still render
- code-only sections remain code-only
- Button props table still renders as a table

## Success criteria

- `button.mdx` stays the page root
- visual sections move into `demo/*.mdx` partials
- each partial owns its own heading, prose, and `ComponentSource`
- raw markdown import/rendering is removed from `button.mdx`
- docs tests and typecheck pass
- Storybook docs page renders correctly
