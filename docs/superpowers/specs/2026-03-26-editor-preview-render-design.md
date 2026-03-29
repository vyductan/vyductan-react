# EditorPreview and EditorRender design

## Goal

Introduce a clear split between authoring, internal preview, and publish rendering for the rich text editor, with Lexical JSON as the canonical content format and a shared semantic style contract across surfaces.

## Current state

- [`@acme/ui/src/components/editor/editor.tsx`](../../../@acme/ui/src/components/editor/editor.tsx) already supports read-only rendering through `editable={false}`.
- [`@acme/ui/src/components/editor/plugins/plugins.tsx`](../../../@acme/ui/src/components/editor/plugins/plugins.tsx) already disables many editor-only behaviors when `editable` is false, so the current editor can act as a basic internal read-only surface.
- [`@acme/ui/src/components/editor/themes/editor-theme.ts`](../../../@acme/ui/src/components/editor/themes/editor-theme.ts) currently mixes semantic content styling with editor/runtime-specific styling concerns.
- Rendered output outside the editor does not yet have a dedicated renderer built directly from canonical Lexical JSON.
- The desired direction is to stop treating the publish surface as a typography-plugin problem and instead treat it as a first-class rendering surface with its own contract.

## Decision

1. Use **Lexical JSON** as the canonical source of truth for editor content.
2. Keep `Editor` as the full **authoring surface**.
3. Add `EditorPreview` as a **thin wrapper** over `Editor editable={false}` for internal read-only and preview flows.
4. Add `EditorRender` as a **dedicated publish renderer** that renders from Lexical JSON without depending on the full editor runtime.
5. Make `EditorRender` safe for SSR and publish surfaces by avoiding browser-only editor runtime APIs.
6. Extract a **shared semantic rich-text style contract** from the current theme so `EditorPreview` and `EditorRender` stay visually aligned without sharing the same runtime implementation.
7. Keep editor-only interaction concerns and publish-only concerns separate from the shared semantic content layer.

## Rationale

### Why Lexical JSON is canonical

Lexical JSON is the format that best preserves the editor's real document structure. It is better suited than markdown or HTML for internal storage because it retains block semantics, editor-specific structure, and future extensibility without forcing lossy round-trips.

Using a single canonical JSON format also keeps the three surfaces aligned:

- `Editor` authors the document
- `EditorPreview` reads the same document internally
- `EditorRender` publishes the same document externally

### Why `EditorPreview` should stay thin

`EditorPreview` is not a separate rendering system. Its job is to reuse the current editor stack in read-only mode for internal product surfaces where fidelity to authoring behavior matters more than minimizing runtime cost.

That keeps internal preview behavior close to the real editor and avoids inventing a second internal rendering path.

### Why `EditorRender` should be separate

Publish rendering has different priorities from authoring:

- lower runtime overhead
- stable HTML structure
- easier SEO/SSR integration
- tighter control over supported output
- no editor chrome or interaction logic

A dedicated `EditorRender` keeps these concerns explicit instead of leaking authoring runtime into blog/article output.

### Why the style contract should be shared but not the runtime

The preview surface and publish surface should look like the same content model, but they should not be forced to share the same implementation stack.

What should be shared:

- canonical JSON
- semantic block meaning
- shared rich-text class names/tokens

What should not be shared:

- full Lexical runtime implementation
- authoring plugins
- editor-only interaction styles
- publish-only wrappers and rendering constraints

This mirrors the best-practice split seen in systems like Notion: shared block semantics with separate authoring chrome and publish rendering behavior.

## Scope

### In scope

- Define responsibilities for `Editor`, `EditorPreview`, and `EditorRender`
- Define Lexical JSON as the canonical content format for these surfaces
- Define the shared semantic style contract
- Define the rendering boundary between preview and publish surfaces
- Define unsupported-content behavior for publish rendering
- Define the testing posture needed to keep preview and publish behavior aligned

### Out of scope

- Implementing the new components yet
- Replacing or redesigning the editor node model itself
- Adding new content block types unrelated to the preview/render split
- Migrating persisted content formats away from existing data until implementation requires it
- Reworking editor authoring UX beyond what is needed for the surface split

## Surface responsibilities

### `Editor`

`Editor` remains the canonical authoring surface.

Responsibilities:

- full editing experience
- plugin-driven authoring behavior
- toolbar and interaction features
- canonical document emission in Lexical JSON

It continues to own authoring concerns and should not absorb publish-specific rendering logic.

### `EditorPreview`

`EditorPreview` is the internal read-only surface.

Responsibilities:

- wrap `Editor` in a controlled read-only configuration
- render authored content with high fidelity to the editor runtime
- support internal product surfaces such as previews, review flows, and non-editable detail views

`EditorPreview` should stay intentionally thin. It should reuse the current editor stack instead of introducing a second internal rendering pipeline.

### `EditorRender`

`EditorRender` is the dedicated publish/output renderer.

Responsibilities:

- accept canonical Lexical JSON input
- render stable semantic HTML from supported node types
- apply shared rich-text content styles
- avoid full editor runtime dependencies where possible
- omit editor-only chrome and interaction behavior

`EditorRender` is the long-term surface for blog/article/content rendering.

## API and data flow

### Canonical content flow

The recommended flow is:

1. `Editor` creates and updates Lexical JSON
2. internal read-only surfaces use `EditorPreview`
3. publish surfaces use `EditorRender`

No new markdown-first or HTML-first source of truth should be introduced for these surfaces.

### Input contract

`EditorRender` accepts only canonical Lexical JSON, using the repo's existing content shape from [`types.ts`](../../../@acme/ui/src/components/editor/types.ts):

- `value: LexicalEditorContent`
- or `value: string` where the string is a serialized `LexicalEditorContent`

No markdown input, HTML input, or editor-state object input is in scope for `EditorRender`.

If `value` is a string, `EditorRender` owns parsing exactly once at the component boundary. After that normalization step, the renderer works only with `LexicalEditorContent`.

Invalid JSON or invalid Lexical JSON shape must produce deterministic behavior:

- do not attempt lossy recovery from markdown or HTML
- do not partially render unknown top-level payloads
- render `null`
- use the same invalid-input behavior in development and production

`EditorPreview` should consume the same canonical content contract used by the editor's read-only path rather than introducing a separate publish-oriented input model.

### SSR contract

`EditorRender` must be safe to use in server-rendered publish surfaces and must not require browser-only editor runtime APIs.

## Styling architecture

### Shared semantic rich-text layer

Extract the semantic content styling currently embedded inside [`editor-theme.ts`](../../../@acme/ui/src/components/editor/themes/editor-theme.ts) into a shared contract that describes how headings, paragraphs, lists, quotes, links, code blocks, tables, horizontal rules, and checklist content should look.

This shared contract should be a dedicated artifact owned by the editor package, such as a shared class map or token map used by both `EditorPreview` and `EditorRender`.

Rules for the shared contract:

- include only content-facing semantic styles
- exclude editor interaction affordances and editing controls
- be safe to consume from publish rendering without bringing in editor runtime assumptions

Examples that belong in the shared layer:

- heading typography
- paragraph spacing and line-height
- list markers and nesting styles
- quote styling
- inline text formatting
- table content styling
- checklist content appearance

Examples that must remain editor-only:

- resize handles
- drag affordances
- selection/focus chrome
- toolbar-affiliated states
- action buttons inside tables or other blocks
- click-target styling that exists only to support editing

### Editor-only layer

Keep editor/runtime-specific styling separate from the shared content layer.

Examples include:

- interaction affordances
- selection/focus states
- editor container concerns
- toolbar-related or editable-only presentation details

### Render-only layer

Allow `EditorRender` to add lightweight publish-specific wrappers only where needed for stable output, layout integration, or content semantics.

This layer should not pull in editor interaction styling.

## Rendering boundaries

### `EditorPreview`

Use `EditorPreview` for internal product surfaces where runtime fidelity matters more than minimizing implementation weight.

It should preserve the real Lexical node behavior and current read-only semantics, while disabling editing affordances.

### `EditorRender`

Use `EditorRender` for publish-facing or output-facing surfaces where we want a smaller, explicit rendering contract from Lexical JSON.

It should render only the supported publish node set and avoid behaving like a hidden editor.

### Supported publish node set

The first-pass supported publish node set should be explicit.

Guaranteed supported in the initial `EditorRender` scope:

- root
- paragraphs
- headings
- text formatting marks already represented in Lexical text nodes
- links and autolinks
- bulleted and numbered lists
- checklist-style content backed by current checklist/check-block semantics
- quotes
- code blocks and inline code
- horizontal rules
- tables

Explicitly unsupported in the initial publish renderer scope:

- mentions
- hashtags
- keywords
- autocomplete nodes
- page breaks
- table editing affordances
- images
- videos
- file attachments
- equations
- polls
- TOC nodes
- layout container/item nodes
- collapsible container/title/content nodes
- Excalidraw
- Figma
- YouTube
- Twitter
- Instagram
- TikTok

Deferred for follow-up design if product needs them later:

- richer media rendering
- attachment/download presentation
- embed presentation contracts
- layout and collapsible publish semantics

### Unsupported-content policy

Unsupported or editor-only nodes in `EditorRender` must degrade in one consistent place.

Chosen rule:

- fully support the initial publish node set above
- do not carry editor-only chrome into publish output
- drop unsupported nodes entirely from publish output
- if an unsupported node contains supported textual descendants, do not attempt to flatten or salvage them in the first pass

This keeps the initial publish contract deterministic, easy to test, and free of hidden lossy conversion rules.

## Testing strategy

### Shared style contract tests

Add focused coverage to ensure the extracted semantic style mapping remains aligned with the supported block semantics.

### `EditorPreview` tests

Verify that:

- read-only mode renders the same content correctly
- editor-only behaviors remain disabled when `editable={false}`
- internal preview keeps parity with authored document structure where it matters

### `EditorRender` tests

Verify that canonical Lexical JSON renders stable semantic HTML for the supported node set.

Coverage should include representative tricky content such as:

- nested lists
- links
- soft line breaks
- code blocks
- checklist content

### Parity tests

For important fixtures, compare `EditorPreview` and `EditorRender` at the semantic-output level.

Parity for supported content means:

- equivalent block tags for supported nodes
- equivalent text content after normalized whitespace handling
- equivalent list nesting and ordering
- equivalent link destinations
- equivalent checklist checked state
- equivalent table structure for supported table fixtures

The tests do not require identical runtime internals or byte-for-byte identical HTML.

The acceptance oracle should be fixture-driven expected semantic HTML for supported content, not subjective visual comparison. Unsupported-node behavior should have its own fixture coverage proving the node is dropped consistently.

## Risks

- semantic style drift between preview and publish surfaces
- over-coupling `EditorRender` to the editor runtime, which would weaken the point of the split
- under-specifying unsupported-node behavior, which could create inconsistent publish output
- allowing publish-only requirements to leak back into the editor authoring surface

## Recommended next step

Write an implementation plan that introduces the split in this order:

1. extract the shared semantic rich-text style contract
2. add `EditorPreview` as the thin read-only wrapper
3. add `EditorRender` as the dedicated publish renderer from Lexical JSON
4. add regression and parity tests for the supported content set
