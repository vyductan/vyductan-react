# EditorPreview and EditorRender markdown/html support design

## Goal

Allow `EditorPreview` and `EditorRender` to accept markdown and HTML input in addition to Lexical JSON, while keeping Lexical JSON as the canonical internal representation and preserving the current publish-rendering boundary.

## Relationship to the existing preview/render split

This design extends the existing preview/render split defined in [`2026-03-26-editor-preview-render-design.md`](./2026-03-26-editor-preview-render-design.md).

What stays the same:

- `Editor` remains the authoring surface
- `EditorPreview` remains the internal read-only runtime surface
- `EditorRender` remains the dedicated publish/output renderer
- Lexical JSON remains the canonical internal content model
- the supported publish node set remains constrained by the existing normalization boundary
- the shared semantic rich-text contract remains the source of publish styling

What changes:

- `EditorPreview` should no longer be JSON-only
- `EditorRender` should no longer be input-format-limited to Lexical JSON strings/objects
- markdown and HTML should be accepted as convenience inputs at the component boundary and normalized into Lexical JSON before rendering

## Current state

- [`@acme/ui/src/components/editor/editor.tsx`](../../../@acme/ui/src/components/editor/editor.tsx) already supports `json`, `markdown`, and `html` modes.
- [`@acme/ui/src/components/editor/editor-preview.tsx`](../../../@acme/ui/src/components/editor/editor-preview.tsx) is currently a thin wrapper that forces `editable={false}` and `format="json"`.
- [`@acme/ui/src/components/editor/editor-render.tsx`](../../../@acme/ui/src/components/editor/editor-render.tsx) currently accepts only Lexical JSON content, either as an object or as a serialized JSON string.
- [`@acme/ui/src/components/editor/render/normalize-editor-content.ts`](../../../@acme/ui/src/components/editor/render/normalize-editor-content.ts) is the current canonical publish boundary. It validates the supported node set and returns `null` for invalid or unsupported content.
- [`@acme/ui/src/components/editor/utils/lexical-converter.ts`](../../../@acme/ui/src/components/editor/utils/lexical-converter.ts) already provides markdown-to-Lexical conversion helpers.
- [`@acme/ui/src/components/editor/plugins/html-plugins.tsx`](../../../@acme/ui/src/components/editor/plugins/html-plugins.tsx) already contains HTML-to-Lexical import behavior, but it is implemented in a client/runtime plugin path and currently relies on browser `DOMParser`.
- [`@acme/ui/src/components/editor/editor.tsx`](../../../@acme/ui/src/components/editor/editor.tsx) loads markdown and HTML plugin paths with `dynamic(..., { ssr: false })`, so the current `Editor` and `EditorPreview` markdown/HTML path is explicitly client/runtime-oriented rather than SSR-safe.

## Decision

1. Extend `EditorPreview` so it accepts `format?: "json" | "markdown" | "html"`.
2. Extend `EditorRender` so it accepts `format?: "json" | "markdown" | "html"`.
3. Keep Lexical JSON as the canonical internal format for `EditorRender`. Markdown and HTML are convenience inputs, not new source-of-truth formats.
4. Normalize every `EditorRender` input path into Lexical JSON before reusing the existing `normalizeEditorContent()` and `renderRootNodes()` pipeline.
5. Keep the supported publish node set unchanged. Converted markdown/HTML must still pass the existing publish boundary.
6. Do not auto-detect format from the input value. The caller must provide the intended format whenever the value is not Lexical JSON.
7. Do not add unsafe raw HTML output paths or any alternate publish renderer for markdown/HTML.

## API contract

### `EditorPreview`

`EditorPreview` should remain a thin wrapper over `Editor`, but it should expose the input format explicitly.

Proposed contract:

- `value?: string`
- `defaultValue?: string`
- `format?: "json" | "markdown" | "html"` with default `"json"`
- `editable` remains unavailable to callers and is always forced to `false`
- `onChange` remains unavailable to callers

Behavior:

- `format="json"` keeps the current behavior
- `format="markdown"` reuses the existing markdown mode of `Editor`
- `format="html"` reuses the existing HTML mode of `Editor`
- `EditorPreview` should not add its own conversion logic or fallback behavior; it should simply pass the format through while keeping the surface read-only
- `EditorPreview` remains a client/runtime surface and does not gain SSR guarantees from this change

### `EditorRender`

Proposed contract:

- `value: string | LexicalEditorContent`
- `format?: "json" | "markdown" | "html"`
- `className?: string`

Rules:

- object input is valid only for `json`
- string input is valid for all three formats
- if `format` is omitted, treat the input as `json`
- callers must not rely on auto-detection of markdown or HTML

Behavior:

- `format="json"`
  - object input: validate and render
  - string input: parse as serialized Lexical JSON, validate, render
- `format="markdown"`
  - string input only
  - convert markdown to Lexical JSON
  - run the result through the existing publish boundary
  - render semantically if supported; otherwise return `null`
- `format="html"`
  - string input only
  - convert HTML to Lexical JSON
  - run the result through the existing publish boundary
  - render semantically if supported; otherwise return `null`

Invalid usage:

- `LexicalEditorContent` object with `format="markdown"` or `format="html"` is invalid and should return `null`
- malformed JSON for `format="json"` should return `null`
- conversion failures or post-conversion boundary rejection for markdown/HTML should return `null`

## Canonical data flow

### `EditorPreview`

`EditorPreview` remains a runtime/read-only surface:

1. caller provides `value` and `format`
2. `EditorPreview` forwards the format into `Editor`
3. `Editor` continues to own markdown/html runtime parsing exactly as it does today
4. `EditorPreview` forces read-only behavior and does not emit authoring changes

### `EditorRender`

`EditorRender` should keep one render pipeline for all formats:

1. caller provides `value` and `format`
2. input is converted to Lexical JSON exactly once at the component boundary
3. the resulting Lexical JSON goes through `normalizeEditorContent()`
4. the normalized content is rendered through `renderRootNodes()`
5. if any step fails, `EditorRender` returns `null`

This keeps publish rendering centralized around the existing semantic renderer instead of creating separate markdown and HTML rendering paths.

## Conversion architecture

### Markdown path

Reuse the existing markdown conversion utility in [`lexical-converter.ts`](../../../@acme/ui/src/components/editor/utils/lexical-converter.ts).

The current `markdownToLexicalContent()` helper already creates a temporary Lexical editor and produces serialized Lexical JSON, but today it falls back to an empty root on conversion errors. `EditorRender` should not consume that helper directly. Instead, it should use a stricter boundary helper that can distinguish:

- valid empty markdown content
- successful markdown conversion with content
- actual conversion failure

Only the first two cases should proceed into the existing publish boundary. Actual conversion failure should map to `null`.

Important rule:

- do not let markdown become a parallel canonical representation inside `EditorRender`
- markdown is only an input format that normalizes into Lexical JSON

### HTML path

Add a dedicated HTML-to-Lexical conversion helper instead of embedding HTML parsing logic inside `EditorRender`.

This helper should extract only the HTML-to-Lexical import logic that currently lives in [`html-plugins.tsx`](../../../@acme/ui/src/components/editor/plugins/html-plugins.tsx) into a reusable utility layer. It should not reuse the plugin itself or pull plugin lifecycle assumptions into `EditorRender`.

Requirements for the HTML helper:

- accept an HTML string
- create a DOM document suitable for Lexical HTML import
- create a temporary Lexical editor with the existing editor node set
- convert the DOM into Lexical nodes using the existing Lexical HTML import utilities
- return serialized Lexical JSON for boundary validation

### SSR-safe DOM creation

`EditorRender` must remain safe for SSR and must not rely on browser-only `DOMParser`.

The HTML conversion helper should therefore isolate DOM creation behind a small adapter:

- browser/client path: use native `DOMParser`
- server path: use a server-safe DOM implementation such as `jsdom`

`EditorRender(format="html")` is intended to work in both server and client environments. The server-safe DOM dependency must stay behind the conversion utility boundary and must not leak into the client bundle for ordinary render usage.

Rules:

- do not put direct browser-only DOM assumptions inside `EditorRender`
- do not couple `render-node.tsx` to HTML parsing
- keep server/client DOM creation inside the conversion helper boundary
- avoid pulling editor runtime concerns into the publish renderer itself
- keep any server-only DOM dependency isolated so this change does not turn the shared render surface into a browser-only or server-only API

## Rendering and boundary rules

The existing publish boundary remains the canonical gate for supported output.

That means:

- markdown or HTML that converts into supported Lexical JSON should render
- markdown or HTML that converts into unsupported nodes should be rejected by the existing boundary and return `null`
- markdown or HTML source syntax that gets flattened, dropped, or normalized away during import is not guaranteed to surface as an explicit boundary rejection later
- boundary rejection applies to the post-conversion Lexical payload, not to every unsupported source-format construct uniformly
- this change must not broaden the publish node set by accident
- this change must not weaken the current invalid-input behavior for `EditorRender`

## Error handling

### `EditorPreview`

`EditorPreview` should follow the behavior of the existing `Editor` mode it wraps.

Rules:

- no custom preview-only fallback behavior
- no preview-specific format coercion
- no new error-recovery layer inside `EditorPreview`

### `EditorRender`

Rules:

- no raw HTML fallback
- no unsafe HTML injection path
- no plain-text fallback when markdown or HTML conversion fails
- no format auto-detection
- no partial rendering of invalid top-level payloads

Return `null` when:

- `format="json"` receives malformed JSON or an unsupported Lexical JSON shape
- `format="markdown"` or `format="html"` receives an invalid input for its declared contract
- markdown/HTML conversion throws or fails to produce a valid boundary-safe Lexical JSON payload
- declared format and value shape conflict (for example, object input with `format="html"`)

## Testing posture

### `EditorPreview` tests

Add focused tests that verify:

- `EditorPreview` still forces read-only behavior
- `format="json"` still renders authored JSON content
- `format="markdown"` renders markdown content through the existing runtime path
- `format="html"` renders HTML content through the existing runtime path
- `EditorPreview` still exports from the package entrypoint

### `EditorRender` tests

Add focused tests that verify:

- `json` input still behaves as it does today
- `markdown` input renders supported content semantically
- `html` input renders supported content semantically
- invalid usage returns `null`
- object input with non-JSON format returns `null`
- unsupported content created through markdown/HTML conversion is rejected by the existing boundary

### Cross-format consistency tests

Add semantic consistency tests for equivalent content across formats:

- the same paragraph content expressed as JSON, markdown, and HTML should render equivalent semantic output
- the same heading/list/link/checklist/code/table semantics should stay aligned where the existing converters support them
- tests should remain semantic, not byte-for-byte DOM identity tests

### First-pass source feature matrix

The first-pass implementation and tests should be explicit about what source-format support is expected rather than promising universal parity.

Markdown input expected to be covered in the first pass:

- paragraphs
- heading levels already covered by the current markdown transformers
- bulleted and numbered lists, including nested lists where the existing markdown pipeline already supports them
- checklist syntax backed by the current custom check-block transformer
- links that survive markdown import as supported link nodes
- inline code formatting
- tables via the existing markdown table transformer
- horizontal rules

Markdown input not guaranteed in the first pass:

- full autolink parity from raw source text
- every multiline/code-fence behavior if the current markdown transformer stack does not import it into the supported publish node set
- unsupported custom nodes such as images, mentions, equations, or other editor-specific extensions

HTML input expected to be covered in the first pass:

- paragraphs
- headings
- links
- lists, including nested lists that survive Lexical HTML import
- checklist-like content only where the HTML import path produces the existing supported checklist/check-block semantics
- inline code and code blocks where the Lexical HTML import path maps them into supported code nodes
- tables
- blockquotes
- horizontal rules

HTML input not guaranteed in the first pass:

- autolink-specific semantics beyond ordinary imported link nodes
- arbitrary embedded/editor-specific elements
- unsupported custom nodes such as images, mentions, equations, or other editor-only extensions
- source HTML constructs that import lossy or flatten into generic text/paragraph content

### SSR-safety coverage

Add focused coverage around the HTML conversion helper so `EditorRender` HTML support does not regress into browser-only behavior.

The goal is not to test every DOM implementation detail, but to ensure the server path does not depend on `window.DOMParser` being available.

## Non-goals

- changing the existing supported publish node set
- adding new publish-only node types
- introducing markdown-first or HTML-first canonical storage
- rendering raw HTML directly
- redesigning the semantic rich-text contract
- redesigning Storybook surfaces as part of this change

## Implementation notes

- Prefer a small boundary helper for `EditorRender` input normalization rather than spreading format branching across the component body.
- Prefer reusing existing conversion utilities and node registrations over inventing alternate parsing stacks.
- Keep `EditorPreview` thin.
- Keep `EditorRender` explicit, SSR-safe, and constrained by the existing publish boundary.

## Summary

The cleanest extension is to let both `EditorPreview` and `EditorRender` accept `json`, `markdown`, and `html`, while keeping Lexical JSON as the canonical internal representation.

`EditorPreview` should stay a thin read-only wrapper over `Editor`.

`EditorRender` should accept multiple input formats only at its boundary, normalize them into Lexical JSON exactly once, and then reuse the existing publish validation and semantic rendering pipeline. This preserves the original preview/render split while making the two components easier to use in Storybook and product code.