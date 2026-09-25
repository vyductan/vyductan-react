import type { LexicalNode } from "lexical";
import { createHeadlessEditor } from "@lexical/headless";
import {
  $createListItemNode,
  $createListNode,
  $isListNode,
  ListItemNode,
  ListNode,
} from "@lexical/list";
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingNode,
  QuoteNode,
} from "@lexical/rich-text";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
} from "lexical";
import { describe, expect, test } from "vitest";

import { $setBlocksTypeLiftingChildren } from "./set-blocks-type-lifting-children";

function makeEditor() {
  return createHeadlessEditor({
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
    onError: (error) => {
      throw error;
    },
  });
}

/** Each block as its type (list type for lists) and text, nested lists inline. */
function shape(node: LexicalNode): unknown {
  if ($isListNode(node)) {
    return {
      [node.getListType()]: node.getChildren().map((child) => shape(child)),
    };
  }
  if (
    $isElementNode(node) &&
    node.getChildren().some((child) => $isListNode(child))
  ) {
    return node.getChildren().map((child) => shape(child));
  }
  return `${node.getType()}:${node.getTextContent()}`;
}

/** 1. 11 / a. a  b. b  c. c / 2. 22 */
function $buildNestedList() {
  const root = $getRoot();
  root.clear();
  const nested = $createListNode("number").append(
    $createListItemNode().append($createTextNode("a")),
    $createListItemNode().append($createTextNode("b")),
    $createListItemNode().append($createTextNode("c")),
  );
  const parent = $createListItemNode().append($createTextNode("11"));
  root.append(
    $createListNode("number").append(
      parent,
      $createListItemNode().append(nested),
      $createListItemNode().append($createTextNode("22")),
    ),
  );
  const text = parent.getFirstChild();
  if ($isTextNode(text)) text.select(0, 0);
}

function convert(
  create: () =>
    | ReturnType<typeof $createHeadingNode>
    | ReturnType<typeof $createParagraphNode>,
) {
  const editor = makeEditor();
  editor.update(
    () => {
      $buildNestedList();
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksTypeLiftingChildren(selection, create);
      }
    },
    { discrete: true },
  );
  return editor.getEditorState().read(() =>
    $getRoot()
      .getChildren()
      .map((child) => shape(child)),
  );
}

describe("$setBlocksTypeLiftingChildren", () => {
  /**
   * In Notion, turning "1. 11" into a heading brings its nested items up to
   * the top: "a. b. c." become "1. 2. 3.", numbered on with the list after
   * them. Here they stayed nested under nothing, still lettered.
   */
  test("lifts a converted item's nested list to the top, numbered on with the rest", () => {
    expect(convert(() => $createHeadingNode("h3"))).toStrictEqual([
      "heading:11",
      {
        number: ["listitem:a", "listitem:b", "listitem:c", "listitem:22"],
      },
    ]);
  });

  test("does the same when the item becomes plain text", () => {
    expect(convert(() => $createParagraphNode())).toStrictEqual([
      "paragraph:11",
      {
        number: ["listitem:a", "listitem:b", "listitem:c", "listitem:22"],
      },
    ]);
  });

  test("keeps a lifted list apart from a following list of another kind", () => {
    const editor = makeEditor();
    editor.update(
      () => {
        const root = $getRoot();
        root.clear();
        const parent = $createListItemNode().append($createTextNode("11"));
        root.append(
          $createListNode("bullet").append(
            parent,
            $createListItemNode().append(
              $createListNode("number").append(
                $createListItemNode().append($createTextNode("a")),
              ),
            ),
            $createListItemNode().append($createTextNode("22")),
          ),
        );
        const text = parent.getFirstChild();
        if ($isTextNode(text)) text.select(0, 0);
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksTypeLiftingChildren(selection, () => $createQuoteNode());
        }
      },
      { discrete: true },
    );

    expect(
      editor.getEditorState().read(() =>
        $getRoot()
          .getChildren()
          .map((child) => shape(child)),
      ),
    ).toStrictEqual([
      "quote:11",
      { number: ["listitem:a"] },
      { bullet: ["listitem:22"] },
    ]);
  });

  test("changes nothing else about an item without children", () => {
    const editor = makeEditor();
    editor.update(
      () => {
        const root = $getRoot();
        root.clear();
        const only = $createListItemNode().append($createTextNode("solo"));
        root.append(
          $createListNode("number").append(
            only,
            $createListItemNode().append($createTextNode("next")),
          ),
        );
        const text = only.getFirstChild();
        if ($isTextNode(text)) text.select(0, 0);
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksTypeLiftingChildren(selection, () =>
            $createHeadingNode("h2"),
          );
        }
      },
      { discrete: true },
    );

    expect(
      editor.getEditorState().read(() =>
        $getRoot()
          .getChildren()
          .map((child) => shape(child)),
      ),
    ).toStrictEqual(["heading:solo", { number: ["listitem:next"] }]);
  });
});
