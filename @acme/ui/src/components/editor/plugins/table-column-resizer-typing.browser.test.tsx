import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import { $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";
import { markdownToLexicalContent } from "../utils/lexical-converter";

// Runs in the `browser` project: hover and typing are real input.

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

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

const resizer = () =>
  document.querySelector<HTMLElement>("[data-table-column-resizer]");

/**
 * The resize handle is placed at a column boundary when the pointer comes to
 * it. Typing in a cell with the pointer still there widened the column, and
 * the handle stayed at the old boundary — a blue line through the words. As
 * in Notion, typing puts it away; the pointer brings it back where the
 * boundary now is.
 */
test("typing in a cell puts the column resize handle away", async () => {
  let editor: LexicalEditor | null = null;
  render(
    <div style={{ width: 700 }}>
      <Editor autoFocus={false}>
        <EditorRefPlugin onReady={(next) => (editor = next)} />
      </Editor>
    </div>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  live.setEditorState(
    live.parseEditorState(
      JSON.stringify(
        markdownToLexicalContent("| Issue | B |\n| --- | --- |\n| Party | x |"),
      ),
    ),
  );

  const cell = await waitFor(() => {
    const node = [...document.querySelectorAll<HTMLElement>("td")].find(
      (td) => td.textContent === "Party",
    );
    expect(node).toBeDefined();
    return node!;
  });
  await userEvent.click(cell);
  live.update(
    () => {
      const text = $getRoot()
        .getAllTextNodes()
        .find((node) => node.getTextContent() === "Party")!;
      text.select(5, 5);
    },
    { discrete: true },
  );

  // The pointer on the cell's right edge: the plugin reads mousemove.
  const box = cell.getBoundingClientRect();
  cell.dispatchEvent(
    new MouseEvent("mousemove", {
      bubbles: true,
      clientX: box.right - 1,
      clientY: box.top + box.height / 2,
    }),
  );
  await waitFor(() => expect(resizer()).not.toBeNull());

  await userEvent.keyboard(" size limit 99 guests and more");

  await waitFor(() => expect(resizer()).toBeNull());
});
