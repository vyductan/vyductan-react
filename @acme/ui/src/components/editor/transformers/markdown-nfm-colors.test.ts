import { describe, expect, test } from "vitest";

import {
  lexicalContentToMarkdown,
  markdownToLexicalContent,
} from "../utils/lexical-converter";

/**
 * Colors in Notion-flavored Markdown:
 * - text: `<span color="red">hot</span>`, background `color="red_bg"`, and
 *   `<span underline="true">` for underline;
 * - a block: `{color="red"}` at the end of its first line.
 * Both are read into what the editor already has — a text's style, a
 * block's color — so they can be edited, and written back the same way.
 * https://developers.notion.com/guides/data-apis/enhanced-markdown
 */

interface JsonNode {
  type?: string;
  text?: string;
  style?: string;
  format?: number;
  $?: Record<string, unknown>;
  children?: JsonNode[];
}

const UNDERLINE = 8;

const blocks = (markdown: string) =>
  (markdownToLexicalContent(markdown).root as JsonNode).children ?? [];

const roundTrip = (markdown: string) =>
  lexicalContentToMarkdown(markdownToLexicalContent(markdown));

const exportOf = (children: JsonNode[]) =>
  lexicalContentToMarkdown({
    root: {
      type: "root",
      version: 1,
      direction: null,
      format: "",
      indent: 0,
      children: [
        {
          type: "paragraph",
          version: 1,
          direction: null,
          format: "",
          indent: 0,
          textFormat: 0,
          textStyle: "",
          children: children.map((child) => ({
            type: "text",
            version: 1,
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            ...child,
          })),
        },
      ],
    },
  } as never);

describe("text color: <span>", () => {
  test("reads a colored span as colored text", () => {
    const [paragraph] = blocks('Say <span color="red">hot</span> now');
    const hot = paragraph?.children?.find((node) => node.text === "hot");
    expect(hot?.type).toBe("text");
    expect(hot?.style).toMatch(/^color: #[0-9a-f]{6};?$/i);
  });

  test("reads a background span as highlighted text", () => {
    const [paragraph] = blocks('<span color="blue_bg">note</span>');
    expect(paragraph?.children?.[0]?.style).toMatch(/^background-color: /);
  });

  test("reads an underline span as underlined text", () => {
    const [paragraph] = blocks('<span underline="true">under</span>');
    expect(paragraph?.children?.[0]?.format).toBe(UNDERLINE);
  });

  for (const markdown of [
    'Say <span color="red">hot</span> now',
    '<span color="blue_bg">note</span>',
    '<span underline="true">under</span>',
    '<span color="red" underline="true">both</span>',
    'A <span color="gray">quiet</span> and <span color="green_bg">calm</span> line',
  ]) {
    test(`writes it back the same: ${markdown}`, () => {
      expect(roundTrip(markdown)).toBe(markdown);
    });
  }

  test("a span with markdown inside stays a read-only chip", () => {
    const markdown = 'x <span color="red">**bold**</span> y';
    const [paragraph] = blocks(markdown);
    expect(paragraph?.children?.map((node) => node.type)).toContain(
      "nfm-raw-inline",
    );
    expect(roundTrip(markdown)).toBe(markdown);
  });

  test("a color from the toolbar palette writes as the nearest Notion color", () => {
    expect(
      exportOf([{ text: "a" }, { text: "red", style: "color: #fb2c36;" }]),
    ).toBe('a<span color="red">red</span>');
  });

  test("a color Notion has no name for is not written", () => {
    expect(exportOf([{ text: "odd", style: "color: rgb(1, 2, 3);" }])).toBe(
      "odd",
    );
  });
});

describe("block color: {color=…}", () => {
  for (const [name, markdown] of [
    ["a paragraph", 'Warn {color="red"}'],
    ["a heading", '## Title {color="blue_bg"}'],
    ["a quote", '> Said {color="gray"}'],
  ] as const) {
    test(`reads and writes back the color of ${name}`, () => {
      const [block] = blocks(markdown);
      expect(block?.$).toStrictEqual({
        blockColor: markdown.match(/"(\w+)"/)![1],
      });
      expect(JSON.stringify(block)).not.toContain("{color");
      expect(roundTrip(markdown)).toBe(markdown);
    });
  }

  test("leaves a list item's color as text, kept as it is", () => {
    const markdown = '- item {color="red"}';
    expect(JSON.stringify(blocks(markdown))).toContain('{color=\\"red\\"}');
    expect(roundTrip(markdown)).toBe(markdown);
  });

  test("only at the end of the line", () => {
    const markdown = 'a {color="red"} b';
    expect(blocks(markdown)[0]?.$).toBeUndefined();
    expect(roundTrip(markdown)).toBe(markdown);
  });
});
