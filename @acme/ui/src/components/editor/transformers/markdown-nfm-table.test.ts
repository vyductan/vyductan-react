import { describe, expect, test } from "vitest";

import {
  lexicalContentToMarkdown,
  markdownToLexicalContent,
} from "../utils/lexical-converter";

/**
 * Notion's own table markup, as its markdown API writes it:
 *
 *   <table header-row="true">
 *   	<tr>
 *   		<td>Cell</td>
 *   	</tr>
 *   </table>
 *
 * A plain one — rows and cells, no colors — becomes a real, editable table,
 * and goes back out in the same form: unchanged, byte for byte; edited, with
 * only the edited cells different. Anything more (colors, <colgroup>) stays a
 * read-only chip, kept byte for byte.
 * https://developers.notion.com/guides/data-apis/enhanced-markdown
 */

interface JsonNode {
  type?: string;
  text?: string;
  headerState?: number;
  children?: JsonNode[];
}

const textOf = (node: JsonNode): string =>
  node.text ?? (node.children ?? []).map((child) => textOf(child)).join("");

const nfmTable = (attributes: string, rows: string[][]) =>
  [
    `<table${attributes}>`,
    ...rows.flatMap((row) => [
      "\t<tr>",
      ...row.map((cell) => `\t\t<td>${cell}</td>`),
      "\t</tr>",
    ]),
    "</table>",
  ].join("\n");

const firstBlock = (markdown: string) =>
  ((markdownToLexicalContent(markdown).root as JsonNode).children ?? [])[0];

const roundTrip = (markdown: string) =>
  lexicalContentToMarkdown(markdownToLexicalContent(markdown));

describe("Notion <table>", () => {
  test("reads a plain one as an editable table", () => {
    const table = firstBlock(
      nfmTable(' header-row="true"', [
        ["Name", "Role"],
        ["Tân", "Owner"],
      ]),
    );
    expect(table?.type).toBe("table");
    expect(
      table?.children?.map((row) => row.children?.map((cell) => textOf(cell))),
    ).toStrictEqual([
      ["Name", "Role"],
      ["Tân", "Owner"],
    ]);
    // header-row: the first row is the header.
    expect(
      table?.children?.map((row) => row.children?.[0]?.headerState),
    ).toStrictEqual([1, 0]);
  });

  test("honours header-column", () => {
    const table = firstBlock(
      nfmTable(' header-column="true"', [
        ["a", "b"],
        ["c", "d"],
      ]),
    );
    expect(
      table?.children?.map((row) =>
        row.children?.map((cell) => cell.headerState),
      ),
    ).toStrictEqual([
      [2, 0],
      [2, 0],
    ]);
  });

  for (const [name, attributes] of [
    ["no attributes", ""],
    ["a header row", ' header-row="true"'],
    [
      "every attribute, in Notion's order",
      ' fit-page-width="true" header-row="true" header-column="false"',
    ],
  ] as const) {
    test(`writes an unchanged table back byte for byte: ${name}`, () => {
      const markdown = `Before\n\n${nfmTable(attributes, [
        ["a", "b"],
        ["c", "d"],
      ])}\n\nAfter`;
      expect(roundTrip(markdown)).toBe(markdown);
    });
  }

  test("keeps rich text and line breaks in cells", () => {
    const markdown = nfmTable(' header-row="true"', [
      ["**Bold** and [link](https://example.com)", "one<br>two"],
      [String.raw`a\|b`, ""],
    ]);
    expect(roundTrip(markdown)).toBe(markdown);
  });

  test("an edited cell changes only that cell", () => {
    const markdown = nfmTable(' header-row="true"', [
      ["Name", "Role"],
      ["Tân", "Owner"],
    ]);
    const content = markdownToLexicalContent(markdown);
    const json = JSON.stringify(content).replace(
      '"text":"Owner"',
      '"text":"Lead"',
    );
    expect(lexicalContentToMarkdown(JSON.parse(json))).toBe(
      markdown.replace("Owner", "Lead"),
    );
  });

  test("an added row comes out in the same form", () => {
    const markdown = nfmTable("", [["a", "b"]]);
    const content = markdownToLexicalContent(markdown) as unknown as {
      root: { children: { children: unknown[] }[] };
    };
    const table = content.root.children[0]!;
    table.children.push(
      JSON.parse(
        JSON.stringify(table.children[0])
          .replaceAll('"text":"a"', '"text":"c"')
          .replaceAll('"text":"b"', '"text":"d"'),
      ),
    );
    expect(lexicalContentToMarkdown(content as never)).toBe(
      nfmTable("", [
        ["a", "b"],
        ["c", "d"],
      ]),
    );
  });

  for (const [name, markup] of [
    [
      "a colored cell",
      '<table>\n\t<tr>\n\t\t<td color="red">a</td>\n\t</tr>\n</table>',
    ],
    [
      "a colored row",
      '<table>\n\t<tr color="blue_bg">\n\t\t<td>a</td>\n\t</tr>\n</table>',
    ],
    [
      "a colgroup",
      '<table>\n\t<colgroup>\n\t\t<col color="gray">\n\t</colgroup>\n\t<tr>\n\t\t<td>a</td>\n\t</tr>\n</table>',
    ],
  ] as const) {
    test(`keeps a table with ${name} as a read-only chip`, () => {
      expect(firstBlock(markup)?.type).toBe("nfm-raw-block");
      expect(roundTrip(markup)).toBe(markup);
    });
  }

  test("a pipe table still writes as pipes", () => {
    const markdown = "| A | B |\n| --- | --- |\n| a | b |";
    expect(roundTrip(markdown)).toBe(markdown);
  });
});
