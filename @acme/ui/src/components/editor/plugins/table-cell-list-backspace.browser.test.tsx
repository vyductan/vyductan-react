import type { ElementNode, LexicalEditor } from "lexical";
import * as React from "react";
import { $createListItemNode, $createListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createTableNodeWithDimensions,
  $isTableCellNode,
} from "@lexical/table";
import { cleanup, render, waitFor } from "@testing-library/react";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";
import { $isUnmarkedItem } from "../utils/list-marker";

// Runs in the `browser` project: Backspace has to be a real key press so it
// goes through Lexical's own delete handling first.

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

/** The first cell's blocks: "type:text", a list as its items. */
const firstCell = (live: LexicalEditor) =>
  live.getEditorState().read(() => {
    const cell = $getRoot()
      .getFirstChildOrThrow<ElementNode>()
      .getFirstChildOrThrow<ElementNode>()
      .getFirstChildOrThrow();
    if (!$isTableCellNode(cell)) return [];
    return cell.getChildren().map((block) =>
      block.getType() === "list"
        ? `list:${(block as ElementNode)
            .getChildren()
            .map(
              (item) =>
                `${$isUnmarkedItem(item) ? "" : "• "}${item.getTextContent()}`,
            )
            .join("|")}`
        : `${block.getType()}:${block.getTextContent()}`,
    );
  });

/**
 * As in Notion: Backspace at the start of a bullet in a table cell makes it
 * words at the cell's margin. It stayed in the list without its bullet,
 * indented under the item above.
 */
test("Backspace at the start of a bullet in a cell puts its words at the margin", async () => {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  await userEvent.click(
    document.querySelector<HTMLElement>('[contenteditable="true"]')!,
  );
  live.update(
    () => {
      const grid = $createTableNodeWithDimensions(1, 2, false);
      const cell = grid
        .getFirstChildOrThrow<ElementNode>()
        .getFirstChildOrThrow<ElementNode>();
      const v = $createTextNode("v");
      cell
        .clear()
        .append(
          $createParagraphNode().append($createTextNode("abc:")),
          $createListNode("bullet").append(
            $createListItemNode().append($createTextNode("c")),
            $createListItemNode().append(v),
          ),
        );
      $getRoot().clear().append(grid);
      v.select(0, 0);
    },
    { discrete: true },
  );

  await userEvent.keyboard("{Backspace}");

  await waitFor(() =>
    expect(firstCell(live)).toStrictEqual([
      "paragraph:abc:",
      "list:• c",
      "paragraph:v",
    ]),
  );
});
