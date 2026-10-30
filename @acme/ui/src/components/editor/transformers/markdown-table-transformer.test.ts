import type { ElementNode, LexicalNode } from "lexical";
import { createHeadlessEditor } from "@lexical/headless";
import { $createListItemNode, $createListNode } from "@lexical/list";
import { $createTableNodeWithDimensions } from "@lexical/table";
import { $createTextNode, $getRoot, $setState } from "lexical";
import { describe, expect, test } from "vitest";

import type { LexicalEditorContent } from "../types";
import { nodes } from "../nodes/nodes";
import {
  lexicalContentToMarkdown,
  markdownToLexicalContent,
} from "../utils/lexical-converter";
import { unmarkedState } from "../utils/list-marker";

interface JsonNode {
  type?: string;
  text?: string;
  listType?: string;
  children?: JsonNode[];
}

const textOf = (node: JsonNode): string =>
  node.text ?? (node.children ?? []).map((child) => textOf(child)).join("");

/** The blocks of the cell at [row][column] of the document's first table. */
const cellBlocks = (markdown: string, row: number, column: number) => {
  const root = markdownToLexicalContent(markdown).root as JsonNode;
  const table = root.children?.find((node) => node.type === "table");
  const cell = table?.children?.[row]?.children?.[column];
  return (cell?.children ?? []).map((block) => ({
    type: block.type,
    listType: block.listType,
    items:
      block.type === "list"
        ? (block.children ?? []).map((item) => textOf(item))
        : undefined,
    text: textOf(block),
  }));
};

const table = (cell: string) => `| A | B |\n| --- | --- |\n| x | ${cell} |`;

/**
 * GFM has no lists in table cells. The common reading — GitHub, VS Code and
 * AI-written markdown — is line breaks as `<br>`, items as `• a<br>• b`.
 */
describe("TABLE markdown transformer: lists in cells", () => {
  describe("import", () => {
    test.each(["<br>", "<br/>", "<br />"])(
      "reads • lines split by %s as a bullet list",
      (br) => {
        expect(cellBlocks(table(`• a${br}• b`), 1, 1)).toStrictEqual([
          { type: "list", listType: "bullet", items: ["a", "b"], text: "ab" },
        ]);
      },
    );

    test.each(["- ", "* "])("reads %s lines as a bullet list", (marker) => {
      expect(cellBlocks(table(`${marker}a<br>${marker}b`), 1, 1)).toStrictEqual(
        [{ type: "list", listType: "bullet", items: ["a", "b"], text: "ab" }],
      );
    });

    test("reads 1. lines as a numbered list", () => {
      expect(cellBlocks(table("1. a<br>2. b"), 1, 1)).toStrictEqual([
        { type: "list", listType: "number", items: ["a", "b"], text: "ab" },
      ]);
    });

    test("still reads the old literal \\n line breaks", () => {
      expect(cellBlocks(table(String.raw`- a\n- b`), 1, 1)).toStrictEqual([
        { type: "list", listType: "bullet", items: ["a", "b"], text: "ab" },
      ]);
    });

    test("reads an escaped pipe as text, not a cell boundary", () => {
      expect(cellBlocks(table(String.raw`a\|b`), 1, 1)).toStrictEqual([
        {
          type: "paragraph",
          listType: undefined,
          items: undefined,
          text: "a|b",
        },
      ]);
    });
  });

  describe("export", () => {
    test("writes a bullet list as • items joined by <br>", () => {
      const out = lexicalContentToMarkdown(
        markdownToLexicalContent(table("• one<br>• two")),
      );
      expect(out).toContain("| x | • one<br>• two |");
    });

    test("writes a numbered list as 1. 2. items joined by <br>", () => {
      const out = lexicalContentToMarkdown(
        markdownToLexicalContent(table("1. one<br>2. two")),
      );
      expect(out).toContain("| x | 1. one<br>2. two |");
    });

    test("joins paragraphs with <br> and escapes pipes", () => {
      const out = lexicalContentToMarkdown(
        markdownToLexicalContent(table(String.raw`first a\|b<br>second`)),
      );
      expect(out).toContain(String.raw`| x | first a\|b<br>second |`);
    });
  });

  test("round-trips a list in a cell", () => {
    const once = lexicalContentToMarkdown(
      markdownToLexicalContent(table("• a<br>• b")),
    );
    expect(cellBlocks(once, 1, 1)).toStrictEqual([
      { type: "list", listType: "bullet", items: ["a", "b"], text: "ab" },
    ]);
    expect(lexicalContentToMarkdown(markdownToLexicalContent(once))).toBe(once);
  });

  /**
   * Items nested by Tab in a cell came back flat after a reload: the nesting
   * went out as a tab, which Prettier, formatting on save, folds to a space.
   */
  test("writes a nested list's indent as &nbsp; and reads it back", () => {
    const once = lexicalContentToMarkdown(
      markdownToLexicalContent(table("• a<br>  • b<br>• c")),
    );
    expect(once).toContain("| x | • a<br>&nbsp;&nbsp;• b<br>• c |");

    const root = markdownToLexicalContent(once).root as JsonNode;
    const cell = root.children?.find((node) => node.type === "table")
      ?.children?.[1]?.children?.[1];
    const [list] = cell?.children ?? [];
    expect(list?.children?.map((item) => textOf(item))).toStrictEqual([
      "a",
      "b",
      "c",
    ]);
    // b sits in a list of its own, nested under a.
    expect(list?.children?.[1]?.children?.[0]?.type).toBe("list");
    expect(lexicalContentToMarkdown(markdownToLexicalContent(once))).toBe(once);
  });
});

/** A one-row table whose second cell holds `build()`, as the editor saves it. */
function tableWith(build: () => LexicalNode[]): LexicalEditorContent {
  const editor = createHeadlessEditor({ nodes: nodes as never });
  editor.update(
    () => {
      const grid = $createTableNodeWithDimensions(1, 2, false);
      const cell = grid
        .getFirstChildOrThrow<ElementNode>()
        .getLastChildOrThrow<ElementNode>();
      cell.clear().append(...build());
      $getRoot().clear().append(grid);
    },
    { discrete: true },
  );
  return editor.getEditorState().toJSON() as LexicalEditorContent;
}

/**
 * Backspace at the start of a list item in a cell takes its bullet off.
 * Saved and reloaded, the bullet was back.
 */
test("a list item's bullet taken off in a cell stays off across a save", () => {
  const item = (words: string, unmarked = false) => {
    const node = $createListItemNode().append($createTextNode(words));
    if (unmarked) $setState(node, unmarkedState, true);
    return node;
  };
  const once = lexicalContentToMarkdown(
    tableWith(() => [
      $createListNode("bullet").append(
        item("Làm gì:", true),
        item("Duyệt"),
        item("Nơi gọi:", true),
        item("api"),
      ),
    ]),
  );
  expect(once).toContain("| Làm gì:<br>• Duyệt<br>Nơi gọi:<br>• api |");

  const root = markdownToLexicalContent(once).root as JsonNode & {
    children?: (JsonNode & { $?: { unmarked?: boolean } })[];
  };
  const cell = root.children?.find((node) => node.type === "table")
    ?.children?.[0]?.children?.[1] as JsonNode;
  const lines = (cell.children ?? []).flatMap((block) =>
    block.type === "list"
      ? (block.children ?? []).map(
          (child) =>
            `${(child as { $?: { unmarked?: boolean } }).$?.unmarked ? "" : "• "}${textOf(child)}`,
        )
      : [textOf(block)],
  );
  expect(lines).toStrictEqual(["Làm gì:", "• Duyệt", "Nơi gọi:", "• api"]);
  expect(lexicalContentToMarkdown(markdownToLexicalContent(once))).toBe(once);
});
