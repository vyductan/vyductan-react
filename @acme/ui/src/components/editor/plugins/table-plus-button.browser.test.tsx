import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createTableNodeWithDimensions } from "@lexical/table";
import { render, waitFor } from "@testing-library/react";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isParagraphNode,
} from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

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

afterEach(() => {
  document.body.replaceChildren();
  document.body.removeAttribute("style");
});

/**
 * The "+" beside a table adds a line below the table, with the slash menu
 * open on it. It used to act on the paragraph inside the hovered cell: the
 * new line and its "/" landed in the cell.
 */
test("'+' beside a table adds a line below the table, not in a cell", async () => {
  let editor: LexicalEditor | null = null;
  render(
    <div style={{ position: "fixed", top: 150, left: 120, width: 420 }}>
      <Editor autoFocus={false}>
        <EditorRefPlugin onReady={(next) => (editor = next)} />
      </Editor>
    </div>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  live.update(
    () => {
      const table = $createTableNodeWithDimensions(2, 2, false);
      table
        .getFirstDescendant()
        ?.getParent()
        ?.append($createTextNode("cron job"));
      $getRoot().clear().append(table, $createParagraphNode());
    },
    { discrete: true },
  );

  const cell = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"] td p, [contenteditable="true"] th p',
    );
    expect(node?.textContent).toBe("cron job");
    return node!;
  });
  await userEvent.hover(cell);
  const plus = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[data-slot="draggable-block-menu"] > div:first-child',
    );
    expect(node).not.toBeNull();
    return node!;
  });
  await userEvent.click(plus);

  await waitFor(() => {
    const [table, added] = live.getEditorState().read(() =>
      $getRoot()
        .getChildren()
        .map((node) => node),
    );
    expect(table?.getType()).toBe("table");
    expect($isParagraphNode(added)).toBe(true);
    expect(live.getEditorState().read(() => added!.getTextContent())).toBe("/");
  });
  // Nothing was typed into the table.
  expect(document.querySelector("table")?.textContent).not.toContain("/");
  await waitFor(() =>
    expect(document.querySelector('[role="option"]')).not.toBeNull(),
  );
});
