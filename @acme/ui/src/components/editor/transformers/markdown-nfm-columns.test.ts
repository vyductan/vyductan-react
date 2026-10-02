import { describe, expect, test } from "vitest";

import {
  lexicalContentToMarkdown,
  markdownToLexicalContent,
} from "../utils/lexical-converter";

/**
 * Notion's columns, as its markdown API writes them — each column's blocks
 * two tabs deep:
 *
 *   <columns>
 *   	<column>
 *   		Left
 *   	</column>
 *   	<column>
 *   		Right
 *   	</column>
 *   </columns>
 *
 * read into the editor's own column layout, so the blocks in them can be
 * edited, and written back in the same form.
 * https://developers.notion.com/guides/data-apis/enhanced-markdown
 */

interface JsonNode {
  type?: string;
  text?: string;
  templateColumns?: string;
  listType?: string;
  children?: JsonNode[];
}

const textOf = (node: JsonNode): string =>
  node.text ?? (node.children ?? []).map((child) => textOf(child)).join("");

const columns = (...bodies: string[][]) =>
  [
    "<columns>",
    ...bodies.flatMap((lines) => [
      "\t<column>",
      ...lines.map((line) => (line === "" ? "" : `\t\t${line}`)),
      "\t</column>",
    ]),
    "</columns>",
  ].join("\n");

const topLevel = (markdown: string) =>
  (markdownToLexicalContent(markdown).root as JsonNode).children ?? [];

const roundTrip = (markdown: string) =>
  lexicalContentToMarkdown(markdownToLexicalContent(markdown));

describe("Notion <columns>", () => {
  test("reads columns into the editor's column layout", () => {
    const [layout] = topLevel(columns(["Left"], ["Right", "", "- a", "- b"]));
    expect(layout?.type).toBe("layout-container");
    expect(layout?.templateColumns).toBe("1fr 1fr");
    expect(
      layout?.children?.map((item) => ({
        type: item.type,
        blocks: item.children?.map((block) => [block.type, textOf(block)]),
      })),
    ).toStrictEqual([
      { type: "layout-item", blocks: [["paragraph", "Left"]] },
      {
        type: "layout-item",
        blocks: [
          ["paragraph", "Right"],
          ["list", "ab"],
        ],
      },
    ]);
  });

  test("three columns are three equal columns", () => {
    expect(topLevel(columns(["a"], ["b"], ["c"]))[0]?.templateColumns).toBe(
      "1fr 1fr 1fr",
    );
  });

  for (const [name, markdown] of [
    ["two columns", `Before\n\n${columns(["Left"], ["Right"])}\n\nAfter`],
    [
      "blocks in a column",
      columns(["# Heading", "", "Text", "", "- a", "- b"], ["x"]),
    ],
    [
      "a callout in a column",
      columns(['<callout icon="💡">', "\tTip", "</callout>"], ["x"]),
    ],
  ] as const) {
    test(`writes ${name} back byte for byte`, () => {
      expect(roundTrip(markdown)).toBe(markdown);
    });
  }

  test("a layout made in the editor writes as Notion columns", () => {
    // Widths are not part of Notion's markup; the columns are.
    const content = markdownToLexicalContent(columns(["a"], ["b"]));
    const json = JSON.stringify(content).replace('"1fr 1fr"', '"1fr 3fr"');
    expect(json).toContain('"templateColumns":"1fr 3fr"');
    expect(lexicalContentToMarkdown(JSON.parse(json))).toBe(
      columns(["a"], ["b"]),
    );
  });

  test("columns with attributes stay a read-only chip", () => {
    const markdown =
      '<columns>\n\t<column width="0.3">\n\t\ta\n\t</column>\n</columns>';
    expect(topLevel(markdown)[0]?.type).toBe("nfm-raw-block");
    expect(roundTrip(markdown)).toBe(markdown);
  });
});
