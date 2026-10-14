import { describe, expect, test } from "vitest";

import {
  lexicalContentToMarkdown,
  markdownToLexicalContent,
} from "../utils/lexical-converter";

interface JsonNode {
  type?: string;
  text?: string;
  children?: JsonNode[];
}

const textOf = (node: JsonNode): string =>
  node.text ?? (node.children ?? []).map((child) => textOf(child)).join("");

/** Each list item's text, by its depth: "text@depth". */
function itemDepths(markdown: string): string[] {
  const root = markdownToLexicalContent(markdown).root as JsonNode;
  const out: string[] = [];
  const walk = (node: JsonNode, depth: number) => {
    for (const child of node.children ?? []) {
      if (child.type === "listitem") {
        const nested = (child.children ?? []).filter((c) => c.type === "list");
        const own = (child.children ?? []).filter((c) => c.type !== "list");
        if (own.length > 0) out.push(`${own.map(textOf).join("")}@${depth}`);
        for (const list of nested) walk(list, depth + 1);
      } else if (child.type === "list") {
        walk(child, depth);
      }
    }
  };
  walk(root, 0);
  return out;
}

/**
 * A nested list item is nested by how far it is indented relative to its
 * parent's text, as CommonMark has it — not by fours. Lexical counted four
 * spaces (or a tab) a level, so the indent Prettier writes on save (three
 * spaces under `1. `) and GitHub's two under `- ` read as no nesting at all:
 * saving a file flattened its lists.
 */
describe("nested list indentation", () => {
  test("a tab, as the editor writes it", () => {
    expect(itemDepths("1. One\n\t- Under one\n2. Two")).toStrictEqual([
      "One@0",
      "Under one@1",
      "Two@0",
    ]);
  });

  test("three spaces under `1. `, as Prettier writes it", () => {
    expect(itemDepths("1. One\n   - Under one\n2. Two")).toStrictEqual([
      "One@0",
      "Under one@1",
      "Two@0",
    ]);
  });

  test("two spaces under `- `", () => {
    expect(itemDepths("- One\n  - Under one\n- Two")).toStrictEqual([
      "One@0",
      "Under one@1",
      "Two@0",
    ]);
  });

  test("a loose list, blank lines between its items", () => {
    expect(itemDepths("1. One\n\n   - Under one\n\n2. Two\n")).toStrictEqual([
      "One@0",
      "Under one@1",
      "Two@0",
    ]);
  });

  test("two levels deep, by each parent's own marker width", () => {
    expect(
      itemDepths("10. Ten\n    - Under ten\n      - Under that\n11. Eleven"),
    ).toStrictEqual(["Ten@0", "Under ten@1", "Under that@2", "Eleven@0"]);
  });

  test("short of its parent's text, an item is not nested", () => {
    expect(itemDepths("1. One\n  - Not under\n2. Two")).toStrictEqual([
      "One@0",
      "Not under@0",
      "Two@0",
    ]);
  });

  /** As reported: pasted, saved (Prettier), read back — still nested. */
  test("a Prettier-formatted save of the editor's own list reads back the same", () => {
    const written = lexicalContentToMarkdown(
      markdownToLexicalContent(
        [
          "1. `COMMENT ON` = one line",
          "\t- Backend objects (11–16): no `COMMENT ON`",
          "2. `schemas/` = full explanation",
          "3. README batch",
        ].join("\n"),
      ),
    );
    const prettier = written.replaceAll("\t", "   ");

    expect(itemDepths(prettier)).toStrictEqual(itemDepths(written));
    expect(itemDepths(written)).toStrictEqual([
      "COMMENT ON = one line@0",
      "Backend objects (11–16): no COMMENT ON@1",
      "schemas/ = full explanation@0",
      "README batch@0",
    ]);
  });
});
