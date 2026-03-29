# EditorPreview and EditorRender Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce `EditorPreview` and `EditorRender` with Lexical JSON as the canonical content format, a shared semantic rich-text style contract, and explicit publish-rendering behavior for the supported node set.

**Architecture:** Keep `Editor` as the authoring surface, add `EditorPreview` as a thin read-only wrapper around the existing editor runtime, and add `EditorRender` as a dedicated SSR-safe publish renderer that renders directly from canonical Lexical JSON instead of mounting Lexical. Extract the content-facing style contract out of the current editor theme so preview and publish surfaces stay visually aligned while editor-only interaction styling stays isolated.

**Tech Stack:** React, TypeScript, Lexical JSON, Testing Library, Vitest unit tests, pnpm

---

## File Structure

### Existing files to modify
- `@acme/ui/src/components/editor/editor.tsx`
  - Reuse as the base authoring surface and reference point for the preview wrapper.
  - Inspect for prop reuse only; keep behavior changes minimal and only if required by the wrapper extraction.
- `@acme/ui/src/components/editor/index.ts`
  - Export `EditorPreview`, `EditorRender`, and any intentionally public shared render types.
- `@acme/ui/src/components/editor/themes/editor-theme.ts`
  - Stop treating this file as the only styling source.
  - Refactor it to consume the extracted shared semantic contract plus any remaining editor-only theme pieces.
- `@acme/ui/src/components/editor/themes/editor-theme.css`
  - Separate publish-safe content styling from editor-only selectors tied to `.ContentEditable__root [data-lexical-editor="true"]` or interactive affordances.
- `@acme/ui/src/components/editor/types.ts`
  - Expand the serialized content types only as much as needed to support the first-pass publish node set and renderer helpers.

### Files to create
- `@acme/ui/src/components/editor/editor-preview.tsx`
  - Thin wrapper around `Editor` with `editable={false}` locked.
- `@acme/ui/src/components/editor/editor-preview.test.tsx`
  - Focused behavioral tests for read-only preview behavior.
- `@acme/ui/src/components/editor/editor-render.tsx`
  - Dedicated publish renderer from canonical Lexical JSON.
- `@acme/ui/src/components/editor/editor-render.test.tsx`
  - Supported-node rendering tests plus invalid-input and unsupported-node coverage.
- `@acme/ui/src/components/editor/editor-preview-render-parity.test.tsx`
  - Fixture-driven parity tests between `EditorPreview` and `EditorRender` for supported content.
- `@acme/ui/src/components/editor/themes/rich-text-semantic-contract.ts`
  - Shared content-facing class/token map for headings, paragraphs, lists, quotes, links, code, tables, horizontal rules, and check-block content.
- `@acme/ui/src/components/editor/themes/rich-text-semantic-contract.test.ts`
  - Focused contract-shape regression coverage.
- `@acme/ui/src/components/editor/render/normalize-editor-content.ts`
  - Normalize `string | LexicalEditorContent` into canonical `LexicalEditorContent` once at the renderer boundary.
- `@acme/ui/src/components/editor/render/render-node.tsx`
  - Pure node-type switch for the supported publish node set.
- `@acme/ui/src/components/editor/render/render-types.ts`
  - Narrower serialized node helper types or type guards for the supported renderer surface.
- `@acme/ui/src/components/editor/render/render-fixtures.ts`
  - Reusable Lexical JSON fixtures for supported, unsupported, and invalid-input cases.

### Existing files to inspect during implementation
- `docs/superpowers/specs/2026-03-26-editor-preview-render-design.md`
  - Approved source of truth for scope and behavior.
- `@acme/ui/src/components/editor/nodes/nodes.ts`
  - Canonical inventory of editor node types.
- `@acme/ui/src/components/editor/nodes/check-block-node.tsx`
  - Source of custom `check-block` serialized shape and checked-state semantics.
- `@acme/ui/src/components/editor/plugins/toolbar/block-format/format-check-list.tsx`
  - Confirms the existing Lexical checklist path is part of the current product surface.
- `@acme/ui/src/components/editor/plugins/plugins.tsx`
  - Source of current editable vs read-only runtime behavior reused by `EditorPreview`, including `CheckListPlugin`.
- `@acme/ui/src/components/editor/editor.stories.tsx`
  - Optional reference for current editor story conventions if adding stories later becomes necessary.
- `@acme/ui/package.json`
  - Source of the package-local test command.
- `@acme/ui/vitest.config.ts`
  - Confirms the package supports focused `unit` tests in jsdom.

### Existing files that must remain unchanged unless a failing test proves otherwise
- `@acme/ui/src/components/editor/plugins/markdown-plugins.tsx`
- `@acme/ui/src/components/editor/plugins/html-plugins.tsx`
- `@acme/ui/src/components/editor/plugins/markdown-paste-plugin.tsx`
- `@acme/ui/src/components/editor/demo/playground.tsx`

This feature is about preview/render surface separation, not markdown/html editor mode changes, paste behavior changes, or Storybook Playground changes.

---

## Constraints

- Use **Lexical JSON** as the only canonical content format for `EditorPreview` and `EditorRender`.
- `EditorPreview` must stay a thin wrapper over the existing `Editor` runtime.
- `EditorRender` must be **SSR-safe** and must **not** depend on browser-only editor runtime APIs.
- `EditorRender` must accept only:
  - `value: LexicalEditorContent`
  - or `value: string` where the string is serialized `LexicalEditorContent`
- Invalid JSON or invalid Lexical JSON shape must:
  - not attempt lossy recovery
  - not partially render unknown payloads
  - render `null`
  - behave the same in development and production
- Initial supported publish node set is limited to:
  - root
  - paragraphs
  - headings
  - text formatting marks represented in serialized text nodes
  - links and autolinks
  - bulleted and numbered lists
  - checklist-style content backed by both the current Lexical checklist/list-item semantics and the custom `check-block` semantics
  - quotes
  - code blocks and inline code
  - horizontal rules
  - tables
- Initial unsupported node policy is fixed:
  - drop unsupported nodes entirely
  - do not flatten or salvage textual descendants from unsupported nodes
- Do **not** broaden the first pass to images, videos, embeds, attachments, equations, layout, collapsibles, polls, TOC, or social embeds.
- Keep editor-only affordances out of the shared semantic style contract.
- Do **not** replace or redesign the authoring editor API as part of this work.

---

### Task 1: Extract the shared semantic rich-text style contract

**Files:**
- Create: `@acme/ui/src/components/editor/themes/rich-text-semantic-contract.ts`
- Create: `@acme/ui/src/components/editor/themes/rich-text-semantic-contract.test.ts`
- Modify: `@acme/ui/src/components/editor/themes/editor-theme.ts`
- Modify: `@acme/ui/src/components/editor/themes/editor-theme.css`
- Inspect: `docs/superpowers/specs/2026-03-26-editor-preview-render-design.md`
- Inspect: `@acme/ui/src/components/editor/themes/editor-theme.ts`
- Inspect: `@acme/ui/src/components/editor/themes/editor-theme.css`
- Test: `@acme/ui/src/components/editor/themes/rich-text-semantic-contract.test.ts`

- [ ] **Step 1: Re-read the approved spec and current theme files before writing tests**

Read:
- `docs/superpowers/specs/2026-03-26-editor-preview-render-design.md`
- `@acme/ui/src/components/editor/themes/editor-theme.ts`
- `@acme/ui/src/components/editor/themes/editor-theme.css`

Expected findings:
- semantic content styling and editor-only interaction styling are mixed today
- headings, paragraphs, quotes, lists, links, code, tables, horizontal rules, and check-block content already have styling sources
- editor-only affordances such as table action buttons, resizers, focus rings, drag-over states, and hover chrome must stay out of the shared contract

- [ ] **Step 2: Write the failing semantic-contract tests first**

Create `@acme/ui/src/components/editor/themes/rich-text-semantic-contract.test.ts` with focused shape assertions for the extracted shared contract.

Cover at least these rules:
- the contract exports entries for headings, paragraphs, quotes, lists, links, inline text marks, code blocks, tables, horizontal rules, and check-block content
- the contract does **not** export editor-only affordance keys such as table cell action buttons, resizers, or embed focus styling
- the contract can be imported without depending on `.ContentEditable__root [data-lexical-editor="true"]` selectors or browser-only logic

Suggested shape:

```ts
import { describe, expect, test } from "vitest";

import { richTextSemanticContract } from "./rich-text-semantic-contract";

describe("richTextSemanticContract", () => {
  test("contains the publish-safe semantic keys", () => {
    expect(richTextSemanticContract.heading.h1).toBeTypeOf("string");
    expect(richTextSemanticContract.paragraph).toBeTypeOf("string");
    expect(richTextSemanticContract.list.ul).toBeTypeOf("string");
    expect(richTextSemanticContract.quote).toBeTypeOf("string");
    expect(richTextSemanticContract.text.code).toBeTypeOf("string");
    expect(richTextSemanticContract.table.cell).toBeTypeOf("string");
    expect(richTextSemanticContract.hr).toBeTypeOf("string");
    expect(richTextSemanticContract.checkBlock.root).toBeTypeOf("string");
  });

  test("does not expose editor-only affordance keys", () => {
    expect("tableCellActionButton" in richTextSemanticContract).toBe(false);
    expect("tableCellResizer" in richTextSemanticContract).toBe(false);
    expect("embedBlock" in richTextSemanticContract).toBe(false);
  });
});
```

- [ ] **Step 3: Run the focused test to verify it fails first**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/editor/themes/rich-text-semantic-contract.test.ts
```

Expected before implementation:
- FAIL because `rich-text-semantic-contract.ts` does not exist yet

- [ ] **Step 4: Implement the minimal shared contract extraction**

Create `@acme/ui/src/components/editor/themes/rich-text-semantic-contract.ts` as a publish-safe content-facing class map.

Include only the semantic content layer, with a structure close to this:

```ts
export const richTextSemanticContract = {
  heading: {
    h1: "...",
    h2: "...",
    h3: "...",
    h4: "...",
    h5: "...",
    h6: "...",
  },
  paragraph: "...",
  quote: "...",
  link: "...",
  list: {
    ul: "...",
    ol: "...",
    listitem: "...",
    nested: { listitem: "..." },
    checklist: "...",
  },
  text: {
    bold: "...",
    italic: "...",
    underline: "...",
    strikethrough: "...",
    code: "...",
    subscript: "...",
    superscript: "...",
  },
  codeBlock: "...",
  codeHighlight: {
    comment: "...",
    string: "...",
    keyword: "...",
    // include only what the current code theme uses
  },
  table: {
    root: "...",
    cell: "...",
    headerCell: "...",
    rowStriping: "...",
  },
  hr: "...",
  checkBlock: {
    root: "...",
    checked: "...",
    icon: "...",
  },
} as const;
```

Then refactor `editor-theme.ts` so it consumes this extracted contract for the content-facing keys and keeps editor-only keys local to the editor theme.

In `editor-theme.css`, separate or preserve only the CSS needed by content-facing classes used by the shared contract. Do **not** carry `.ContentEditable__root [data-lexical-editor="true"] ...` selectors into any publish-facing artifact.

- [ ] **Step 5: Re-read the edited files before rerunning tests**

Read:
- `@acme/ui/src/components/editor/themes/rich-text-semantic-contract.ts`
- `@acme/ui/src/components/editor/themes/editor-theme.ts`
- `@acme/ui/src/components/editor/themes/editor-theme.css`

Confirm:
- content-facing styles live in the shared contract
- editor-only affordance keys remain outside the shared contract
- `editorTheme` still provides the existing keys required by the Lexical editor runtime

- [ ] **Step 6: Run the focused test to verify it passes**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/editor/themes/rich-text-semantic-contract.test.ts
```

Expected after implementation:
- PASS

- [ ] **Step 7: Optional commit only if the user explicitly requests one**

If the user explicitly asks for a commit, stage only the files changed for this task:

```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add @acme/ui/src/components/editor/themes/rich-text-semantic-contract.ts @acme/ui/src/components/editor/themes/rich-text-semantic-contract.test.ts @acme/ui/src/components/editor/themes/editor-theme.ts @acme/ui/src/components/editor/themes/editor-theme.css
```

---

### Task 2: Add `EditorPreview` as the thin read-only wrapper

**Files:**
- Create: `@acme/ui/src/components/editor/editor-preview.tsx`
- Create: `@acme/ui/src/components/editor/editor-preview.test.tsx`
- Modify: `@acme/ui/src/components/editor/index.ts`
- Inspect: `docs/superpowers/specs/2026-03-26-editor-preview-render-design.md`
- Inspect: `@acme/ui/src/components/editor/editor.tsx`
- Inspect: `@acme/ui/src/components/editor/plugins/plugins.tsx`
- Test: `@acme/ui/src/components/editor/editor-preview.test.tsx`

- [ ] **Step 1: Re-read the spec and the current editor before writing tests**

Read:
- `docs/superpowers/specs/2026-03-26-editor-preview-render-design.md`
- `@acme/ui/src/components/editor/editor.tsx`
- `@acme/ui/src/components/editor/plugins/plugins.tsx`

Expected findings:
- `Editor` already accepts `editable?: boolean`
- many editor-only behaviors are already gated behind `editable`
- `EditorPreview` should be a thin wrapper, not a separate rendering system

- [ ] **Step 2: Write the failing `EditorPreview` tests first**

Create `@acme/ui/src/components/editor/editor-preview.test.tsx` with focused behavior assertions.

Cover at least:
- it renders authored JSON content through the existing editor runtime
- it does not render the editable placeholder when content is empty and the wrapper is read-only
- its public prop surface does not expose `editable`, `format`, or `onChange`

Suggested shape:

```tsx
import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { EditorPreview } from "./editor-preview";

Object.assign(globalThis, { React });

afterEach(() => {
  cleanup();
});

describe("EditorPreview", () => {
  test("renders authored json content in read-only mode", async () => {
    render(
      <EditorPreview
        value={JSON.stringify({
          root: {
            type: "root",
            format: "",
            indent: 0,
            direction: "ltr",
            version: 1,
            children: [
              {
                type: "paragraph",
                format: "",
                indent: 0,
                direction: "ltr",
                version: 1,
                children: [
                  {
                    type: "text",
                    version: 1,
                    text: "Preview text",
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                  },
                ],
              },
            ],
          },
        })}
      />,
    );

    expect(await screen.findByText("Preview text")).toBeVisible();
  });

  test("does not show the authoring placeholder in read-only mode", () => {
    render(<EditorPreview placeholder="Write here..." value="" />);

    expect(screen.queryByText("Write here...")).toBeNull();
  });
});
```

- [ ] **Step 3: Run the focused test to verify it fails first**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/editor/editor-preview.test.tsx
```

Expected before implementation:
- FAIL because `editor-preview.tsx` does not exist yet

- [ ] **Step 4: Implement the thinnest possible wrapper**

Create `@acme/ui/src/components/editor/editor-preview.tsx` as a thin wrapper around `Editor`.

Use a prop shape that reuses the current JSON-mode editor contract and removes write-only concerns where possible.

Suggested structure:

```tsx
import type { EditorProps } from "./editor";
import { Editor } from "./editor";

type EditorPreviewProps = Omit<Extract<EditorProps, { format?: "json" }>, "format" | "editable" | "onChange">;

export function EditorPreview(props: EditorPreviewProps) {
  return <Editor {...props} format="json" editable={false} autoFocus={false} />;
}
```

Keep it intentionally narrow:
- no separate Lexical setup
- no publish rendering logic
- no prop inventions beyond what the current editor already supports

Then export it from `@acme/ui/src/components/editor/index.ts`.

- [ ] **Step 5: Re-read the new wrapper and export file**

Read:
- `@acme/ui/src/components/editor/editor-preview.tsx`
- `@acme/ui/src/components/editor/index.ts`

Confirm:
- `EditorPreview` is a thin wrapper over `Editor`
- `format="json"` and `editable={false}` are fixed
- there is no separate runtime or duplicated setup code

- [ ] **Step 6: Run the focused test to verify it passes**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/editor/editor-preview.test.tsx
```

Expected after implementation:
- PASS

- [ ] **Step 7: Optional commit only if the user explicitly requests one**

If the user explicitly asks for a commit, stage only the files changed for this task:

```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add @acme/ui/src/components/editor/editor-preview.tsx @acme/ui/src/components/editor/editor-preview.test.tsx @acme/ui/src/components/editor/index.ts
```

---

### Task 3: Add the canonical renderer boundary and fixture set for `EditorRender`

**Files:**
- Create: `@acme/ui/src/components/editor/render/normalize-editor-content.ts`
- Create: `@acme/ui/src/components/editor/render/normalize-editor-content.test.ts`
- Create: `@acme/ui/src/components/editor/render/render-types.ts`
- Create: `@acme/ui/src/components/editor/render/render-fixtures.ts`
- Inspect: `docs/superpowers/specs/2026-03-26-editor-preview-render-design.md`
- Inspect: `@acme/ui/src/components/editor/types.ts`
- Inspect: `@acme/ui/src/components/editor/nodes/nodes.ts`
- Inspect: `@acme/ui/src/components/editor/nodes/check-block-node.tsx`
- Inspect: `@acme/ui/src/components/editor/plugins/toolbar/block-format/format-check-list.tsx`
- Test: `@acme/ui/src/components/editor/render/normalize-editor-content.test.ts`

- [ ] **Step 1: Re-read the spec and serialized-type sources before writing tests**

Read:
- `docs/superpowers/specs/2026-03-26-editor-preview-render-design.md`
- `@acme/ui/src/components/editor/types.ts`
- `@acme/ui/src/components/editor/nodes/nodes.ts`
- `@acme/ui/src/components/editor/nodes/check-block-node.tsx`

Expected reminders:
- `EditorRender` accepts only `LexicalEditorContent | string`
- invalid payloads render `null`
- unsupported nodes are dropped entirely
- `check-block` is in the supported publish set and uses a serialized `checked` boolean

- [ ] **Step 2: Write the failing normalization-boundary tests first**

Create `@acme/ui/src/components/editor/render/normalize-editor-content.test.ts` to cover just the renderer boundary before any React rendering exists.

Cover at least:
- parsed object input is accepted
- serialized string input is parsed once and accepted
- invalid JSON string returns `null`
- invalid Lexical shape returns `null`

Suggested shape:

```ts
import { describe, expect, test } from "vitest";

import { normalizeEditorContent } from "./normalize-editor-content";
import {
  invalidJsonString,
  invalidShapeDocument,
  simpleParagraphDocument,
} from "./render-fixtures";

describe("normalizeEditorContent", () => {
  test("accepts a canonical lexical object payload", () => {
    expect(normalizeEditorContent(simpleParagraphDocument)).toEqual(
      simpleParagraphDocument,
    );
  });

  test("parses a canonical lexical json string payload", () => {
    expect(
      normalizeEditorContent(JSON.stringify(simpleParagraphDocument)),
    ).toEqual(simpleParagraphDocument);
  });

  test("returns null for invalid json", () => {
    expect(normalizeEditorContent(invalidJsonString)).toBeNull();
  });

  test("returns null for invalid lexical shape", () => {
    expect(normalizeEditorContent(invalidShapeDocument)).toBeNull();
  });
});
```

- [ ] **Step 3: Run the focused test to verify it fails first**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/editor/render/normalize-editor-content.test.ts
```

Expected before implementation:
- FAIL because `normalize-editor-content.ts` and its fixtures do not exist yet

- [ ] **Step 4: Implement the normalization boundary and fixture helpers**

Create `@acme/ui/src/components/editor/render/normalize-editor-content.ts` with one boundary function:

```ts
import type { LexicalEditorContent } from "../types";

export function normalizeEditorContent(
  value: string | LexicalEditorContent,
): LexicalEditorContent | null {
  if (typeof value !== "string") {
    return isLexicalEditorContent(value) ? value : null;
  }

  try {
    const parsed = JSON.parse(value);
    return isLexicalEditorContent(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
```

Create `render-types.ts` with narrow runtime guards for the first-pass supported node shapes instead of trying to fully model the entire editor schema.

Create `render-fixtures.ts` with reusable fixtures covering:
- simple paragraph
- headings
- nested lists
- Lexical checklist list items produced by the current checklist path
- custom `check-block`
- quote
- inline code / code block
- horizontal rule
- table
- unsupported node document such as `page-break`
- invalid JSON string
- invalid Lexical shape payload

Do **not** implement browser-only logic in these helpers.

- [ ] **Step 5: Re-read the new renderer-boundary helpers**

Read:
- `@acme/ui/src/components/editor/render/normalize-editor-content.ts`
- `@acme/ui/src/components/editor/render/render-types.ts`
- `@acme/ui/src/components/editor/render/render-fixtures.ts`

Confirm:
- normalization happens exactly once at the boundary
- invalid payloads return `null`
- there is no lossy markdown/html recovery
- the fixtures match the approved supported/unsupported node policy

- [ ] **Step 6: Run the focused normalization-boundary test to verify it passes**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/editor/render/normalize-editor-content.test.ts
```

Expected after implementation:
- PASS

- [ ] **Step 7: Re-read the final boundary helpers for task completion**

Read:
- `@acme/ui/src/components/editor/render/normalize-editor-content.ts`
- `@acme/ui/src/components/editor/render/normalize-editor-content.test.ts`
- `@acme/ui/src/components/editor/render/render-types.ts`
- `@acme/ui/src/components/editor/render/render-fixtures.ts`

Confirm:
- the boundary task is complete and independently executable before Task 4 begins
- fixtures now cover both Lexical checklist semantics and custom `check-block` semantics
- no React renderer logic leaked into the boundary module

---

### Task 4: Implement `EditorRender` for the supported publish node set

**Files:**
- Create: `@acme/ui/src/components/editor/editor-render.tsx`
- Create: `@acme/ui/src/components/editor/render/render-node.tsx`
- Modify: `@acme/ui/src/components/editor/editor-render.test.tsx`
- Modify: `@acme/ui/src/components/editor/index.ts`
- Inspect: `docs/superpowers/specs/2026-03-26-editor-preview-render-design.md`
- Inspect: `@acme/ui/src/components/editor/render/normalize-editor-content.ts`
- Inspect: `@acme/ui/src/components/editor/render/render-types.ts`
- Inspect: `@acme/ui/src/components/editor/themes/rich-text-semantic-contract.ts`
- Test: `@acme/ui/src/components/editor/editor-render.test.tsx`

- [ ] **Step 1: Re-read the spec, boundary helpers, and contract before editing**

Read:
- `docs/superpowers/specs/2026-03-26-editor-preview-render-design.md`
- `@acme/ui/src/components/editor/render/normalize-editor-content.ts`
- `@acme/ui/src/components/editor/render/render-types.ts`
- `@acme/ui/src/components/editor/themes/rich-text-semantic-contract.ts`

Expected reminders:
- only the initial supported publish node set is in scope
- unsupported nodes must be dropped entirely
- invalid input must render `null`
- rendering must be SSR-safe and browser-independent

- [ ] **Step 2: Extend the failing renderer tests for the full supported node set**

Add failing tests to `@acme/ui/src/components/editor/editor-render.test.tsx` for the approved supported fixtures.

Cover at least:
- paragraphs
- headings
- links
- nested lists
- Lexical checklist list-item semantics
- custom `check-block` checked state
- quote
- inline code and code block
- horizontal rule
- basic table structure

Suggested assertions:

```tsx
test("renders nested list structure", () => {
  const { container } = render(<EditorRender value={nestedListDocument} />);

  const ul = container.querySelector("ul");
  expect(ul).not.toBeNull();
  expect(ul?.querySelector("ul")).not.toBeNull();
});

test("renders check-block checked state semantically", () => {
  render(<EditorRender value={checkedCheckBlockDocument} />);

  const checkbox = screen.getByRole("checkbox");
  expect(checkbox).toBeChecked();
});

test("renders code block content", () => {
  const { container } = render(<EditorRender value={codeBlockDocument} />);

  expect(container.querySelector("pre code")?.textContent).toContain("const x = 1");
});
```

- [ ] **Step 3: Run the focused test to verify it fails first**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/editor/editor-render.test.tsx
```

Expected before implementation:
- FAIL because the renderer does not yet support the full node set

- [ ] **Step 4: Implement the renderer with one explicit node-type switch**

Create `@acme/ui/src/components/editor/render/render-node.tsx` as a pure rendering switch that maps supported serialized nodes to semantic React output.

Implement only the approved first-pass node set.

Use this shape:

```tsx
import type { ReactNode } from "react";

import type {
  SupportedElementNode,
  SupportedTextNode,
  SupportedNode,
} from "./render-types";
import { richTextSemanticContract } from "../themes/rich-text-semantic-contract";

export function renderNode(node: SupportedNode, key: string): ReactNode {
  switch (node.type) {
    case "paragraph":
      return <p key={key} className={richTextSemanticContract.paragraph}>...</p>;
    case "heading":
      return <h1 key={key} className={...}>...</h1>;
    case "quote":
      return <blockquote key={key} className={...}>...</blockquote>;
    case "list":
      return <ul key={key} className={...}>...</ul>;
    case "listitem":
      return <li key={key} className={...}>...</li>;
    case "check-block":
      return ...;
    case "link":
    case "autolink":
      return ...;
    case "code":
      return ...;
    case "horizontalrule":
      return <hr key={key} className={...} />;
    case "table":
    case "tablerow":
    case "tablecell":
      return ...;
    case "text":
      return ...;
    default:
      return null;
  }
}
```

Then create `@acme/ui/src/components/editor/editor-render.tsx` as the small SSR-safe boundary component:

```tsx
import type { LexicalEditorContent } from "./types";
import { normalizeEditorContent } from "./render/normalize-editor-content";
import { renderNode } from "./render/render-node";

type EditorRenderProps = {
  value: string | LexicalEditorContent;
  className?: string;
};

export function EditorRender({ value, className }: EditorRenderProps) {
  const content = normalizeEditorContent(value);

  if (!content) {
    return null;
  }

  return (
    <div className={className}>
      {content.root.children.map((node, index) => renderNode(node, String(index)))}
    </div>
  );
}
```

Implementation rules:
- no `LexicalComposer`
- no `createEditor`
- no `DOMParser`
- no browser-only DOM APIs
- no hidden fallback rendering for unsupported nodes

Then export `EditorRender` from `@acme/ui/src/components/editor/index.ts`.

- [ ] **Step 5: Re-read the new renderer files before rerunning tests**

Read:
- `@acme/ui/src/components/editor/editor-render.tsx`
- `@acme/ui/src/components/editor/render/render-node.tsx`
- `@acme/ui/src/components/editor/index.ts`

Confirm:
- `EditorRender` normalizes input once and returns `null` for invalid payloads
- unsupported nodes are dropped explicitly
- supported nodes map to semantic HTML only
- the renderer does not mount Lexical runtime infrastructure

- [ ] **Step 6: Run the focused renderer test file and make it pass**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/editor/editor-render.test.tsx
```

Expected after implementation:
- PASS
- supported-node tests pass
- invalid-input tests pass
- unsupported-node tests pass

- [ ] **Step 7: Optional commit only if the user explicitly requests one**

If the user explicitly asks for a commit, stage only the files changed for this task:

```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add @acme/ui/src/components/editor/editor-render.tsx @acme/ui/src/components/editor/editor-render.test.tsx @acme/ui/src/components/editor/render/normalize-editor-content.ts @acme/ui/src/components/editor/render/normalize-editor-content.test.ts @acme/ui/src/components/editor/render/render-node.tsx @acme/ui/src/components/editor/render/render-types.ts @acme/ui/src/components/editor/render/render-fixtures.ts @acme/ui/src/components/editor/index.ts
```

---

### Task 5: Add parity tests between `EditorPreview` and `EditorRender`

**Files:**
- Create: `@acme/ui/src/components/editor/editor-preview-render-parity.test.tsx`
- Inspect: `@acme/ui/src/components/editor/editor-preview.tsx`
- Inspect: `@acme/ui/src/components/editor/editor-render.tsx`
- Inspect: `@acme/ui/src/components/editor/render/render-fixtures.ts`
- Inspect: `docs/superpowers/specs/2026-03-26-editor-preview-render-design.md`
- Test: `@acme/ui/src/components/editor/editor-preview-render-parity.test.tsx`

- [ ] **Step 1: Re-read the parity rules before writing tests**

Read:
- `docs/superpowers/specs/2026-03-26-editor-preview-render-design.md`
- `@acme/ui/src/components/editor/render/render-fixtures.ts`
- `@acme/ui/src/components/editor/editor-preview.tsx`
- `@acme/ui/src/components/editor/editor-render.tsx`

Expected reminders:
- parity is semantic, not byte-for-byte HTML identity
- compare equivalent block tags, text content, list nesting/order, link destinations, checklist checked state, and supported table structure
- unsupported-node behavior has separate coverage and is not part of parity expectations

- [ ] **Step 2: Write the failing parity tests first**

Create `@acme/ui/src/components/editor/editor-preview-render-parity.test.tsx` using shared fixtures.

For each representative supported fixture:
- render through `EditorPreview`
- render through `EditorRender`
- compare normalized semantic HTML or DOM structure, not raw implementation internals

Include fixtures for at least:
- paragraph with inline marks
- heading + paragraph
- nested list
- link
- check-block checked state
- code block
- table

Suggested shape:

```tsx
import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { EditorPreview } from "./editor-preview";
import { EditorRender } from "./editor-render";
import { nestedListDocument } from "./render/render-fixtures";

Object.assign(globalThis, { React });

afterEach(() => {
  cleanup();
});

function normalizeSemanticHtml(container: HTMLElement): string {
  return container.innerHTML
    .replace(/\s+/g, " ")
    .replace(/> </g, "><")
    .trim();
}

describe("EditorPreview and EditorRender parity", () => {
  test("preserves nested list semantics", async () => {
    const preview = render(<EditorPreview value={JSON.stringify(nestedListDocument)} />);
    const publish = render(<EditorRender value={nestedListDocument} />);

    expect(normalizeSemanticHtml(preview.container)).toContain("<ul");
    expect(normalizeSemanticHtml(publish.container)).toContain("<ul");
    expect(preview.container.querySelector("ul ul")).not.toBeNull();
    expect(publish.container.querySelector("ul ul")).not.toBeNull();
  });
});
```

- [ ] **Step 3: Run the focused parity test to verify it fails first**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/editor/editor-preview-render-parity.test.tsx
```

Expected before implementation:
- FAIL because parity normalization or supported renderer output is not complete yet

- [ ] **Step 4: Implement the minimum changes needed to make parity pass**

Adjust only the shared semantic contract, renderer output, or parity normalization helpers needed to satisfy the approved semantic parity contract.

Do **not** change `EditorPreview` into a publish renderer.
Do **not** change `EditorRender` to chase byte-for-byte Lexical DOM output.

- [ ] **Step 5: Run the focused parity test to verify it passes**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/editor/editor-preview-render-parity.test.tsx
```

Expected after implementation:
- PASS

- [ ] **Step 6: Optional commit only if the user explicitly requests one**

If the user explicitly asks for a commit, stage only the files changed for this task:

```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add @acme/ui/src/components/editor/editor-preview-render-parity.test.tsx @acme/ui/src/components/editor/editor-preview.tsx @acme/ui/src/components/editor/editor-render.tsx @acme/ui/src/components/editor/render/render-node.tsx @acme/ui/src/components/editor/themes/rich-text-semantic-contract.ts
```

---

### Task 6: Final focused verification and export audit

**Files:**
- Inspect: `@acme/ui/src/components/editor/index.ts`
- Inspect: `@acme/ui/src/components/editor/editor-preview.tsx`
- Inspect: `@acme/ui/src/components/editor/editor-render.tsx`
- Inspect: `@acme/ui/src/components/editor/themes/rich-text-semantic-contract.ts`
- Inspect: `docs/superpowers/specs/2026-03-26-editor-preview-render-design.md`
- Verify: `@acme/ui/src/components/editor/editor-preview.test.tsx`
- Verify: `@acme/ui/src/components/editor/editor-render.test.tsx`
- Verify: `@acme/ui/src/components/editor/editor-preview-render-parity.test.tsx`
- Verify: `@acme/ui/src/components/editor/themes/rich-text-semantic-contract.test.ts`

- [ ] **Step 1: Run the focused editor surface test set**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/editor/themes/rich-text-semantic-contract.test.ts src/components/editor/editor-preview.test.tsx src/components/editor/editor-render.test.tsx src/components/editor/editor-preview-render-parity.test.tsx
```

Expected:
- PASS
- all focused preview/render/contract tests green

- [ ] **Step 2: Optional broader regression follow-up only if changed files affect overlapping semantics**

Only if implementation changes touch logic that could affect serialized list semantics, checklist semantics, or soft-line-break-related structure, run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/editor/plugins/block-copy-paste-plugin.test.ts src/components/editor/plugins/plain-text-linebreak-paste-plugin.test.tsx src/components/editor/plugins/markdown-paste-plugin.test.ts src/components/editor/plugins/markdown-paste-plugin.integration.test.tsx
```

Expected if run:
- PASS

If implementation stays isolated to the new preview/render surface and shared semantic contract, this broader follow-up is optional and not required for task completion.

- [ ] **Step 3: Re-read the final public export surface**

Read:
- `@acme/ui/src/components/editor/index.ts`

Confirm:
- `EditorPreview` is exported
- `EditorRender` is exported
- any new public types are intentionally exported, not accidental
- no internal renderer helpers are exported unless the design explicitly needs them public

- [ ] **Step 4: Re-read the final implementation against the spec**

Read:
- `docs/superpowers/specs/2026-03-26-editor-preview-render-design.md`
- `@acme/ui/src/components/editor/editor-preview.tsx`
- `@acme/ui/src/components/editor/editor-render.tsx`
- `@acme/ui/src/components/editor/themes/rich-text-semantic-contract.ts`

Confirm:
- `EditorPreview` is still thin
- `EditorRender` is still SSR-safe and Lexical-runtime-free
- invalid payloads return `null`
- unsupported nodes are dropped entirely
- the shared contract does not expose editor-only affordance classes

- [ ] **Step 5: Optional commit only if the user explicitly requests one**

If the user explicitly asks for a commit after final verification, stage only the files changed by this feature:

```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add @acme/ui/src/components/editor/index.ts @acme/ui/src/components/editor/editor-preview.tsx @acme/ui/src/components/editor/editor-render.tsx @acme/ui/src/components/editor/themes/rich-text-semantic-contract.ts @acme/ui/src/components/editor/themes/editor-theme.ts @acme/ui/src/components/editor/themes/editor-theme.css @acme/ui/src/components/editor/render/normalize-editor-content.ts @acme/ui/src/components/editor/render/normalize-editor-content.test.ts @acme/ui/src/components/editor/render/render-node.tsx @acme/ui/src/components/editor/render/render-types.ts @acme/ui/src/components/editor/render/render-fixtures.ts @acme/ui/src/components/editor/editor-preview.test.tsx @acme/ui/src/components/editor/editor-render.test.tsx @acme/ui/src/components/editor/editor-preview-render-parity.test.tsx @acme/ui/src/components/editor/themes/rich-text-semantic-contract.test.ts
```

- [ ] **Step 6: Stop after verified delivery**

Do not:
- broaden publish support to media/embed nodes in this plan
- redesign the authoring editor API
- move markdown/html mode logic into the new publish renderer
- add browser-only rendering shortcuts to `EditorRender`
- refactor unrelated editor plugins or Storybook stories as part of this work
