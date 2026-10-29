import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createTableNodeWithDimensions,
  $isTableCellNode,
} from "@lexical/table";
import { cleanup, render, waitFor } from "@testing-library/react";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isElementNode,
} from "lexical";
import { afterEach, expect, test } from "vitest";

import { Editor } from "../editor";
import { $createCheckBlockNode } from "../nodes/check-block-node";

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

/** The first cell's blocks, by type and text. */
const firstCell = (live: LexicalEditor) =>
  live.getEditorState().read(() => {
    const table = $getRoot().getLastChildOrThrow();
    if (!$isElementNode(table)) return [];
    const row = table.getFirstChildOrThrow();
    if (!$isElementNode(row)) return [];
    const first = row.getFirstChildOrThrow();
    if (!$isTableCellNode(first)) return [];
    return first
      .getChildren()
      .map((block) => `${block.getType()}:${block.getTextContent()}`);
  });

/**
 * As Notion has it: the words of a to-do, selected and pasted into a table
 * cell, go in as words. The cell took the to-do, checkbox and all.
 */
test("a to-do's words pasted into an empty cell come in without the checkbox", async () => {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  const root = document.querySelector<HTMLElement>('[contenteditable="true"]')!;
  root.focus();
  live.update(
    () => {
      const words = $createTextNode("Oishii Tours");
      const todo = $createCheckBlockNode(false).append(words);
      todo.setIndent(1);
      $getRoot()
        .clear()
        .append(todo, $createTableNodeWithDimensions(1, 2, false));
      words.select(0, words.getTextContentSize());
    },
    { discrete: true },
  );

  const clipboardData = new DataTransfer();
  root.dispatchEvent(
    new ClipboardEvent("copy", {
      bubbles: true,
      cancelable: true,
      clipboardData,
    }),
  );
  // The VS Code webview's clipboard keeps the HTML, not Lexical's own type.
  clipboardData.clearData("application/x-lexical-editor");
  live.update(
    () => {
      const table = $getRoot().getLastChildOrThrow();
      if (!$isElementNode(table)) return;
      const cell = table.getFirstDescendant();
      (cell ?? table).selectStart();
    },
    { discrete: true },
  );
  root.dispatchEvent(
    new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData,
    }),
  );

  await waitFor(() =>
    expect(firstCell(live)).toStrictEqual(["paragraph:Oishii Tours"]),
  );
});

/** A plain line's words still paste into a cell as they did. */
test("a paragraph's words pasted into an empty cell stay words", async () => {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  const root = document.querySelector<HTMLElement>('[contenteditable="true"]')!;
  root.focus();
  live.update(
    () => {
      const words = $createTextNode("Stripe");
      const line = $createParagraphNode().append(words);
      $getRoot()
        .clear()
        .append(line, $createTableNodeWithDimensions(1, 2, false));
      words.select(0, words.getTextContentSize());
    },
    { discrete: true },
  );

  const clipboardData = new DataTransfer();
  root.dispatchEvent(
    new ClipboardEvent("copy", {
      bubbles: true,
      cancelable: true,
      clipboardData,
    }),
  );
  live.update(
    () => {
      const table = $getRoot().getLastChildOrThrow();
      if (!$isElementNode(table)) return;
      (table.getFirstDescendant() ?? table).selectStart();
    },
    { discrete: true },
  );
  root.dispatchEvent(
    new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData,
    }),
  );

  await waitFor(() =>
    expect(firstCell(live)).toStrictEqual(["paragraph:Stripe"]),
  );
});
