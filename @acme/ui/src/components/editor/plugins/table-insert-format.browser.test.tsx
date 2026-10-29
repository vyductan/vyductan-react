import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isTableNode } from "@lexical/table";
import { cleanup, render, waitFor } from "@testing-library/react";
import {
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
} from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";
import { markdownToLexicalContent } from "../utils/lexical-converter";
import { $insertTableColumn } from "../utils/table-insert";

// Runs in the `browser` project: the typing is real input.

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

async function tableWithCaretAfterCode() {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  live.setEditorState(
    live.parseEditorState(
      JSON.stringify(
        markdownToLexicalContent(
          "| # | Why |\n| --- | --- |\n| 1 | ghi cứng `api.stripe.com` |",
        ),
      ),
    ),
  );
  document.querySelector<HTMLElement>('[contenteditable="true"]')!.focus();
  // The caret at the end of the code, as typing or a click leaves it: the
  // selection itself carries the code format.
  live.update(
    () => {
      const code = $getRoot()
        .getAllTextNodes()
        .find((node) => node.getTextContent() === "api.stripe.com")!;
      code.select(code.getTextContentSize(), code.getTextContentSize());
      const selection = $getSelection();
      if ($isRangeSelection(selection)) selection.setFormat(code.getFormat());
    },
    { discrete: true },
  );
  return live;
}

/**
 * The + button adds a column from the caret, and Lexical keeps the
 * selection's format when it moves the caret into the new cell: with the
 * caret at the end of inline code, what was typed there came out as code.
 * A new cell starts plain.
 */
test("a new column's cell starts plain", async () => {
  const live = await tableWithCaretAfterCode();
  live.update(
    () => {
      const cell = $getRoot()
        .getAllTextNodes()
        .find((node) => node.getTextContent() === "api.stripe.com")!
        .getParentOrThrow()
        .getParentOrThrow();
      if ($isElementNode(cell)) cell.selectEnd();
      $insertTableColumn(true);
    },
    { discrete: true },
  );

  await userEvent.keyboard("Re");

  await waitFor(() =>
    expect(
      live.getEditorState().read(() =>
        $getRoot()
          .getAllTextNodes()
          .filter((node) => node.getTextContent() === "Re")
          .map((node) => node.hasFormat("code")),
      ),
    ).toStrictEqual([false]),
  );
});

/**
 * Cmd+Z after adding a column and typing in it: every row keeps the same
 * number of cells, back to the table as it was.
 */
test("undoing a new column leaves the table whole", async () => {
  const live = await tableWithCaretAfterCode();
  const cellCounts = () =>
    live.getEditorState().read(() => {
      const table = $getRoot().getChildren().find($isTableNode);
      return table
        ? table
            .getChildren()
            .map((row) => ($isElementNode(row) ? row.getChildrenSize() : -1))
        : [];
    });
  live.update(() => $insertTableColumn(true), { discrete: true });
  await userEvent.keyboard("Re");
  await waitFor(() => expect(cellCounts()).toStrictEqual([3, 3]));

  for (let step = 0; step < 4; step++) {
    await userEvent.keyboard("{ControlOrMeta>}z{/ControlOrMeta}");
    await new Promise((resolve) => setTimeout(resolve, 50));
    const counts = cellCounts();
    expect(new Set(counts).size).toBe(1);
  }
  expect(cellCounts()).toStrictEqual([2, 2]);
});
