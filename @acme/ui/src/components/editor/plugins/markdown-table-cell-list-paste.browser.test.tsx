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
 * GFM has no lists in table cells; AI-written tables put them in as
 * `• a<br>• b`. Pasted, the cell showed the `<br>` as text.
 */
test("pastes a markdown table whose cell holds a <br> list as a list in the cell", async () => {
  const contentEditable = await pasteIntoEmptyEditor({
    "text/plain": "| A | B |\n|---|---|\n| x | • a<br>• b |",
  });

  await waitFor(() => {
    const cells = contentEditable.querySelectorAll("td");
    const items = [...(cells[1]?.querySelectorAll("ul > li") ?? [])].map(
      (item) => item.textContent,
    );
    expect(items).toStrictEqual(["a", "b"]);
  });
  expect(contentEditable.textContent).not.toContain("<br>");
});
