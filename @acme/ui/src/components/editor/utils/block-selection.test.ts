import type { LexicalNode } from "lexical";
import { createHeadlessEditor } from "@lexical/headless";
import {
  $createListItemNode,
  $createListNode,
  $isListNode,
  ListItemNode,
  ListNode,
} from "@lexical/list";
import { $createHeadingNode, HeadingNode, QuoteNode } from "@lexical/rich-text";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isElementNode,
  $isTextNode,
} from "lexical";
import { describe, expect, test } from "vitest";

import {
  $selectedBlocks,
  $turnSelectedBlocksIntoList,
} from "./block-selection";

function makeEditor() {
  return createHeadlessEditor({
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
    onError: (error) => {
      throw error;
    },
  });
}

const item = (text: string) =>
  $createListItemNode().append($createTextNode(text));

/** 1. 11 / a. a  b. b  c. c / 2. 22, then a paragraph. */
function $build() {
  $getRoot()
    .clear()
    .append(
      $createListNode("number").append(
        item("11"),
        $createListItemNode().append(
          $createListNode("number").append(item("a"), item("b"), item("c")),
        ),
        item("22"),
      ),
      $createParagraphNode().append($createTextNode("after")),
    );
}

function $selectText(from: string, to: string) {
  const texts = $getRoot().getAllTextNodes();
  const start = texts.find((node) => node.getTextContent() === from)!;
  const end = texts.find((node) => node.getTextContent() === to)!;
  const selection = start.select(0, 0);
  selection.focus.set(end.getKey(), end.getTextContentSize(), "text");
}

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

function run(
  build: () => void,
  act: (editor: ReturnType<typeof makeEditor>) => unknown,
) {
  const editor = makeEditor();
  let result: unknown;
  editor.update(
    () => {
      build();
      result = act(editor);
    },
    { discrete: true },
  );
  return {
    result,
    tree: editor.getEditorState().read(() =>
      $getRoot()
        .getChildren()
        .map((child) => shape(child)),
    ),
  };
}

describe("$selectedBlocks", () => {
  /**
   * Notion takes each list line for a block of its own. Three items of one
   * list are three blocks, though they share a top-level list — which is why
   * the top-level-only selection never lit them up.
   */
  test("takes each list line for a block", () => {
    const { result } = run(
      () => {
        $build();
        $selectText("a", "c");
      },
      () => $selectedBlocks().map((node) => node.getTextContent()),
    );
    expect(result).toStrictEqual(["a", "b", "c"]);
  });

  test("runs on across list and paragraph", () => {
    const { result } = run(
      () => {
        $build();
        $selectText("c", "after");
      },
      () => $selectedBlocks().map((node) => node.getTextContent()),
    );
    expect(result).toStrictEqual(["c", "22", "after"]);
  });

  test("is text, not blocks, inside a single line", () => {
    const { result } = run(
      () => {
        $build();
        const text = $getRoot()
          .getAllTextNodes()
          .find((node) => node.getTextContent() === "after");
        if ($isTextNode(text)) text.select(0, 3);
      },
      () => $selectedBlocks().length,
    );
    expect(result).toBe(0);
  });
});

describe("$turnSelectedBlocksIntoList", () => {
  test("turns three numbered lines into bullets, and only them", () => {
    const { tree } = run(
      () => {
        $build();
        $selectText("a", "c");
      },
      () => $turnSelectedBlocksIntoList("bullet"),
    );
    expect(tree).toStrictEqual([
      {
        number: [
          "listitem:11",
          [{ bullet: ["listitem:a", "listitem:b", "listitem:c"] }],
          "listitem:22",
        ],
      },
      "paragraph:after",
    ]);
  });

  test("splits a list when only some of its lines are turned", () => {
    const { tree } = run(
      () => {
        $build();
        $selectText("b", "c");
      },
      () => $turnSelectedBlocksIntoList("bullet"),
    );
    expect(tree).toStrictEqual([
      {
        number: [
          "listitem:11",
          [{ number: ["listitem:a"] }],
          [{ bullet: ["listitem:b", "listitem:c"] }],
          "listitem:22",
        ],
      },
      "paragraph:after",
    ]);
  });

  test("brings a paragraph and a heading into the list beside them", () => {
    const { tree } = run(
      () => {
        $getRoot()
          .clear()
          .append(
            $createListNode("bullet").append(item("one")),
            $createParagraphNode().append($createTextNode("two")),
            $createHeadingNode("h2").append($createTextNode("three")),
          );
        $selectText("two", "three");
      },
      () => $turnSelectedBlocksIntoList("bullet"),
    );
    expect(tree).toStrictEqual([
      { bullet: ["listitem:one", "listitem:two", "listitem:three"] },
    ]);
  });
});
