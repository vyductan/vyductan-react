# Editor Playground Output Formatting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Playground output panel display prettier JSON and HTML while preserving raw editor payloads and keeping format switching non-destructive.

**Architecture:** Keep the change isolated to the Storybook Playground. Add small display-only formatting helpers in the Playground demo, compute a rendered output string from the active format and raw value, and extend the existing Playground tests to lock down pretty display plus non-reset tab switching. Do not modify editor serialization in the shared editor component.

**Tech Stack:** React, TypeScript, Testing Library, Vitest, Storybook Playground demo

---

## File structure

- **Modify:** `@acme/ui/src/components/editor/demo/playground.tsx`
  - Add display-only helpers for JSON and HTML output formatting.
  - Compute a formatted `displayValue` for the output panel.
  - Keep raw `values` state unchanged.
- **Modify:** `@acme/ui/src/components/editor/demo/playground.test.tsx`
  - Add/adjust tests for pretty JSON output, pretty HTML output, and preserved content across format switches.
- **Reference:** `docs/superpowers/specs/2026-03-26-editor-playground-output-formatting-design.md`
  - Source of truth for scope and behavior.

## Constraints

- Do **not** change `@acme/ui/src/components/editor/editor.tsx`.
- Do **not** change the actual payload stored in `values`.
- Do **not** add a raw/pretty toggle.
- Do **not** change preset labels, preset data, or preset-driven remount behavior.
- Do **not** add reset behavior on format tab switches.

## Task 1: Lock down pretty JSON output in the panel

**Files:**
- Modify: `@acme/ui/src/components/editor/demo/playground.test.tsx`
- Modify: `@acme/ui/src/components/editor/demo/playground.tsx`
- Test: `@acme/ui/src/components/editor/demo/playground.test.tsx`

- [ ] **Step 1: Write the failing test**

Add a focused test in `@acme/ui/src/components/editor/demo/playground.test.tsx` that renders `PlaygroundDemo`, types minified JSON into the JSON editor, and asserts that the `Serialized output` panel shows multi-line pretty JSON with indentation while the JSON editor textbox still keeps the original raw/minified string.

Example assertion shape:

```tsx
test("pretty-formats json in the output panel", async () => {
  render(createElement(PlaygroundDemo));

  const rawJson = '{"root":{"type":"root","children":[]}}';

  fireEvent.change(screen.getByRole("textbox", { name: /json editor/i }), {
    target: { value: rawJson },
  });

  await waitFor(() => {
    const output = screen.getByLabelText(/serialized output/i).textContent ?? "";
    expect(output).toMatch(/"root": \{/i);
    expect(output).toContain("\n");
    expect(output).toContain('  "root"');
    expect(screen.getByRole("textbox", { name: /json editor/i })).toHaveValue(rawJson);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/editor/demo/playground.test.tsx
```

Expected: FAIL because the output panel still renders raw `activeValue` instead of pretty JSON.

- [ ] **Step 3: Write minimal implementation**

In `@acme/ui/src/components/editor/demo/playground.tsx`:

1. Add a helper near the top of the file:

```ts
function formatJsonOutput(value: string): string {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}
```

2. Add a `displayValue` computation near `activeValue` / `outputTitle`:

```ts
const displayValue = React.useMemo(() => {
  if (!activeValue) {
    return "No content yet";
  }

  if (activeFormat === "json") {
    return formatJsonOutput(activeValue);
  }

  return activeValue;
}, [activeFormat, activeValue]);
```

3. Update the output panel to render `displayValue` instead of `activeValue || "No content yet"`.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/editor/demo/playground.test.tsx
```

Expected: the new JSON formatting test passes.

- [ ] **Step 5: Commit**

```bash
git add @acme/ui/src/components/editor/demo/playground.tsx @acme/ui/src/components/editor/demo/playground.test.tsx
git commit -m "feat: pretty-print playground json output"
```

## Task 2: Lock down pretty HTML output in the panel

**Files:**
- Modify: `@acme/ui/src/components/editor/demo/playground.test.tsx`
- Modify: `@acme/ui/src/components/editor/demo/playground.tsx`
- Test: `@acme/ui/src/components/editor/demo/playground.test.tsx`

- [ ] **Step 1: Write the failing test**

Add a focused test that switches to HTML mode, types compact HTML with nested block structure into the HTML editor, and asserts that the output panel contains line breaks plus nested indentation while the HTML editor textbox still keeps the original raw string.

Example assertion shape:

```tsx
test("pretty-formats cleaned html in the output panel", async () => {
  render(createElement(PlaygroundDemo));

  const rawHtml = "<section><h1>Welcome</h1><div><p>Hello</p><ul><li>One</li></ul></div></section>";

  fireEvent.click(screen.getByRole("button", { name: "HTML" }));
  fireEvent.change(screen.getByRole("textbox", { name: /html editor/i }), {
    target: { value: rawHtml },
  });

  await waitFor(() => {
    const output = screen.getByLabelText(/serialized output/i).textContent ?? "";
    expect(output).toContain("<section>");
    expect(output).toContain("\n");

    const divIndent = output.match(/\n(\s+)<div>/)?.[1]?.length ?? 0;
    const ulIndent = output.match(/\n(\s+)<ul>/)?.[1]?.length ?? 0;
    const liIndent = output.match(/\n(\s+)<li>One<\/li>/)?.[1]?.length ?? 0;

    expect(divIndent).toBeGreaterThan(0);
    expect(ulIndent).toBeGreaterThan(divIndent);
    expect(liIndent).toBeGreaterThan(ulIndent);
    expect(screen.getByRole("textbox", { name: /html editor/i })).toHaveValue(rawHtml);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/editor/demo/playground.test.tsx
```

Expected: FAIL because HTML output is still rendered as the raw single-line string.

- [ ] **Step 3: Write minimal implementation**

In `@acme/ui/src/components/editor/demo/playground.tsx` add a small helper that prettifies HTML for display only.

Suggested shape:

```ts
function formatHtmlOutput(value: string): string {
  try {
    const document = new DOMParser().parseFromString(value, "text/html");
    const blockTags = new Set([
      "article",
      "aside",
      "blockquote",
      "div",
      "figcaption",
      "figure",
      "footer",
      "header",
      "li",
      "main",
      "nav",
      "ol",
      "p",
      "section",
      "table",
      "tbody",
      "td",
      "tfoot",
      "th",
      "thead",
      "tr",
      "ul",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
    ]);

    function formatNode(node: ChildNode, depth: number): string {
      // Render text nodes as trimmed inline text when present.
      // Render element nodes recursively.
      // Add line breaks and indentation only for block elements.
      return "";
    }

    const formatted = Array.from(document.body.childNodes)
      .map((node) => formatNode(node, 0))
      .filter(Boolean)
      .join("\n");

    return formatted || value;
  } catch {
    return value;
  }
}
```

The formatter must be recursive and must handle nested block structure, not just top-level siblings. Keep it whitespace-only: line breaks and stable indentation around nested block elements, with no intentional semantic rewriting.

Then extend `displayValue`:

```ts
if (activeFormat === "html") {
  return formatHtmlOutput(activeValue);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/editor/demo/playground.test.tsx
```

Expected: the new HTML formatting test passes and existing Playground tests remain green.

- [ ] **Step 5: Commit**

```bash
git add @acme/ui/src/components/editor/demo/playground.tsx @acme/ui/src/components/editor/demo/playground.test.tsx
git commit -m "feat: pretty-print playground html output"
```

## Task 3: Lock down non-reset format switching behavior

**Files:**
- Modify: `@acme/ui/src/components/editor/demo/playground.test.tsx`
- Modify: `@acme/ui/src/components/editor/demo/playground.tsx` (only if a bug is confirmed)
- Test: `@acme/ui/src/components/editor/demo/playground.test.tsx`

- [ ] **Step 1: Write the failing test**

Add a test that proves each format preserves its own content when the user switches tabs across JSON, Markdown, and HTML.

Suggested sequence:

1. Render `PlaygroundDemo`.
2. Type a custom JSON string in the JSON editor.
3. Switch to Markdown and type custom markdown.
4. Switch to HTML and type custom HTML.
5. Switch back to JSON and assert the JSON editor still contains the custom JSON.
6. Switch back to Markdown and assert the markdown editor still contains the custom markdown.
7. Switch back to HTML and assert the HTML editor still contains the custom HTML.

Example shape:

```tsx
test("preserves format content when switching tabs", async () => {
  render(createElement(PlaygroundDemo));

  const rawJson = '{"root":{"type":"root","children":[]}}';
  const rawMarkdown = "# Draft markdown";
  const rawHtml = "<p>Draft html</p>";

  fireEvent.change(screen.getByRole("textbox", { name: /json editor/i }), {
    target: { value: rawJson },
  });

  fireEvent.click(screen.getByRole("button", { name: "Markdown" }));
  fireEvent.change(screen.getByRole("textbox", { name: /markdown editor/i }), {
    target: { value: rawMarkdown },
  });

  fireEvent.click(screen.getByRole("button", { name: "HTML" }));
  fireEvent.change(screen.getByRole("textbox", { name: /html editor/i }), {
    target: { value: rawHtml },
  });

  fireEvent.click(screen.getByRole("button", { name: "JSON" }));
  expect(screen.getByRole("textbox", { name: /json editor/i })).toHaveValue(rawJson);

  fireEvent.click(screen.getByRole("button", { name: "Markdown" }));
  expect(screen.getByRole("textbox", { name: /markdown editor/i })).toHaveValue(rawMarkdown);

  fireEvent.click(screen.getByRole("button", { name: "HTML" }));
  expect(screen.getByRole("textbox", { name: /html editor/i })).toHaveValue(rawHtml);
});
```

- [ ] **Step 2: Run test to verify it fails or confirm current behavior**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/editor/demo/playground.test.tsx
```

Expected:
- If the current Playground already preserves content, the test may pass immediately. In that case, keep the test as regression coverage and make **no production change** for this task.
- If it fails, the failure should show where the current tab-switch path is causing a reset.

- [ ] **Step 3: Write minimal implementation only if the test proves a real bug**

If the test fails, update only the Playground tab-switch logic in `@acme/ui/src/components/editor/demo/playground.tsx` so switching formats changes `activeFormat` without clearing or reinitializing the stored `values` for any format.

Do **not** alter preset-driven `editorResetKeys` logic unless the failing test shows that path is incorrectly coupled to tab switching.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/editor/demo/playground.test.tsx
```

Expected: the new switching test passes, and the existing preset remount test still passes.

- [ ] **Step 5: Commit**

If production code changed:

```bash
git add @acme/ui/src/components/editor/demo/playground.tsx @acme/ui/src/components/editor/demo/playground.test.tsx
git commit -m "fix: preserve playground content across format switches"
```

If only tests changed because behavior was already correct:

```bash
git add @acme/ui/src/components/editor/demo/playground.test.tsx
git commit -m "test: cover playground format switching state"
```

## Task 4: Lock down markdown output as raw text

**Files:**
- Modify: `@acme/ui/src/components/editor/demo/playground.test.tsx`
- Modify: `@acme/ui/src/components/editor/demo/playground.tsx` (only if a bug is confirmed)
- Test: `@acme/ui/src/components/editor/demo/playground.test.tsx`

- [ ] **Step 1: Write the failing test**

Add a focused Markdown test that switches to Markdown mode, types custom markdown containing headings and list markers, and asserts that the output panel text matches the raw markdown exactly instead of being reformatted.

Example shape:

```tsx
test("keeps markdown output raw in the panel", async () => {
  render(createElement(PlaygroundDemo));

  const rawMarkdown = "# Heading\n\n- one\n- two";

  fireEvent.click(screen.getByRole("button", { name: "Markdown" }));
  fireEvent.change(screen.getByRole("textbox", { name: /markdown editor/i }), {
    target: { value: rawMarkdown },
  });

  await waitFor(() => {
    expect(screen.getByRole("textbox", { name: /markdown editor/i })).toHaveValue(rawMarkdown);
    expect(screen.getByLabelText(/serialized output/i).textContent).toBe(rawMarkdown);
  });
});
```

- [ ] **Step 2: Run test to verify it fails or confirm current behavior**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/editor/demo/playground.test.tsx
```

Expected:
- If Markdown already stays raw, the test may pass immediately. In that case, keep the test and make no production change.
- If it fails, the failure should show that the new display formatting logic is incorrectly touching Markdown.

- [ ] **Step 3: Write minimal implementation only if the test proves a real bug**

If the test fails, update only the `displayValue` computation in `@acme/ui/src/components/editor/demo/playground.tsx` so Markdown returns the raw `activeValue` unchanged.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/editor/demo/playground.test.tsx
```

Expected: the Markdown raw-output test passes and the JSON/HTML formatting tests still pass.

- [ ] **Step 5: Commit**

If production code changed:

```bash
git add @acme/ui/src/components/editor/demo/playground.tsx @acme/ui/src/components/editor/demo/playground.test.tsx
git commit -m "fix: keep playground markdown output raw"
```

If only tests changed because behavior was already correct:

```bash
git add @acme/ui/src/components/editor/demo/playground.test.tsx
git commit -m "test: cover raw markdown playground output"
```

## Task 5: Final focused verification

**Files:**
- Verify: `@acme/ui/src/components/editor/demo/playground.tsx`
- Verify: `@acme/ui/src/components/editor/demo/playground.test.tsx`

- [ ] **Step 1: Run the focused Playground test file**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/editor/demo/playground.test.tsx
```

Expected: PASS with all Playground tests green.

- [ ] **Step 2: Inspect the final output rendering code**

Verify in `@acme/ui/src/components/editor/demo/playground.tsx` that:

- JSON formatting is display-only.
- HTML formatting is display-only.
- Markdown output still renders raw text.
- The panel renders `displayValue`, not the raw `activeValue`.
- Preset resets remain intact.

- [ ] **Step 3: Commit the final verification-ready state if needed**

If any final cleanup edit was required:

```bash
git add @acme/ui/src/components/editor/demo/playground.tsx @acme/ui/src/components/editor/demo/playground.test.tsx
git commit -m "test: verify playground output formatting behavior"
```
