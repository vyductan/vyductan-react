import type { LexicalNode } from "lexical";
import { createHeadlessEditor } from "@lexical/headless";
import { $createListItemNode, $createListNode } from "@lexical/list";
import { $createTableNodeWithDimensions } from "@lexical/table";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isElementNode,
} from "lexical";
import { describe, expect, test } from "vitest";

import {
  $createLayoutContainerNode,
  $isLayoutContainerNode,
} from "../../nodes/layout-container-node";
import {
  $createLayoutItemNode,
  $isLayoutItemNode,
} from "../../nodes/layout-item-node";
import { nodes } from "../../nodes/nodes";
import { $canDropBeside, $dropBeside, $pruneColumn } from "./column-drop";

function editorWith(build: () => void) {
  const editor = createHeadlessEditor({
    nodes: nodes as never,
    onError: (error) => {
      throw error;
    },
  });
  editor.update(build, { discrete: true });
  return editor;
}

const paragraph = (text: string) =>
  $createParagraphNode().append($createTextNode(text));

/** The document as nested arrays: columns as { columns, template }, blocks as text. */
function $shape(node: LexicalNode = $getRoot()): unknown {
  if ($isLayoutContainerNode(node)) {
    return {
      template: node.getTemplateColumns(),
      columns: node
        .getChildren()
        .map((column) =>
          $isElementNode(column)
            ? column.getChildren().map((c) => $shape(c))
            : null,
        ),
    };
  }
  if (node === $getRoot()) {
    return $getRoot()
      .getChildren()
      .map((child) => $shape(child));
  }
  return node.getTextContent();
}

const shape = (editor: ReturnType<typeof editorWith>) =>
  editor.getEditorState().read(() => $shape());

const byText = (text: string) =>
  $getRoot()
    .getAllTextNodes()
    .find((node) => node.getTextContent() === text)!
    .getParentOrThrow();

describe("$dropBeside", () => {
  test("two blocks on their own become a pair of columns", () => {
    const editor = editorWith(() => {
      $getRoot().append(paragraph("A"), paragraph("B"), paragraph("C"));
    });
    editor.update(() => $dropBeside([byText("C")], byText("A"), "right"), {
      discrete: true,
    });
    expect(shape(editor)).toEqual([
      { template: "1fr 1fr", columns: [["A"], ["C"]] },
      "B",
    ]);
  });

  test("on the left edge the dragged block goes first", () => {
    const editor = editorWith(() => {
      $getRoot().append(paragraph("A"), paragraph("B"));
    });
    editor.update(() => $dropBeside([byText("B")], byText("A"), "left"), {
      discrete: true,
    });
    expect(shape(editor)).toEqual([
      { template: "1fr 1fr", columns: [["B"], ["A"]] },
    ]);
  });

  test("beside a block in a column it becomes a column of its own", () => {
    const editor = editorWith(() => {
      $getRoot().append(
        $createLayoutContainerNode("1fr 1fr").append(
          $createLayoutItemNode().append(paragraph("A"), paragraph("A2")),
          $createLayoutItemNode().append(paragraph("B")),
        ),
        paragraph("C"),
      );
    });
    editor.update(() => $dropBeside([byText("C")], byText("A2"), "right"), {
      discrete: true,
    });
    expect(shape(editor)).toEqual([
      { template: "1fr 1fr 1fr", columns: [["A", "A2"], ["C"], ["B"]] },
    ]);
  });

  test("a column it leaves empty goes; one column left is no columns", () => {
    const editor = editorWith(() => {
      $getRoot().append(
        paragraph("Top"),
        $createLayoutContainerNode("1fr 1fr").append(
          $createLayoutItemNode().append(paragraph("A")),
          $createLayoutItemNode().append(paragraph("B")),
        ),
      );
    });
    editor.update(() => $dropBeside([byText("B")], byText("Top"), "right"), {
      discrete: true,
    });
    expect(shape(editor)).toEqual([
      { template: "1fr 1fr", columns: [["Top"], ["B"]] },
      "A",
    ]);
  });

  test("a list item goes in a list of its own", () => {
    const editor = editorWith(() => {
      $getRoot().append(
        paragraph("A"),
        $createListNode("number").append(
          $createListItemNode().append($createTextNode("one")),
          $createListItemNode().append($createTextNode("two")),
        ),
      );
    });
    editor.update(
      () => {
        const item = $getRoot()
          .getAllTextNodes()
          .find((node) => node.getTextContent() === "two")!
          .getParentOrThrow();
        $dropBeside([item], byText("A"), "right");
      },
      { discrete: true },
    );
    editor.getEditorState().read(() => {
      const [container, list] = $getRoot().getChildren();
      expect($isLayoutContainerNode(container)).toBe(true);
      expect(list!.getTextContent()).toBe("one");
      const column = (
        container as ReturnType<typeof $createLayoutContainerNode>
      ).getChildren()[1];
      expect(column!.getTextContent()).toBe("two");
      expect(
        (column as ReturnType<typeof $createLayoutItemNode>)
          .getFirstChild()!
          .getType(),
      ).toBe("list");
    });
  });
});

describe("$canDropBeside", () => {
  test("not beside itself, not columns in columns, not in a table cell", () => {
    const editor = editorWith(() => {
      $getRoot().append(
        paragraph("A"),
        $createLayoutContainerNode("1fr 1fr").append(
          $createLayoutItemNode().append(paragraph("B")),
          $createLayoutItemNode().append(paragraph("C")),
        ),
        $createTableNodeWithDimensions(1, 1, false),
      );
    });
    editor.getEditorState().read(() => {
      const [a, container, table] = $getRoot().getChildren();
      expect($canDropBeside([a!], a!)).toBe(false);
      expect($canDropBeside([a!], byText("B"))).toBe(true);
      expect($canDropBeside([container!], a!)).toBe(false);
      expect($canDropBeside([byText("B")], a!)).toBe(true);
      // The empty paragraph in the table's one cell.
      if (!$isElementNode(table)) throw new Error("no table");
      const inCell = table.getFirstDescendant()!;
      expect(inCell.getType()).toBe("paragraph");
      expect($canDropBeside([a!], inCell)).toBe(false);
    });
  });
});

describe("$pruneColumn", () => {
  test("an empty column goes; the rest keep, at equal widths", () => {
    const editor = editorWith(() => {
      $getRoot().append(
        $createLayoutContainerNode("2fr 1fr 1fr").append(
          $createLayoutItemNode().append(paragraph("A")),
          $createLayoutItemNode(),
          $createLayoutItemNode().append(paragraph("C")),
        ),
      );
    });
    editor.update(
      () => {
        const container = $getRoot().getFirstChild();
        const empty = $isElementNode(container)
          ? container.getChildAtIndex(1)
          : null;
        $pruneColumn($isLayoutItemNode(empty) ? empty : null);
      },
      { discrete: true },
    );
    expect(shape(editor)).toEqual([
      { template: "1fr 1fr", columns: [["A"], ["C"]] },
    ]);
  });
});
