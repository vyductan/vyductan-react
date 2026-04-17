# Colorful Tag design

## Summary

Extend `@acme/ui`'s `Tag` component to support a broader, Ant Design–influenced color/variant API that can be reused by future `Tag` examples, while preserving the current shadcn update workflow (`pnpm dlx shadcn@latest add --all --overwrite`). The implementation should avoid refactoring shadcn-owned primitives like `src/shadcn/badge.tsx` into shared internal infrastructure, because those files are intentionally overwriteable.

This work also adds a new Storybook example/story for a "Colorful Tag" showcase covering preset colors and custom hex colors across the new visual variants.

## Goals

- Add AntD-like `Tag` variants for reusable colorful tags.
- Keep `src/shadcn/badge.tsx` close to upstream shadcn code.
- Preserve existing local workflow that overwrites shadcn components during updates.
- Add a Storybook-visible "Colorful Tag" example showing:
  - preset named colors
  - custom hex colors
  - all supported colorful variants
- Keep existing `Tag` use cases working during the transition.

## Non-goals

- Refactor shadcn `Badge` internals into a shared cross-component variant system.
- Introduce a patch script for shadcn updates.
- Fully clone Ant Design `Tag` behavior beyond the colorful variant API required here.
- Generalize this into a global token/theming redesign.

## Constraints

- The repository intentionally uses `pnpm dlx shadcn@latest add --all --overwrite` for shadcn refreshes.
- Because of that workflow, `src/shadcn/badge.tsx` should remain vendor-like and should not become a source of shared local business logic.
- The new behavior should live primarily in `src/components/tag/tag.tsx` and related local Storybook/example files.
- Use existing `@acme/ui` component/story conventions where possible.

## Existing context

### Current `Badge`

`src/shadcn/badge.tsx` already includes shadcn-style variants including `link`. This file is treated as an upstream-owned primitive and should remain easy to overwrite.

### Current `Tag`

`src/components/tag/tag.tsx` already wraps `Badge`, applies its own `cva`-driven variant/color logic, and supports:

- local semantic colors such as `default`, `primary`, `success`, `processing`, `error`, `warning`
- a few explicit color names such as `green`, `blue`, `orange`, etc.
- custom hex colors via inline `backgroundColor` / `borderColor`
- local variants such as `default`, `secondary`, `destructive`, `outline`, `solid`

The current API does not match the desired AntD-like example shape.

## Proposed approach

### Decision

Keep `Badge` upstream-like and extend `Tag` locally.

This is the preferred design because it preserves the current shadcn overwrite workflow without introducing patching or merge-specific maintenance. `Tag` will continue to be the project-owned abstraction layer where AntD-like behavior is implemented.

### Alternatives considered

#### 1. Shared badge variant config between `Badge` and `Tag`

Rejected for now. Although this would reduce duplication, it would require turning shadcn-owned files into shared local infrastructure. That conflicts with the overwrite-all workflow and creates a fragile maintenance boundary.

#### 2. Import `badgeVariants` directly into `Tag`

Rejected. `badgeVariants` is a `cva` instance from a vendor-like implementation file and is not a clean extension point for the richer AntD-like `Tag` API.

#### 3. Patch shadcn files after each update

Rejected for this task. It adds workflow complexity and is unnecessary given the user's explicit preference to keep the overwrite-all approach.

## API design

### Variant model

Add AntD-like colorful variants to `Tag`:

- `filled`
- `solid`
- `outlined`

### Compatibility model

Preserve existing `Tag` variant behavior for current consumers during this change instead of doing a breaking cleanup. The component can temporarily support both:

- existing variants already used in the codebase
- new AntD-like colorful variants for the new example and future usage

The exact internal mapping can be implementation-defined, but the user-facing goal is:

- colorful demos use `filled | solid | outlined`
- existing consumers do not break

### Color model

Use Tailwind color families as the named preset model for colorful `Tag` styling instead of introducing an AntD-specific preset list.

The public `color` prop for the new colorful API should follow Tailwind-friendly color names, using a curated set that fits the design system and the example well. The exact set can be finalized during implementation, but should come from Tailwind color families such as:

- `red`
- `orange`
- `amber`
- `lime`
- `green`
- `cyan`
- `blue`
- `indigo`
- `purple`
- `pink`
- `rose`

Retain support for custom hex colors such as:

- `#f50`
- `#2db7f5`
- `#87d068`
- `#108ee9`

The "Colorful Tag" example should showcase the Tailwind-based preset colors plus custom hex colors across the supported variants.

### Styling intent

#### `solid`

- strong colored background
- matching border
- light/white text

#### `filled`

- soft tinted background
- low-emphasis or transparent border depending on current styling pattern
- darker readable text matching the hue family

#### `outlined`

- subtle or neutral background
- clearly colored border
- darker readable text matching the hue family

### Custom hex colors

Support custom hex colors for the new variants as follows:

#### `solid`

- inline `backgroundColor` and `borderColor` use the provided hex value
- text defaults to white for readability

#### `filled`

- preserve the provided hex value as the primary hue source
- implementation may use inline style and/or utility classes to create a softer appearance while keeping text readable
- if exact tint generation is cumbersome within current constraints, a pragmatic readable fallback is acceptable as long as the example remains visually coherent and the behavior is explicit in code

#### `outlined`

- preserve the provided hex value as border/text emphasis
- implementation may use a light background fallback when needed
- prioritize readability and consistency over perfect tokenized color derivation

## Component structure

### Files likely to change

- `src/components/tag/tag.tsx`
- new or updated files under `src/components/tag/` for Storybook/examples
- tests related to tag stories/docs/config if the component's documentation structure requires them

### Story/example shape

Add a new "Colorful Tag" showcase to Storybook that demonstrates:

1. preset colors for each new colorful variant
2. custom hex colors for each new colorful variant

The display should mirror the intended example structure:

- a section for each variant
- a subsection or grouping for presets
- a subsection or grouping for custom colors

The Storybook implementation does not need to reproduce Ant Design's exact component imports. It should use local `@acme/ui` exports and existing story conventions.

## Data flow and behavior

1. `Tag` receives a `variant` and `color` prop.
2. If `color` is a named preset, `Tag` maps it to local classes for the selected colorful variant.
3. If `color` is a hex value, `Tag` applies inline color styling and any required readability adjustments based on the selected variant.
4. `Tag` still renders through the shared `Badge` primitive, but the colorful behavior is owned entirely by `Tag`.
5. Storybook renders grouped examples that exercise the new mappings.

## Error handling and edge cases

- Unknown color strings should continue to degrade gracefully rather than crash rendering.
- Existing non-colorful variants should keep their current behavior.
- Hex colors should remain supported even if a fully tokenized tint system is not introduced.
- Readability takes precedence over exact visual parity with Ant Design for custom hex handling.

## Testing strategy

Follow TDD during implementation.

### Tests to add or update first

1. A test proving the new colorful variants are recognized and rendered.
2. A test proving named preset colors map correctly for the new colorful API.
3. A test proving custom hex colors still render with the expected styling signals.
4. If there is an existing story/documentation structure test pattern for this component category, add or update the relevant coverage so the new Storybook example is exercised by the current docs/story conventions.

### Verification during implementation

- Run focused `@acme/ui` tests first.
- Run any relevant Storybook-related or docs-config tests for the touched files.
- Verify the example in Storybook manually before calling the task complete.

## Rollout notes

This change is intentionally additive. It expands `Tag` toward a broader AntD-influenced API without forcing an immediate breaking migration of existing consumers.

A later cleanup can decide whether to deprecate older `Tag` variants once the broader API settles and adoption is visible in the codebase.

## Open decisions resolved in this spec

- Do not create shared variant infrastructure inside shadcn-owned files.
- Do not rely on patching after `shadcn add --all --overwrite`.
- Implement AntD-like colorful behavior inside local `Tag` code.
- Add Storybook-visible "Colorful Tag" coverage as part of the same task.
