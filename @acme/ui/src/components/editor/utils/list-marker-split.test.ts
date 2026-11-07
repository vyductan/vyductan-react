import { createHeadlessEditor } from "@lexical/headless";
import {
  $createListItemNode,
  $createListNode,
  $isListItemNode,
  $isListNode,
} from "@lexical/list";
import { $createTextNode, $getRoot } from "lexical";
import { expect, test } from "vitest";

import { nodes } from "../nodes/nodes";
import { $isUnmarkedItem, $splitNestedLists } from "./list-marker";

/** Each item of the top list: its words, `[n]` for a holder of n items, `~` unmarked. */
function shape(editor: ReturnType<typeof createHeadlessEditor>) {
  return editor.getEditorState().read(() => {
    const list = $getRoot().getFirstChildOrThrow();
    if (!$isListNode(list)) return [];
    return list.getChildren().map((item) => {
      if (!$isListItemNode(item)) return "?";
      const only = item.getFirstChild();
      if (item.getChildrenSize() === 1 && $isListNode(only)) {
        return `[${only.getChildrenSize()}]`;
      }
      return `${$isUnmarkedItem(item) ? "~" : ""}${item.getTextContent()}`;
    });
  });
}

test("words and a nested list in one item become the item and a holder", () => {
  const editor = createHeadlessEditor({
    nodes: nodes as never,
    onError: (error) => {
      throw error;
    },
  });
  editor.update(
    () => {
      const item = $createListItemNode().append(
        $createTextNode("Third try:"),
        $createListNode("bullet").append(
          $createListItemNode().append($createTextNode("a")),
          $createListItemNode().append($createTextNode("b")),
        ),
        $createTextNode("after"),
      );
      $getRoot().append(
        $createListNode("bullet").append(
          item,
          $createListItemNode().append($createTextNode("next")),
        ),
      );
      $splitNestedLists(item);
    },
    { discrete: true },
  );
  expect(shape(editor)).toStrictEqual(["Third try:", "[2]", "~after", "next"]);
});
