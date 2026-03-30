# Editor Playground output formatting design

## Goal

Make the Playground output panel easier to read by pretty-formatting JSON and HTML output in the panel itself, while preserving the underlying editor payloads and preventing content loss when switching formats.

## Current state

- [`@acme/ui/src/components/editor/demo/playground.tsx`](../../../@acme/ui/src/components/editor/demo/playground.tsx) renders the live output panel with a raw `<pre>` of `activeValue`.
- JSON presets are stored as pretty strings, but user-edited JSON output can still become hard to scan because the panel just mirrors the current raw value.
- HTML mode already labels the panel as `Cleaned HTML Output`, but the panel still prints the cleaned HTML as one raw string.
- The Playground keeps separate values per format in local React state, and the story swaps active tabs between `json`, `markdown`, and `html`.
- Preset application intentionally bumps a format-specific reset key so the editor remounts for that preset.

## Decision

1. Pretty-format JSON and HTML only in the output panel.
2. Keep the editor payloads untouched; formatting is display-only.
3. Preserve the current per-format content when switching tabs.
4. Keep preset-driven remount behavior unchanged.

## Rationale

### Why format only in the panel

The request is about readability in the Storybook Playground, not about changing the editor's serialization contract. Formatting in the panel improves inspection without mutating what the editor emits.

### Why include HTML too

The same readability problem exists for the cleaned HTML preview. Showing block structure and indentation in the panel makes the output much easier to inspect when comparing editor changes.

### Why keep tab switching non-destructive

The Playground is a comparison tool. Switching between formats should let the user inspect each sandbox without losing draft content. Preset clicks are the only place where a deliberate reset is useful.

## Scope

### In scope

- Edit [`@acme/ui/src/components/editor/demo/playground.tsx`](../../../@acme/ui/src/components/editor/demo/playground.tsx)
- Pretty-format JSON output for display in the output panel
- Pretty-format cleaned HTML output for display in the output panel
- Preserve existing content when switching between format tabs
- Update or add focused Playground tests in [`@acme/ui/src/components/editor/demo/playground.test.tsx`](../../../@acme/ui/src/components/editor/demo/playground.test.tsx)

### Out of scope

- Changing editor serialization in [`@acme/ui/src/components/editor/editor.tsx`](../../../@acme/ui/src/components/editor/editor.tsx)
- Changing markdown output formatting rules
- Adding a raw/pretty toggle
- Changing preset content or preset labels
- Changing preset-triggered remount behavior

## Implementation shape

### Output formatting helpers

Add small display-only helpers near the Playground component:

- `formatJsonOutput(value: string): string`
  - attempt `JSON.parse`
  - if parsing succeeds, return `JSON.stringify(parsed, null, 2)`
  - if parsing fails, return the raw string unchanged

- `formatHtmlOutput(value: string): string`
  - parse with `DOMParser`
  - add readability-oriented whitespace only, such as line breaks around block boundaries and stable indentation for nested block elements
  - do not intentionally change the displayed HTML semantics, attributes, or element structure beyond parser normalization that is unavoidable for rendering a formatted preview
  - if formatting fails, return the raw string unchanged

### Output panel rendering

Compute a display value from `activeFormat` and `activeValue`.

- `json` → render formatted JSON
- `html` → render formatted HTML
- `markdown` → render raw value unchanged

The `<pre aria-label="Serialized output">` continues to be the panel surface, but it renders the computed display value instead of the raw `activeValue`.

### Format switching behavior

Keep the current `values` state map per format. Switching tabs should continue to change only `activeFormat`.

Do not add any reset behavior when changing tabs. The existing preset path remains the only place that increments `editorResetKeys`.

## Test plan

Update Playground coverage so it proves the intended behavior:

1. JSON output panel renders indented multi-line JSON instead of a single raw line.
2. HTML output panel renders formatted cleaned HTML that is easier to scan.
3. Switching formats preserves each format's existing content rather than resetting it.
4. Preset changes still remount as they do today.

## Risks

- HTML pretty-printing can become too aggressive and accidentally rewrite inline-only output into something misleading.
- Tests that currently check only substring presence may need to assert multi-line formatting carefully without becoming brittle.

The implementation should prefer simple, stable formatting over a fully opinionated pretty printer.

## Recommended next step

Write a focused implementation plan for the Playground-only formatting change, then implement it with tests first so the display behavior and non-reset tab switching are locked down.
