import { describe, expect, test } from "vitest";

import {
  lexicalContentToMarkdown,
  markdownToLexicalContent,
} from "../utils/lexical-converter";

/**
 * Toggles and callouts in Notion-flavored Markdown, the format Notion's
 * markdown API reads and writes:
 * https://developers.notion.com/guides/data-apis/enhanced-markdown
 * Child blocks sit one tab deeper than their parent.
 */

interface JsonNode {
  type?: string;
  text?: string;
  open?: boolean;
  icon?: string;
  color?: string;
  listType?: string;
  children?: JsonNode[];
}

const textOf = (node: JsonNode): string =>
  node.text ?? (node.children ?? []).map((child) => textOf(child)).join("");

/** A readable outline of a block: its type, the fields that matter, its children. */
const outline = (node: JsonNode): unknown => {
  switch (node.type) {
    case "paragraph": {
      return textOf(node);
    }
    case "list": {
      return {
        list: node.listType,
        items: (node.children ?? []).map((item) => textOf(item)),
      };
    }
    case "collapsible-container": {
      const [title, content] = node.children ?? [];
      return {
        toggle: textOf(title ?? {}),
        open: node.open,
        children: (content?.children ?? []).map((child) => outline(child)),
      };
    }
    case "callout": {
      return {
        callout: { icon: node.icon, color: node.color },
        children: (node.children ?? []).map((child) => outline(child)),
      };
    }
    default: {
      return { [node.type ?? "?"]: textOf(node) };
    }
  }
};

const blocks = (markdown: string) =>
  ((markdownToLexicalContent(markdown).root as JsonNode).children ?? []).map(
    (node) => outline(node),
  );

const roundTrip = (markdown: string) =>
  lexicalContentToMarkdown(markdownToLexicalContent(markdown));

describe("toggle: <details>", () => {
  test("reads a toggle with tab-indented children", () => {
    expect(
      blocks(
        "<details><summary>Title</summary>\n\tBody line\n\t- a\n\t- b\n</details>",
      ),
    ).toStrictEqual([
      {
        toggle: "Title",
        open: false,
        children: ["Body line", { list: "bullet", items: ["a", "b"] }],
      },
    ]);
  });

  test("reads GitHub-style <details>: summary on its own line, no indent", () => {
    expect(
      blocks("<details>\n<summary>Title</summary>\n\nBody\n\n</details>"),
    ).toStrictEqual([{ toggle: "Title", open: false, children: ["Body"] }]);
  });

  test("honours <details open>", () => {
    expect(
      blocks("<details open><summary>Title</summary>\n\tBody\n</details>"),
    ).toStrictEqual([{ toggle: "Title", open: true, children: ["Body"] }]);
  });

  test("reads a toggle nested in a toggle", () => {
    expect(
      blocks(
        [
          "<details><summary>Outer</summary>",
          "\t<details><summary>Inner</summary>",
          "\t\tDeep",
          "\t</details>",
          "\tAfter",
          "</details>",
          "Outside",
        ].join("\n"),
      ),
    ).toStrictEqual([
      {
        toggle: "Outer",
        open: false,
        children: [
          { toggle: "Inner", open: false, children: ["Deep"] },
          "After",
        ],
      },
      "Outside",
    ]);
  });

  test("writes Notion's form and reads it back unchanged", () => {
    const markdown =
      "<details><summary>Title **bold**</summary>\n\tBody\n\n\t- a\n\t- b\n</details>";
    expect(roundTrip(markdown)).toBe(markdown);
  });
});

describe("callout: <callout>", () => {
  test("reads icon, color and tab-indented children", () => {
    expect(
      blocks('<callout icon="💡" color="blue_bg">\n\tText\n\t- a\n</callout>'),
    ).toStrictEqual([
      {
        callout: { icon: "💡", color: "blue_bg" },
        children: ["Text", { list: "bullet", items: ["a"] }],
      },
    ]);
  });

  test("writes Notion's form and reads it back unchanged", () => {
    const markdown =
      '<callout icon="⚠️" color="yellow_bg">\n\tCareful\n\n\t1. one\n\t2. two\n</callout>';
    expect(roundTrip(markdown)).toBe(markdown);
  });

  test("keeps a callout without attributes without inventing any", () => {
    const markdown = "<callout>\n\tPlain\n</callout>";
    expect(blocks(markdown)).toStrictEqual([
      { callout: { icon: "", color: "" }, children: ["Plain"] },
    ]);
    expect(roundTrip(markdown)).toBe(markdown);
  });

  test("round-trips a callout inside a toggle", () => {
    const markdown =
      '<details><summary>More</summary>\n\t<callout icon="💡">\n\t\tTip\n\t</callout>\n</details>';
    expect(blocks(markdown)).toStrictEqual([
      {
        toggle: "More",
        open: false,
        children: [{ callout: { icon: "💡", color: "" }, children: ["Tip"] }],
      },
    ]);
    expect(roundTrip(markdown)).toBe(markdown);
  });
});

test("leaves the blocks around a toggle and a callout alone", () => {
  const markdown =
    'Before\n\n<details><summary>T</summary>\n\tIn\n</details>\n\n<callout icon="💡">\n\tC\n</callout>\n\nAfter';
  expect(blocks(markdown)).toStrictEqual([
    "Before",
    { toggle: "T", open: false, children: ["In"] },
    { callout: { icon: "💡", color: "" }, children: ["C"] },
    "After",
  ]);
  expect(roundTrip(markdown)).toBe(markdown);
});
