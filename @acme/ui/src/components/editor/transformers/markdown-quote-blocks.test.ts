import { describe, expect, test } from "vitest";

import {
  lexicalContentToMarkdown,
  markdownToLexicalContent,
} from "../utils/lexical-converter";

type Json = { type: string; text?: string; children?: Json[] };

/** Each node as `type` or `type:"text"`, indented by depth. */
const shape = (node: Json, depth = 0): string[] => [
  `${"  ".repeat(depth)}${node.type}${node.text === undefined ? "" : `:${node.text}`}`,
  ...(node.children ?? []).flatMap((child) => shape(child, depth + 1)),
];

const read = (markdown: string) => {
  const content = markdownToLexicalContent(markdown) as unknown as {
    root: Json;
  };
  return {
    shape: (content.root.children ?? []).flatMap((child) => shape(child)),
    back: lexicalContentToMarkdown(content as never),
  };
};

/*
 * A list in a quote — `> - item`, as GitHub shows it — read as words: the
 * items lost their bullets, and the second came back escaped (`> \- b`).
 */
describe("a quote holding a list", () => {
  test("bullets read as a list inside the quote, and write back the same", () => {
    const { shape: nodes, back } = read("> - a\n> - b");
    expect(nodes).toStrictEqual([
      "quote-container",
      "  list",
      "    listitem",
      "      text:a",
      "    listitem",
      "      text:b",
    ]);
    expect(back).toBe("> - a\n> - b");
  });

  test("so do numbers", () => {
    const { shape: nodes, back } = read("> 1. a\n> 2. b");
    expect(nodes[0]).toBe("quote-container");
    expect(nodes[1]).toBe("  list");
    expect(back).toBe("> 1. a\n> 2. b");
  });

  test("a quote of words alone stays a quote of words", () => {
    const { shape: nodes, back } = read("> text\n> more");
    expect(nodes).toStrictEqual([
      "quote",
      "  text:text",
      "  linebreak",
      "  text:more",
    ]);
    expect(back).toBe("> text\n> more");
  });
});
