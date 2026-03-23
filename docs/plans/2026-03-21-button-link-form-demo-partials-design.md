# Button Link/Form demo partials Design

**Goal:** Move `Link as Button` and `Form Integration` into the same live-demo MDX partial pattern used by the other Button visual examples.

## Scope

In scope:
- keep `@acme/ui/src/components/button/button.mdx` as the Button docs page root
- convert `Link as Button` from an inline code block into a live demo backed by `demo/link-as-button.tsx` and `demo/link-as-button.mdx`
- convert `Form Integration` from an inline code block into a live demo backed by `demo/form-integration.tsx` and `demo/form-integration.mdx`
- update the Button docs regression test to assert these two new partials are assembled like the rest of the examples
- preserve the existing Button docs content outside these two sections

Out of scope:
- changing the other Button demo partials beyond what is needed for consistency
- refactoring Button stories unless a regression forces it
- redesigning the content or API reference sections

## Current state

`@acme/ui/src/components/button/button.mdx` now uses `demo/*.mdx` partials for the main visual example sections, but `Link as Button` and `Form Integration` are still inline code fences in the parent docs page.

That leaves the page with two different example patterns:
- live demo partials for visual sections
- raw code blocks for these two sections

The user wants these two sections converted too.

## Options considered

### Option 1: MDX partial + demo TSX for both sections
Create one `.tsx` demo and one `.mdx` partial per section, then import them into `button.mdx` like the other examples.

Pros:
- one consistent docs assembly pattern
- live previews for both sections
- future story reuse remains possible
- keeps `button.mdx` as an assembler-only docs root

Cons:
- adds four files

### Option 2: Demo TSX files but inline docs assembly in `button.mdx`
Create `.tsx` demos, but keep headings/prose/`ComponentSource` in the parent file.

Pros:
- fewer files than Option 1

Cons:
- reintroduces mixed docs structure
- makes `button.mdx` less consistent with the new partial architecture

### Option 3: Keep code blocks and just extract snippets to files
Pros:
- smallest change

Cons:
- no live preview
- does not match the new direction the user approved

## Recommendation

Use Option 1.

Both sections should become first-class visual examples, just like the others. `button.mdx` should stay a thin composer that imports partials in order and renders them under `## Examples`.

## File layout target

Under `@acme/ui/src/components/button/demo/` add:
- `link-as-button.tsx`
- `link-as-button.mdx`
- `form-integration.tsx`
- `form-integration.mdx`

Then update `@acme/ui/src/components/button/button.mdx` to import and render:
- `LinkAsButtonExample`
- `FormIntegrationExample`

## Partial structure

Each new partial should match the existing Button example pattern:

```mdx
import { ComponentSource } from "@acme/ui/components/mdx";
import LinkAsButtonDemo from "./link-as-button";

### Link as Button

Use the `asChild` prop when you want a semantic link that keeps Button styling.

<ComponentSource src="button/demo/link-as-button.tsx" __comp__={LinkAsButtonDemo} />
```

`form-integration.mdx` should use the same structure, with a short sentence explaining the integration.

## Demo implementation notes

### `link-as-button.tsx`
- should use `Button asChild`
- should use `next/link` default import
- should render a simple, realistic navigation example such as a login link

### `form-integration.tsx`
- should use `Form`, `FormItem`, `useForm`, `Input`, and `Button`
- should mirror the current inline example closely
- should stay minimal and self-contained
- should keep the submit example simple; no extra behaviors beyond what the current docs already show

## Testing impact

`@acme/ui/src/components/button/button.docs-config.test.ts` should expand its inventory so these two sections are validated like the other partial-backed examples.

It should verify:
- `button.mdx` imports both new partials
- `button.mdx` renders both new partial components
- each new partial contains its heading and `ComponentSource`
- each new partial points at the correct `demo/*.tsx` source

`button.story-structure.test.ts` should not need changes unless story reuse is introduced for these two new demos.

## Risks

1. `next/link` import shape must stay correct in the live demo.
2. The form example may require the same component imports as the existing inline snippet; drifting from that could introduce unnecessary typecheck issues.
3. If the docs test inventory is not updated, these two sections could fall out of the common pattern again later.

## Verification

Automated:
- `pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts src/components/button/button.story-structure.test.ts`
- `pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui typecheck`

Manual Storybook:
- `http://localhost:6008/?path=/docs/components-button--docs`

Confirm:
- `Link as Button` renders as a live demo section
- `Form Integration` renders as a live demo section
- both sections follow the same partial-backed pattern as the other examples
- Button props table still renders correctly

## Success criteria

- `button.mdx` remains the docs page root
- `Link as Button` and `Form Integration` are no longer inline code blocks
- both sections are backed by `demo/*.tsx` + `demo/*.mdx`
- docs test covers both new sections
- focused tests and typecheck pass
