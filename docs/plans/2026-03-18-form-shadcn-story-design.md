# Form Shadcn Story Design

**Goal:** Add a dedicated Storybook story for the shadcn-style form demo so it is browsable as a standard Storybook story, not only through the existing MDX documentation page.

## Recommended approach

Create a new `@acme/ui/src/components/form/form.stories.tsx` file that imports the existing `demo/shadcn.tsx` demo component and exposes it as a `Shadcn` story using Storybook `Meta` and `StoryObj`.

This keeps the implementation DRY by reusing the current demo instead of duplicating form UI in a new story file. It also preserves the existing `form.mdx` docs page while making the shadcn example accessible from the Storybook story index and testable as a normal story.

## Scope

- Add a new Storybook CSF file for the form component area
- Reuse `@acme/ui/src/components/form/demo/shadcn.tsx`
- Keep `@acme/ui/src/components/form/form.mdx` unchanged unless a small metadata adjustment becomes necessary
- Do not add extra variants beyond the requested shadcn story

## Design

### File changes

- **Create:** `@acme/ui/src/components/form/form.stories.tsx`
- **Reuse:** `@acme/ui/src/components/form/demo/shadcn.tsx`
- **Keep as-is:** `@acme/ui/src/components/form/form.mdx`

### Story structure

The new story file should:
- define a `Meta` object with a clear title for the form component section
- register the imported shadcn demo component as the rendered subject
- export a single `Shadcn` story
- set Storybook parameters only if needed for presentation, such as a padded canvas layout

### Why this design

- **No duplication:** the story renders the existing demo component
- **Low risk:** the current docs flow remains intact
- **Discoverability:** users can access the form demo directly from the Storybook sidebar
- **Future-friendly:** more form stories can be added later in the same CSF file if needed

## Alternatives considered

1. **Docs-only approach**
   - Keep relying on `form.mdx`
   - Rejected because the user explicitly wants a Storybook story

2. **Add multiple stories now**
   - Could include `Basic` and `Shadcn`
   - Rejected because it expands scope beyond the request

3. **Copy the demo into a story file**
   - Rejected because it duplicates UI and increases maintenance burden

## Verification

After implementation, verify by:
- running Storybook-targeted checks if available in this package
- confirming the new story is discovered by Storybook
- ensuring the shadcn form renders without changing the existing MDX docs page
