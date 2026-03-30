# EditorPreview and EditorRender Markdown/HTML Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let `EditorPreview` and `EditorRender` accept `json`, `markdown`, and `html` inputs while keeping Lexical JSON as the canonical internal representation and preserving the current publish-rendering boundary.

**Architecture:** Keep `EditorPreview` as a thin read-only wrapper over `Editor`, only widening its prop surface to expose `format`. Keep `EditorRender` as the explicit publish boundary: resolve markdown/html to Lexical JSON exactly once before passing the result into the existing supported-node gate and semantic renderer. Split the HTML boundary into two layers inside one utility module: a synchronous document-to-editor import helper reusable by the client plugin, and an async HTML-string-to-Lexical resolver for the render boundary that uses browser `DOMParser` when available and lazily loads the server-safe JSDOM path only when SSR needs it.

**Tech Stack:** React, TypeScript, Lexical, `@lexical/markdown`, `@lexical/html`, `@lexical/headless`, `jsdom`, Testing Library, Vitest, pnpm

---

## File Structure

### Existing files to modify
- `@acme/ui/package.json`
  - Add the runtime dependency needed for server-safe HTML conversion.
  - Move `jsdom` to runtime dependencies if the helper uses it during SSR.
- `pnpm-lock.yaml`
  - Capture any dependency updates made for `@acme/ui`.
- `@acme/ui/src/components/editor/editor-preview.tsx`
  - Stop forcing `format="json"`; keep `editable={false}` and `onChange` unavailable.
- `@acme/ui/src/components/editor/editor-preview.test.tsx`
  - Extend focused coverage from JSON-only preview to JSON/markdown/HTML preview.
- `@acme/ui/src/components/editor/editor-render.tsx`
  - Add `format?: "json" | "markdown" | "html"` and delegate non-JSON input conversion to a dedicated render-boundary resolver before the existing normalize+render pipeline.
- `@acme/ui/src/components/editor/editor-render.test.tsx`
  - Keep current JSON semantics and add markdown/html semantic rendering + invalid-usage coverage.
- `@acme/ui/src/components/editor/editor-preview-render-parity.test.tsx`
  - Extend parity checks from JSON-only to cross-format semantic parity.
- `@acme/ui/src/components/editor/render/render-fixtures.ts`
  - Add reusable markdown/html string fixtures for the supported first-pass source matrix.
- `@acme/ui/src/components/editor/utils/lexical-converter.ts`
  - Preserve current markdown helper behavior for existing callers, but add a strict helper for render-boundary usage.
- `@acme/ui/src/components/editor/plugins/html-plugins.tsx`
  - Reuse the extracted document-to-editor helper only for the synchronous DOM-to-node work while keeping `DOMParser` local to the client plugin.

### Files to create
- `@acme/ui/src/components/editor/utils/html-converter.ts`
  - Shared HTML import/conversion helpers with no top-level `jsdom` import; keeps synchronous DOM-to-node insertion reusable by the client plugin and exposes a separate async HTML-string-to-Lexical resolver for the render boundary.
- `@acme/ui/src/components/editor/utils/html-converter.test.ts`
  - Focused tests for synchronous DOM-to-node import and async server-path HTML conversion.
- `@acme/ui/src/components/editor/utils/lexical-converter.test.ts`
  - Focused tests for strict markdown conversion behavior.

### Existing files to inspect during implementation
- `docs/superpowers/specs/2026-03-27-editor-preview-render-markdown-html-support-design.md`
  - Approved source of truth for scope, API contract, SSR rules, and non-goals.
- `@acme/ui/src/components/editor/editor.tsx`
  - Existing `EditorProps` union and runtime `json` / `markdown` / `html` behavior.
- `@acme/ui/src/components/editor/render/render-types.ts`
  - Current supported publish node set and fixture names.
- `@acme/ui/src/components/editor/render/render-fixtures.ts`
  - Existing canonical/unsupported/invalid JSON fixture inventory.
- `@acme/ui/src/components/editor/nodes/nodes.ts`
  - Node registration inventory reused by the new conversion helpers.
- `@acme/ui/src/components/editor/transformers/markdown-transformers.ts`
  - Markdown import behavior that defines first-pass source support.
- `@acme/ui/src/components/editor/plugins/markdown-plugins.tsx`
  - Reference for existing runtime markdown initialization.
- `@acme/ui/src/components/editor/plugins/html-plugins.tsx`
  - Reference for the client-only HTML import path and the synchronous insertion logic that can be shared after DOM creation.
- `@acme/ui/vitest.config.ts`
  - Confirms the package uses the `unit` project under `jsdom`.

### Files that should remain unchanged unless a failing test proves otherwise
- `@acme/ui/src/components/editor/demo/playground.tsx`
- `@acme/ui/src/components/editor/editor.stories.tsx`
- `@acme/ui/src/components/editor/plugins/markdown-plugins.tsx`
- `@acme/ui/src/components/editor/render/render-node.tsx`
- `@acme/ui/src/components/editor/themes/rich-text-semantic-contract.ts`

This feature is about widening accepted input formats at the preview/render boundary, not changing Storybook surfaces, semantic publish styling, or the supported publish node set.

---

## Constraints

- `EditorPreview` must stay thin.
- `EditorPreview` must keep `editable={false}` and must not expose `onChange`.
- `EditorRender` must remain the canonical publish boundary.
- `EditorRender` must not add raw HTML rendering or unsafe HTML injection.
- No input-format auto-detection.
- `format` defaults to `json`.
- `LexicalEditorContent` object input is valid only for `format="json"`.
- Markdown and HTML must be converted to Lexical JSON exactly once before boundary validation.
- The existing supported publish node set stays unchanged.
- Unsupported converted nodes must still produce `null` once they hit the publish boundary.
- Conversion failure must return `null` for `EditorRender`; do not silently fall back to empty text or raw source.
- `EditorRender(format="html")` must work without depending on browser-only `DOMParser` being present.
- The client HTML plugin must keep DOM creation synchronous inside its current `editor.update()` flow.
- Use **pnpm** only.

---

### Task 1: Widen `EditorPreview` to support `format="json" | "markdown" | "html"`

**Files:**
- Modify: `@acme/ui/src/components/editor/editor-preview.tsx`
- Modify: `@acme/ui/src/components/editor/editor-preview.test.tsx`
- Inspect: `docs/superpowers/specs/2026-03-27-editor-preview-render-markdown-html-support-design.md`
- Inspect: `@acme/ui/src/components/editor/editor.tsx`
- Test: `@acme/ui/src/components/editor/editor-preview.test.tsx`

- [ ] **Step 1: Re-read the approved spec and the current editor/preview surfaces**

Read:
- `docs/superpowers/specs/2026-03-27-editor-preview-render-markdown-html-support-design.md`
- `@acme/ui/src/components/editor/editor.tsx`
- `@acme/ui/src/components/editor/editor-preview.tsx`
- `@acme/ui/src/components/editor/editor-preview.test.tsx`

Expected findings:
- `Editor` already supports `format?: "json"`, `format: "markdown"`, and `format: "html"`
- `EditorPreview` currently omits `format` and forces `format="json"`
- preview already behaves correctly as a read-only wrapper for JSON input and should stay that thin

- [ ] **Step 2: Write the failing preview tests first**

Extend `@acme/ui/src/components/editor/editor-preview.test.tsx` to cover:
- JSON still renders authored content
- markdown renders via the existing runtime path
- HTML renders via the existing runtime path
- preview remains read-only and does not expose authoring behavior
- empty read-only content still does not show the authoring placeholder
- package export still works

Add cases close to this:

```tsx
const MARKDOWN_VALUE = "## Preview heading\n\nPreview paragraph";
const HTML_VALUE = "<h2>Preview heading</h2><p>Preview paragraph</p>";

test("renders markdown content through the existing editor runtime", async () => {
  render(
    <EditorPreview
      value={MARKDOWN_VALUE}
      format="markdown"
      placeholder="Write, press space for AI"
      autoFocus={false}
    />,
  );

  await waitFor(() => {
    expect(screen.getByText("Preview heading")).toBeInTheDocument();
    expect(screen.getByText("Preview paragraph")).toBeInTheDocument();
  });
});

test("renders html content through the existing editor runtime", async () => {
  render(
    <EditorPreview
      value={HTML_VALUE}
      format="html"
      placeholder="Write, press space for AI"
      autoFocus={false}
    />,
  );

  await waitFor(() => {
    expect(screen.getByText("Preview heading")).toBeInTheDocument();
    expect(screen.getByText("Preview paragraph")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the focused preview test file and watch it fail**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/editor/editor-preview.test.tsx
```

Expected before implementation:
- FAIL because `EditorPreview` still forces `format="json"`
- the markdown/html tests should not find the expected rendered text

- [ ] **Step 4: Implement the minimum `EditorPreview` prop widening**

Update `@acme/ui/src/components/editor/editor-preview.tsx` so it keeps the wrapper thin but allows the caller to pass `format`.

Use a narrow preview-specific prop type that matches the approved spec instead of re-exporting the broader `EditorProps` union:

```tsx
import { Editor } from "./editor";

import type { SizeType } from "../config-provider/size-context";

type EditorPreviewBaseProps = {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  variant?: "default" | "simple" | "minimal";
  className?: string;
  contentClassName?: string;
  placeholderClassName?: string;
  autoFocus?: boolean;
  size?: SizeType;
};

type EditorPreviewProps =
  | (EditorPreviewBaseProps & { format?: "json" })
  | (EditorPreviewBaseProps & { format: "markdown" })
  | (EditorPreviewBaseProps & { format: "html" });

export function EditorPreview({ format = "json", ...props }: EditorPreviewProps) {
  if (format === "markdown") {
    return <Editor {...props} format="markdown" editable={false} />;
  }

  if (format === "html") {
    return <Editor {...props} format="html" editable={false} />;
  }

  return <Editor {...props} format="json" editable={false} />;
}
```

Rules:
- do not add conversion logic here
- do not add preview-specific fallback behavior
- do not create a second runtime path

- [ ] **Step 5: Re-read the wrapper before rerunning tests**

Read:
- `@acme/ui/src/components/editor/editor-preview.tsx`

Confirm:
- `format` defaults to `json`
- `value` and `defaultValue` remain string-based as required by the approved spec
- `editable={false}` is still locked
- `onChange` is still unavailable
- the wrapper only re-discriminates `format`; it does not add conversion or business logic

- [ ] **Step 6: Run the focused preview test file again**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/editor/editor-preview.test.tsx
```

Expected after implementation:
- PASS

- [ ] **Step 7: Stop after the focused preview tests pass**

Do not expand this task into render-boundary work yet.

---

### Task 2: Extract strict markdown/html conversion helpers for the render boundary

**Files:**
- Modify: `@acme/ui/package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `@acme/ui/src/components/editor/utils/lexical-converter.ts`
- Create: `@acme/ui/src/components/editor/utils/lexical-converter.test.ts`
- Create: `@acme/ui/src/components/editor/utils/html-converter.ts`
- Create: `@acme/ui/src/components/editor/utils/html-converter.test.ts`
- Modify: `@acme/ui/src/components/editor/plugins/html-plugins.tsx`
- Inspect: `docs/superpowers/specs/2026-03-27-editor-preview-render-markdown-html-support-design.md`
- Inspect: `@acme/ui/src/components/editor/utils/lexical-converter.ts`
- Inspect: `@acme/ui/src/components/editor/plugins/html-plugins.tsx`
- Inspect: `@acme/ui/src/components/editor/nodes/nodes.ts`
- Inspect: `@acme/ui/src/components/editor/transformers/markdown-transformers.ts`
- Inspect: `@acme/ui/package.json`
- Test: `@acme/ui/src/components/editor/utils/lexical-converter.test.ts`
- Test: `@acme/ui/src/components/editor/utils/html-converter.test.ts`

- [ ] **Step 1: Re-read the current converter/plugin code and dependency state**

Read:
- `docs/superpowers/specs/2026-03-27-editor-preview-render-markdown-html-support-design.md`
- `@acme/ui/src/components/editor/utils/lexical-converter.ts`
- `@acme/ui/src/components/editor/plugins/html-plugins.tsx`
- `@acme/ui/src/components/editor/nodes/nodes.ts`
- `@acme/ui/src/components/editor/transformers/markdown-transformers.ts`
- `@acme/ui/package.json`

Expected findings:
- `markdownToLexicalContent()` currently falls back to an empty root on error
- `html-plugins.tsx` owns HTML import logic directly with browser `DOMParser`
- `nodes.ts` already registers the full editor node set needed for conversion
- `@acme/ui` does not yet declare `@lexical/headless`
- `jsdom` currently sits in `devDependencies`, but SSR HTML conversion needs runtime access if the helper uses it outside tests

- [ ] **Step 2: Write the failing helper tests first**

Create `@acme/ui/src/components/editor/utils/lexical-converter.test.ts` for strict markdown conversion.

Cover at least:
- `tryMarkdownToLexicalContent("")` returns a valid empty root
- `tryMarkdownToLexicalContent("## Heading")` returns Lexical JSON with a root node
- the strict helper returns `null` when an injected editor factory throws
- the existing `markdownToLexicalContent()` wrapper preserves its current empty-root fallback behavior

Suggested shape:

```ts
import { describe, expect, test, vi } from "vitest";

import {
  markdownToLexicalContent,
  tryMarkdownToLexicalContent,
} from "./lexical-converter";

describe("tryMarkdownToLexicalContent", () => {
  test("returns a valid empty root for empty markdown", () => {
    expect(tryMarkdownToLexicalContent("")?.root.children).toEqual([]);
  });

  test("returns lexical json for supported markdown", () => {
    const content = tryMarkdownToLexicalContent("## Converted heading");
    expect(content?.root.type).toBe("root");
    expect(content?.root.children.length).toBeGreaterThan(0);
  });

  test("returns null when conversion throws", () => {
    const content = tryMarkdownToLexicalContent("## boom", {
      createEditor: () => {
        throw new Error("boom");
      },
    });

    expect(content).toBeNull();
  });

  test("keeps legacy empty-root fallback for markdownToLexicalContent", () => {
    const content = markdownToLexicalContent("## boom", {
      createEditor: () => {
        throw new Error("boom");
      },
    });

    expect(content.root.children).toEqual([]);
  });
});
```

Create `@acme/ui/src/components/editor/utils/html-converter.test.ts` for the split HTML conversion contract.

Cover at least:
- `importDomIntoEditor()` synchronously inserts nodes from a provided `Document`
- `createBrowserHtmlDocument()` returns a parsed `Document` through browser `DOMParser`
- `tryHtmlDocumentToLexicalContent()` converts a provided `Document` into Lexical JSON synchronously
- `tryHtmlToLexicalContent()` uses an injected JSDOM-style document factory when `DOMParser` is unavailable
- valid server HTML converts into Lexical JSON through the async HTML-string resolver
- a throwing document factory returns `null`

Suggested shape:

```ts
import { JSDOM } from "jsdom";
import { describe, expect, test } from "vitest";

import {
  createBrowserHtmlDocument,
  importDomIntoEditor,
  tryHtmlDocumentToLexicalContent,
  tryHtmlToLexicalContent,
} from "./html-converter";

describe("html conversion", () => {
  test("imports html from a provided document into an editor", () => {
    const document = new DOMParser().parseFromString("<p>HTML paragraph</p>", "text/html");
    // create a test editor, call importDomIntoEditor(editor, document)
    // then assert the editor state contains imported content
  });

  test("converts a provided document into lexical json synchronously", () => {
    const document = new DOMParser().parseFromString("<h2>Browser heading</h2>", "text/html");
    const content = tryHtmlDocumentToLexicalContent(document);
    expect(content?.root.children.length).toBeGreaterThan(0);
  });

  test("converts html with an injected server document factory", async () => {
    const content = await tryHtmlToLexicalContent("<h2>Server heading</h2>", {
      createDocument: async (html) => new JSDOM(html).window.document,
    });

    expect(content?.root.children.length).toBeGreaterThan(0);
  });

  test("returns null when the document factory throws", async () => {
    const content = await tryHtmlToLexicalContent("<p>bad</p>", {
      createDocument: () => {
        throw new Error("boom");
      },
    });

    expect(content).toBeNull();
  });
});
```

- [ ] **Step 3: Run the helper tests and watch them fail**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/editor/utils/lexical-converter.test.ts src/components/editor/utils/html-converter.test.ts
```

Expected before implementation:
- FAIL because the new strict helper/test files do not exist yet
- FAIL because there is no extracted HTML converter yet

- [ ] **Step 4: Add the runtime dependencies needed for SSR-safe HTML conversion**

Update `@acme/ui/package.json` so `@acme/ui` can use Lexical’s documented server-side HTML import path.

Change the dependency blocks to this shape:

```json
"dependencies": {
  "@lexical/headless": "^0.42.0",
  "jsdom": "catalog:",
  ...
},
"devDependencies": {
  ...
}
```

Then update the workspace lockfile:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react" install --filter @acme/ui
```

Expected:
- `@acme/ui/package.json` updated
- `/Users/vyductan/Developer/vyductan/vyductan-react/pnpm-lock.yaml` updated

- [ ] **Step 5: Implement the strict markdown and split HTML converter utilities**

In `@acme/ui/src/components/editor/utils/lexical-converter.ts`, keep the current public fallback helper, but add a strict render-boundary helper.

Use a shape close to this:

```ts
import { createHeadlessEditor } from "@lexical/headless";
import { $convertFromMarkdownString, $convertToMarkdownString } from "@lexical/markdown";
import { $getRoot } from "lexical";

const EMPTY_LEXICAL_EDITOR_CONTENT: LexicalEditorContent = {
  root: {
    type: "root",
    format: "",
    indent: 0,
    version: 1,
    children: [],
    direction: "ltr",
  },
};

export function tryMarkdownToLexicalContent(
  markdown: string,
  options?: { createEditor?: typeof createHeadlessEditor },
): LexicalEditorContent | null {
  if (!markdown.trim()) {
    return EMPTY_LEXICAL_EDITOR_CONTENT;
  }

  try {
    const editor = (options?.createEditor ?? createHeadlessEditor)({
      namespace: "temp-markdown-converter",
      onError: (error) => {
        throw error;
      },
      nodes: nodes as never,
    });

    editor.update(() => {
      const root = $getRoot();
      root.clear();
      $convertFromMarkdownString(markdown, MARKDOWN_TRANSFORMERS);
    }, { discrete: true });

    return editor.getEditorState().toJSON() as LexicalEditorContent;
  } catch (error) {
    console.error("Error converting markdown to Lexical:", error);
    return null;
  }
}

export function markdownToLexicalContent(
  markdown: string,
  options?: { createEditor?: typeof createHeadlessEditor },
): LexicalEditorContent {
  return tryMarkdownToLexicalContent(markdown, options) ?? EMPTY_LEXICAL_EDITOR_CONTENT;
}
```

Create `@acme/ui/src/components/editor/utils/html-converter.ts` as the shared HTML import/conversion utility with:
- `createBrowserHtmlDocument(html)`
- `importDomIntoEditor(editor, document)`
- `tryHtmlDocumentToLexicalContent(document, options?)`
- `tryHtmlToLexicalContent(html, options?)`

Use a shape close to this:

```ts
import type { LexicalEditor } from "lexical";
import { createHeadlessEditor } from "@lexical/headless";
import { $generateNodesFromDOM } from "@lexical/html";
import { $getRoot } from "lexical";

export function createBrowserHtmlDocument(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

export function importDomIntoEditor(editor: LexicalEditor, document: Document) {
  const nodesFromDom = $generateNodesFromDOM(editor, document);
  const root = $getRoot();
  root.clear();
  root.append(...nodesFromDom);
}

export function tryHtmlDocumentToLexicalContent(
  document: Document,
  options?: { createEditor?: typeof createHeadlessEditor },
): LexicalEditorContent | null {
  try {
    const editor = (options?.createEditor ?? createHeadlessEditor)({
      namespace: "temp-html-converter",
      onError: (error) => {
        throw error;
      },
      nodes: nodes as never,
    });

    editor.update(
      () => {
        importDomIntoEditor(editor, document);
      },
      { discrete: true },
    );

    return editor.getEditorState().toJSON() as LexicalEditorContent;
  } catch (error) {
    console.error("Error converting HTML document to Lexical:", error);
    return null;
  }
}

async function defaultCreateServerHtmlDocument(html: string): Promise<Document> {
  const { JSDOM } = await import("jsdom");
  return new JSDOM(html).window.document;
}

export async function tryHtmlToLexicalContent(
  html: string,
  options?: {
    createDocument?: (html: string) => Document | Promise<Document>;
    createEditor?: typeof createHeadlessEditor;
  },
): Promise<LexicalEditorContent | null> {
  try {
    const document = await (options?.createDocument ?? defaultCreateServerHtmlDocument)(html);
    return tryHtmlDocumentToLexicalContent(document, options);
  } catch (error) {
    console.error("Error converting HTML to Lexical:", error);
    return null;
  }
}
```

Implementation rules:
- `html-converter.ts` must not have any top-level `jsdom` import
- browser DOM creation stays synchronous and client-only through `createBrowserHtmlDocument()`
- server-only DOM creation must happen through lazy loading or an injected document factory
- `importDomIntoEditor()` must stay synchronous so `html-plugins.tsx` can call it inside the current `editor.update()` transaction
- keep the DOM-environment choice inside this conversion boundary
- do not move plugin lifecycle into the converter
- do not change the runtime markdown/html plugin behavior beyond what is required for safe helper reuse

- [ ] **Step 6: Reuse only the synchronous DOM-to-editor helper in `html-plugins.tsx`**

Refactor `@acme/ui/src/components/editor/plugins/html-plugins.tsx` so `InitialHtmlPlugin` keeps local browser DOM creation but reuses the shared synchronous DOM-to-editor helper.

Replace this block:

```tsx
const parser = new DOMParser();
const dom = parser.parseFromString(html, "text/html");
const nodes = $generateNodesFromDOM(editor, dom);
const root = $getRoot();

root.clear();
root.append(...nodes);
```

with:

```tsx
import { createBrowserHtmlDocument, importDomIntoEditor } from "../utils/html-converter";

editor.update(() => {
  importDomIntoEditor(editor, createBrowserHtmlDocument(html));
});
```

The plugin should keep its current initialization and `OnChangePlugin` behavior.

- [ ] **Step 7: Re-read the edited converter files before rerunning tests**

Read:
- `@acme/ui/src/components/editor/utils/lexical-converter.ts`
- `@acme/ui/src/components/editor/utils/html-converter.ts`
- `@acme/ui/src/components/editor/plugins/html-plugins.tsx`
- `@acme/ui/package.json`

Confirm:
- the strict markdown helper returns `null` on actual conversion failure
- the legacy markdown helper still returns empty-root fallback
- browser HTML DOM creation stays synchronous for the client plugin
- async HTML string conversion is isolated to the server-safe render-boundary helper
- `html-converter.ts` keeps `jsdom` isolated behind lazy loading or injection and does not leak it into the ordinary client bundle
- runtime dependencies match actual runtime use

- [ ] **Step 8: Run the focused helper tests again**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/editor/utils/lexical-converter.test.ts src/components/editor/utils/html-converter.test.ts
```

Expected after implementation:
- PASS

- [ ] **Step 9: Stop after the helper tests pass**

Do not pull render-boundary assertions into this task yet.

---

### Task 3: Add a render-boundary resolver and update `EditorRender` to use it safely in browser and SSR

**Files:**
- Create: `@acme/ui/src/components/editor/render/resolve-editor-render-content.ts`
- Create: `@acme/ui/src/components/editor/render/resolve-editor-render-content.test.ts`
- Modify: `@acme/ui/src/components/editor/editor-render.tsx`
- Inspect: `docs/superpowers/specs/2026-03-27-editor-preview-render-markdown-html-support-design.md`
- Inspect: `@acme/ui/src/components/editor/render/normalize-editor-content.ts`
- Inspect: `@acme/ui/src/components/editor/render/normalize-editor-content.test.ts`
- Inspect: `@acme/ui/src/components/editor/editor-render.tsx`
- Inspect: `@acme/ui/src/components/editor/utils/lexical-converter.ts`
- Inspect: `@acme/ui/src/components/editor/utils/html-converter.ts`
- Test: `@acme/ui/src/components/editor/render/resolve-editor-render-content.test.ts`

- [ ] **Step 1: Re-read the current render boundary before changing it**

Read:
- `docs/superpowers/specs/2026-03-27-editor-preview-render-markdown-html-support-design.md`
- `@acme/ui/src/components/editor/render/normalize-editor-content.ts`
- `@acme/ui/src/components/editor/render/normalize-editor-content.test.ts`
- `@acme/ui/src/components/editor/editor-render.tsx`
- `@acme/ui/src/components/editor/utils/html-converter.ts`

Expected findings:
- `normalizeEditorContent()` is already the supported-node validation gate for Lexical JSON
- current tests explicitly assert that raw markdown/html strings return `null`
- `EditorRender` currently has no `format` prop
- the SSR-safe HTML path cannot be pushed directly into the current synchronous `normalizeEditorContent()` API without creating a sync/async mismatch

- [ ] **Step 2: Write the failing resolver tests first**

Create `@acme/ui/src/components/editor/render/resolve-editor-render-content.test.ts` to cover:
- JSON object input is passed through unchanged for `format="json"`
- JSON string input is passed through unchanged for `format="json"`
- markdown string input resolves to Lexical JSON for `format="markdown"`
- HTML string input resolves synchronously through the browser `DOMParser` path when `DOMParser` is available
- object input with `format="markdown"` returns `null`
- object input with `format="html"` returns `null`
- the server HTML resolver returns Lexical JSON when given an injected async document factory
- the server HTML resolver returns `null` when the document factory throws

Add cases close to this:

```ts
import { describe, expect, test } from "vitest";

import {
  resolveEditorRenderContentSync,
  resolveServerHtmlEditorRenderContent,
} from "./resolve-editor-render-content";

test("passes json objects through unchanged", () => {
  expect(resolveEditorRenderContentSync(editorRenderFixtures.paragraph.content, "json")).toBe(
    editorRenderFixtures.paragraph.content,
  );
});

test("resolves markdown strings to lexical json", () => {
  const content = resolveEditorRenderContentSync("## Boundary heading", "markdown");
  expect(content && typeof content !== "string").toBe(true);
});

test("returns null for object input with html format", () => {
  expect(resolveEditorRenderContentSync(editorRenderFixtures.paragraph.content, "html")).toBeNull();
});

test("resolves server html with an injected document factory", async () => {
  const content = await resolveServerHtmlEditorRenderContent("<p>Server paragraph</p>", {
    createDocument: async (html) => new JSDOM(html).window.document,
  });

  expect(content?.root.type).toBe("root");
});
```

- [ ] **Step 3: Run the resolver test file and watch it fail**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/editor/render/resolve-editor-render-content.test.ts
```

Expected before implementation:
- FAIL because the resolver file does not exist yet
- FAIL because `EditorRender` still has no format-aware pre-normalization boundary

- [ ] **Step 4: Implement the resolver so conversion happens before normalization**

Create `@acme/ui/src/components/editor/render/resolve-editor-render-content.ts`.

Use a shape close to this:

```ts
import type { LexicalEditorContent } from "../types";

import {
  createBrowserHtmlDocument,
  tryHtmlDocumentToLexicalContent,
  tryHtmlToLexicalContent,
} from "../utils/html-converter";
import { tryMarkdownToLexicalContent } from "../utils/lexical-converter";

export type EditorRenderInputFormat = "json" | "markdown" | "html";

export function resolveEditorRenderContentSync(
  value: LexicalEditorContent | string,
  format: EditorRenderInputFormat = "json",
): LexicalEditorContent | string | null {
  if (format === "json") {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  if (format === "markdown") {
    return tryMarkdownToLexicalContent(value);
  }

  if (typeof DOMParser === "undefined") {
    return null;
  }

  return tryHtmlDocumentToLexicalContent(createBrowserHtmlDocument(value));
}

export async function resolveServerHtmlEditorRenderContent(
  value: string,
  options?: {
    createDocument?: (html: string) => Document | Promise<Document>;
  },
): Promise<LexicalEditorContent | null> {
  return tryHtmlToLexicalContent(value, options);
}
```

Important rules:
- keep `normalizeEditorContent()` as the pure JSON validation gate
- do not move supported-node validation into the resolver
- do not add format auto-detection
- do not silently reinterpret non-JSON object input as markdown/html

- [ ] **Step 5: Update `EditorRender` to use the resolver and keep the public API explicit**

Change `@acme/ui/src/components/editor/editor-render.tsx` to this shape:

```tsx
import { cn } from "@acme/ui/lib/utils";

import { Suspense, use } from "react";

import type { LexicalEditorContent } from "./types";
import { normalizeEditorContent } from "./render/normalize-editor-content";
import {
  resolveEditorRenderContentSync,
  resolveServerHtmlEditorRenderContent,
  type EditorRenderInputFormat,
} from "./render/resolve-editor-render-content";
import { renderRootNodes } from "./render/render-node";

type EditorRenderProps = {
  className?: string;
  value: string | LexicalEditorContent;
  format?: EditorRenderInputFormat;
};

function EditorRenderResolved({
  className,
  resolvedValue,
}: {
  className?: string;
  resolvedValue: string | LexicalEditorContent;
}) {
  const content = normalizeEditorContent(resolvedValue);

  if (!content) {
    return null;
  }

  return <div className={cn(className)}>{renderRootNodes(content.root.children)}</div>;
}

function EditorRenderServerHtml({ className, value }: { className?: string; value: string }) {
  const resolvedValue = use(resolveServerHtmlEditorRenderContent(value));

  if (!resolvedValue) {
    return null;
  }

  return <EditorRenderResolved className={className} resolvedValue={resolvedValue} />;
}

export function EditorRender({ className, value, format = "json" }: EditorRenderProps) {
  if (format === "html" && typeof DOMParser === "undefined") {
    if (typeof value !== "string") {
      return null;
    }

    return (
      <Suspense fallback={null}>
        <EditorRenderServerHtml className={className} value={value} />
      </Suspense>
    );
  }

  const resolvedValue = resolveEditorRenderContentSync(value, format);

  if (!resolvedValue) {
    return null;
  }

  return <EditorRenderResolved className={className} resolvedValue={resolvedValue} />;
}
```

This keeps JSON and markdown synchronous, keeps browser HTML synchronous via `DOMParser`, and isolates the async server HTML path behind an internal Suspense boundary so callers do not need a new wrapper.

- [ ] **Step 6: Re-read the resolver and render surface before rerunning tests**

Read:
- `@acme/ui/src/components/editor/render/resolve-editor-render-content.ts`
- `@acme/ui/src/components/editor/editor-render.tsx`
- `@acme/ui/src/components/editor/render/normalize-editor-content.ts`

Confirm:
- `format` defaults to `json`
- markdown/html conversion happens before `normalizeEditorContent()`
- `normalizeEditorContent()` remains the supported-node validation gate
- object input with non-JSON formats returns `null`
- only the server HTML path is async, and it is isolated behind the internal Suspense wrapper

- [ ] **Step 7: Run the resolver test file again**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/editor/render/resolve-editor-render-content.test.ts
```

Expected after implementation:
- PASS

- [ ] **Step 8: Stop after the resolver tests pass**

Do not expand this task into broad render/parity coverage yet.

---

### Task 4: Add reusable markdown/html fixtures and extend semantic render/parity coverage

**Files:**
- Modify: `@acme/ui/src/components/editor/render/render-fixtures.ts`
- Modify: `@acme/ui/src/components/editor/editor-render.test.tsx`
- Modify: `@acme/ui/src/components/editor/editor-preview-render-parity.test.tsx`
- Inspect: `docs/superpowers/specs/2026-03-27-editor-preview-render-markdown-html-support-design.md`
- Inspect: `@acme/ui/src/components/editor/render/render-fixtures.ts`
- Inspect: `@acme/ui/src/components/editor/editor-render.test.tsx`
- Inspect: `@acme/ui/src/components/editor/editor-preview-render-parity.test.tsx`
- Inspect: `@acme/ui/src/components/editor/transformers/markdown-transformers.ts`
- Test: `@acme/ui/src/components/editor/editor-render.test.tsx`
- Test: `@acme/ui/src/components/editor/editor-preview-render-parity.test.tsx`

- [ ] **Step 1: Re-read the current fixture/test surfaces before changing them**

Read:
- `docs/superpowers/specs/2026-03-27-editor-preview-render-markdown-html-support-design.md`
- `@acme/ui/src/components/editor/render/render-fixtures.ts`
- `@acme/ui/src/components/editor/editor-render.test.tsx`
- `@acme/ui/src/components/editor/editor-preview-render-parity.test.tsx`
- `@acme/ui/src/components/editor/transformers/markdown-transformers.ts`

Expected reminders:
- JSON fixtures already cover the canonical supported publish set
- parity tests are currently JSON-only
- markdown first-pass support should cover paragraph, headings, lists, checklists/check-blocks, links, inline code, tables, and horizontal rules where the transformer stack supports them
- HTML first-pass support should cover paragraph, headings, lists, links, blockquote, code, table, and horizontal rule where Lexical HTML import maps them into supported nodes

- [ ] **Step 2: Add reusable markdown/html source fixtures next to the existing JSON fixtures**

Extend `@acme/ui/src/components/editor/render/render-fixtures.ts` with string fixtures for the supported first-pass formats.

Add a structure close to this:

```ts
export const editorRenderSourceFixtures = {
  paragraph: {
    markdown: "Canonical paragraph content.",
    html: "<p>Canonical paragraph content.</p>",
  },
  heading: {
    markdown: "## Canonical heading content",
    html: "<h2>Canonical heading content</h2>",
  },
  link: {
    markdown: "[Canonical link](https://example.com)",
    html: '<p><a href="https://example.com">Canonical link</a></p>',
  },
  bulletList: {
    markdown: "- First bullet\n- Second bullet\n  - Nested bullet",
    html: "<ul><li>First bullet</li><li>Second bullet<ul><li>Nested bullet</li></ul></li></ul>",
  },
  blockquote: {
    html: "<blockquote><p>Canonical quote content</p></blockquote>",
  },
  checkBlock: {
    markdown: "- [ ] Unchecked check block\n- [x] Checked check block",
  },
  codeBlock: {
    markdown: "```ts\nconst answer = 42;\n```",
    html: "<pre><code>const answer = 42;</code></pre>",
  },
  table: {
    markdown: "| Header A | Header B |\n| --- | --- |\n| Cell A1 | Cell B1 |",
    html: "<table><tr><th>Header A</th><th>Header B</th></tr><tr><td>Cell A1</td><td>Cell B1</td></tr></table>",
  },
  horizontalRule: {
    markdown: "Paragraph above\n\n---\n\nParagraph below",
    html: "<p>Paragraph above</p><hr /><p>Paragraph below</p>",
  },
} as const;

```

If you add unsupported-source fixtures, only add cases whose actual converter output is verified during implementation to hit unsupported publish nodes at the boundary. Do not hardcode assumptions that a particular markdown/html source form will necessarily survive conversion as an unsupported publish node.

- [ ] **Step 3: Extend the failing `EditorRender` tests for markdown/html support**

Add failing tests to `@acme/ui/src/components/editor/editor-render.test.tsx` for:
- markdown paragraph render
- HTML heading render
- markdown nested list render
- HTML link render
- HTML blockquote render
- markdown check-block/checklist semantics
- HTML code block render
- markdown table render
- unsupported markdown/html source input returning `null` only for cases verified during implementation to produce unsupported publish nodes at the boundary
- object input with `format="markdown"` or `format="html"` returning `null`

Add cases close to this:

```tsx
test("renders markdown paragraph content semantically", () => {
  render(
    <EditorRender
      value={editorRenderSourceFixtures.paragraph.markdown}
      format="markdown"
    />,
  );

  const paragraph = screen.getByText("Canonical paragraph content.").closest("p");
  expect(paragraph).not.toBeNull();
});

test("returns null for object input with html format", () => {
  const rendered = render(
    <EditorRender
      value={editorRenderFixtures.paragraph.content}
      format="html"
    />,
  );

  expect(rendered.container.firstChild).toBeNull();
});
```

- [ ] **Step 4: Extend the failing parity tests across all three input formats**

Update `@acme/ui/src/components/editor/editor-preview-render-parity.test.tsx` so the same semantic content is exercised through:
- preview JSON vs render JSON
- preview markdown vs render markdown
- preview HTML vs render HTML

Keep parity semantic, not byte-for-byte DOM identity.

Add a helper close to this:

```tsx
function renderPreviewAndPublish(
  value: string | object,
  format: "json" | "markdown" | "html",
  expectedText: string,
) {
  const previewValue = format === "json" ? JSON.stringify(value) : (value as string);

  const preview = render(
    <EditorPreview
      autoFocus={false}
      value={previewValue}
      format={format}
      placeholder="Preview"
    />,
  );

  const publish = render(
    <EditorRender
      value={value as Parameters<typeof EditorRender>[0]["value"]}
      format={format}
    />,
  );

  return waitFor(() => {
    expect(preview.container).toHaveTextContent(expectedText);
    expect(publish.container).toHaveTextContent(expectedText);
    return { preview, publish };
  });
}
```

Then add parity cases for at least:
- paragraph
- heading + paragraph
- nested list
- link
- markdown checklist/check-block semantics
- HTML checklist/check-block semantics only if verified during implementation to produce the existing supported semantics
- HTML blockquote semantics
- code block
- table

- [ ] **Step 5: Run the render and parity test files and watch them fail**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/editor/editor-render.test.tsx src/components/editor/editor-preview-render-parity.test.tsx
```

Expected before implementation:
- FAIL because the test files still only cover JSON inputs
- FAIL because the new source fixtures and format-aware assertions do not exist yet

- [ ] **Step 6: Make the minimum fixes needed to satisfy the new coverage**

At this point, only adjust:
- `render-fixtures.ts`
- `editor-render.test.tsx`
- `editor-preview-render-parity.test.tsx`
- or tiny gaps exposed in earlier tasks

Do **not** broaden the supported publish node set.
Do **not** add markdown/html-specific rendering branches to `render-node.tsx`.
All non-JSON format handling must stay at the conversion/normalization boundary.

- [ ] **Step 7: Run the render and parity test files again**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/editor/editor-render.test.tsx src/components/editor/editor-preview-render-parity.test.tsx
```

Expected after implementation:
- PASS

- [ ] **Step 8: Stop after the render/parity tests pass**

Leave final broad verification for Task 5.

---

### Task 5: Final verification and export audit

**Files:**
- Inspect: `@acme/ui/src/components/editor/index.ts`
- Inspect: `@acme/ui/src/components/editor/editor-preview.tsx`
- Inspect: `@acme/ui/src/components/editor/editor-render.tsx`
- Inspect: `@acme/ui/src/components/editor/render/normalize-editor-content.ts`
- Inspect: `docs/superpowers/specs/2026-03-27-editor-preview-render-markdown-html-support-design.md`
- Verify: `@acme/ui/src/components/editor/editor-preview.test.tsx`
- Verify: `@acme/ui/src/components/editor/utils/lexical-converter.test.ts`
- Verify: `@acme/ui/src/components/editor/utils/html-converter.test.ts`
- Verify: `@acme/ui/src/components/editor/render/resolve-editor-render-content.test.ts`
- Verify: `@acme/ui/src/components/editor/render/normalize-editor-content.test.ts`
- Verify: `@acme/ui/src/components/editor/editor-render.test.tsx`
- Verify: `@acme/ui/src/components/editor/editor-preview-render-parity.test.tsx`

- [ ] **Step 1: Run the full focused test suite for this feature**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/editor/editor-preview.test.tsx src/components/editor/utils/lexical-converter.test.ts src/components/editor/utils/html-converter.test.ts src/components/editor/render/resolve-editor-render-content.test.ts src/components/editor/render/normalize-editor-content.test.ts src/components/editor/editor-render.test.tsx src/components/editor/editor-preview-render-parity.test.tsx
```

Expected:
- PASS
- all preview/render/input-conversion tests green

- [ ] **Step 2: Run the package's existing typecheck script**

Confirm the script name in `@acme/ui/package.json`, then run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" typecheck
```

Expected:
- PASS
- no TypeScript errors from the widened prop unions or new helper signatures

- [ ] **Step 3: Re-read the final public surface**

Read:
- `@acme/ui/src/components/editor/index.ts`
- `@acme/ui/src/components/editor/editor-preview.tsx`
- `@acme/ui/src/components/editor/editor-render.tsx`

Confirm:
- `EditorPreview` remains exported
- `EditorRender` remains exported
- no internal helper is accidentally exported unless intentionally needed
- `EditorPreview` still reads like a thin wrapper

- [ ] **Step 4: Re-read the final implementation against the approved spec**

Read:
- `docs/superpowers/specs/2026-03-27-editor-preview-render-markdown-html-support-design.md`
- `@acme/ui/src/components/editor/utils/lexical-converter.ts`
- `@acme/ui/src/components/editor/utils/html-converter.ts`
- `@acme/ui/src/components/editor/render/normalize-editor-content.ts`
- `@acme/ui/src/components/editor/render/resolve-editor-render-content.ts`
- `@acme/ui/src/components/editor/editor-preview.tsx`
- `@acme/ui/src/components/editor/editor-render.tsx`

Confirm:
- `EditorPreview` is still client/runtime only
- `EditorRender` still renders through the JSON boundary and semantic renderer only
- markdown/html input conversion happens once at the boundary
- no auto-detection was introduced
- no raw HTML rendering path was introduced
- conversion failure still maps to `null`
- the supported publish node set did not broaden accidentally

- [ ] **Step 5: Stop after verification**

Do not:
- redesign Storybook surfaces in this feature
- add publish support for images, video, mentions, equations, embeds, layout, polls, or other unsupported nodes
- add format auto-detection
- add plain-text or raw HTML fallback behavior
- move markdown/html-specific rendering logic into `render-node.tsx`
- refactor unrelated editor plugins while working on this feature
