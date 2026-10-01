import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { render, waitFor } from "@testing-library/react";
import { $createParagraphNode, $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";

import { Editor } from "../editor";

Object.assign(globalThis, { React });

function EditorRefPlugin({
  onReady,
}: {
  onReady: (editor: LexicalEditor) => void;
}) {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    onReady(editor);
  }, [editor, onReady]);

  return null;
}

afterEach(() => document.body.replaceChildren());

async function pasteIntoEmptyEditor(flavours: Record<string, string>) {
  let editor: LexicalEditor | null = null;

  render(
    <Editor autoFocus={false} resolvePasteLink={async () => null}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );

  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;

  live.update(() => {
    const root = $getRoot();
    root.clear();
    const paragraph = $createParagraphNode();
    root.append(paragraph);
    paragraph.select();
  });

  const contentEditable = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });

  const clipboardData = new DataTransfer();
  for (const [type, value] of Object.entries(flavours)) {
    clipboardData.setData(type, value);
  }

  contentEditable.dispatchEvent(
    new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData,
    }),
  );

  return contentEditable;
}

/**
 * Copied from a chat reply in the Claude desktop app. The HTML has the bold,
 * the inline code, the bullets and the code block; the plain text has none of
 * them, but its first line starts "1. ". That made it look like markdown, so
 * the plain text won and every bit of formatting was thrown away — the whole
 * reply landed as bare lines under a numbered "1.".
 */
test("keeps the formatting of copied HTML whose plain text looks like markdown", async () => {
  const html =
    "<meta charset='utf-8'>" +
    '<p dir="ltr"><strong>1. Canonical riêng cho mỗi tour là gì</strong></p>' +
    '<p dir="ltr">Canonical là một thẻ trong <code>&lt;head&gt;</code> của trang:</p>' +
    '<div><div><div><div><pre>&lt;link rel="canonical" href="https://example.com/tours/" /&gt;</pre></div><div><div></div></div></div></div></div>' +
    '<p dir="ltr">Google dùng nó để:</p>' +
    '<ul dir="ltr"><li><strong>Gộp các bản trùng.</strong> Ví dụ <code>?utm_source=facebook</code>.</li>' +
    "<li><strong>Chọn URL để hiện</strong> trên kết quả tìm kiếm.</li></ul>";
  const text = [
    "1. Canonical riêng cho mỗi tour là gì",
    "",
    "Canonical là một thẻ trong <head> của trang:",
    "",
    '<link rel="canonical" href="https://example.com/tours/" />',
    "",
    "Google dùng nó để:",
    "",
    "Gộp các bản trùng. Ví dụ ?utm_source=facebook.",
    "Chọn URL để hiện trên kết quả tìm kiếm.",
  ].join("\n");

  const root = await pasteIntoEmptyEditor({
    "text/html": html,
    "text/plain": text,
  });

  await waitFor(() => {
    expect(root.querySelectorAll("ul > li")).toHaveLength(2);
  });

  // The heading line stays a bold paragraph, as it was — not a list item.
  const first = root.firstElementChild!;
  expect(first.tagName).toBe("P");
  expect(first.querySelector("strong, b, .font-bold")).not.toBeNull();
  expect(root.querySelector("ol")).toBeNull();

  // Inline code and the code block survive.
  expect(root.querySelectorAll("code").length).toBeGreaterThanOrEqual(1);
  expect(root.textContent).toContain("?utm_source=facebook");
  const codeBlock = [...root.children].find((child) =>
    child.textContent?.includes('rel="canonical"'),
  );
  expect(codeBlock?.tagName).toBe("CODE");
});

/**
 * VS Code and most code editors put markdown source on the clipboard as HTML
 * too — colored spans, no structure. That HTML says nothing the text doesn't,
 * so the markdown still wins.
 */
test("still reads markdown when the HTML beside it is only colored source", async () => {
  const text = ["- first", "- second"].join("\n");
  const html =
    '<meta charset="utf-8"><div style="color: #ccc;"><div><span style="color: #6796e6;">-</span><span> first</span></div>' +
    '<div><span style="color: #6796e6;">-</span><span> second</span></div></div>';

  const root = await pasteIntoEmptyEditor({
    "text/html": html,
    "text/plain": text,
  });

  await waitFor(() => {
    expect(root.querySelectorAll("ul > li")).toHaveLength(2);
  });
});
