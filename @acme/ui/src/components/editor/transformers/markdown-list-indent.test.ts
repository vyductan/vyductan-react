import { describe, expect, test } from "vitest";

import {
  lexicalContentToMarkdown,
  markdownToLexicalContent,
} from "../utils/lexical-converter";

interface JsonNode {
  type?: string;
  text?: string;
  indent?: number;
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

/** To-dos, by text and indent. */
function todoIndents(markdown: string): string[] {
  const root = markdownToLexicalContent(markdown).root as JsonNode;
  return (root.children ?? [])
    .filter((node) => node.type === "check-block")
    .map((node) => `${textOf(node)}@${node.indent ?? 0}`);
}

/**
 * An indented to-do lost its indent on a save: written at the margin, and
 * `\t- [ ] b` read back as a bullet whose text was "[ ] b". In VD Markdown,
 * which saves on its own, a reload showed it out at the margin.
 */
describe("indented to-dos", () => {
  test("keep their indent through markdown", () => {
    const markdown = lexicalContentToMarkdown(
      markdownToLexicalContent("- [ ] a\n\t- [ ] b\n- [ ] c"),
    );
    expect(todoIndents(markdown)).toStrictEqual(["a@0", "b@1", "c@0"]);
  });

  test("read by their parent's text column, as Prettier writes them", () => {
    expect(
      todoIndents("- [ ] a\n  - [x] b\n    - [ ] c\n- [ ] d"),
    ).toStrictEqual(["a@0", "b@1", "c@2", "d@0"]);
  });

  test("a sibling at the same indent stays a sibling", () => {
    expect(todoIndents("- [ ] a\n  - [ ] b\n  - [ ] c")).toStrictEqual([
      "a@0",
      "b@1",
      "c@1",
    ]);
  });

  test("checked or not, read back as it was", () => {
    const root = markdownToLexicalContent("- [ ] a\n\t- [x] b").root as {
      children: { checked?: boolean }[];
    };
    expect(root.children.map((node) => node.checked)).toStrictEqual([
      false,
      true,
    ]);
  });
});

/**
 * A list under a to-do, as Notion makes it ("- " typed on an indented line
 * below one): its items nested a level, and so through markdown.
 */
describe("a list under a to-do", () => {
  test("keeps its indent through markdown", () => {
    const markdown = lexicalContentToMarkdown(
      markdownToLexicalContent("- [ ] a\n\t- b\n\t- c"),
    );
    expect(markdown).toMatch(/\n\t- b\n\t- c$/);
    expect(itemDepths(markdown)).toStrictEqual(["b@1", "c@1"]);
  });

  test("read by the to-do's text column, as Prettier writes it", () => {
    expect(itemDepths("- [ ] a\n  - b\n  - c")).toStrictEqual(["b@1", "c@1"]);
  });

  test("an item nested in it stays nested", () => {
    const markdown = lexicalContentToMarkdown(
      markdownToLexicalContent("- [ ] a\n\t- b\n\t\t- c"),
    );
    expect(markdown).toMatch(/\n\t- b\n\t\t- c$/);
    expect(itemDepths(markdown)).toStrictEqual(["b@1", "c@2"]);
  });

  /** Lexical joins lists of a kind; the one at the margin stays there. */
  test("a list at the margin below stays at the margin", () => {
    const markdown = lexicalContentToMarkdown(
      markdownToLexicalContent("- [ ] a\n\t- b\n\n- c"),
    );
    expect(itemDepths(markdown)).toStrictEqual(["b@1", "c@0"]);
  });
});

/**
 * An empty to-do is written `- [ ] `, and format on save (Prettier) trims
 * the space: `- [ ]` read back as a bullet with "[ ]" for its text.
 */
describe("an empty to-do", () => {
  test("reads back as a to-do with its trailing space trimmed", () => {
    expect(todoIndents("- [ ] a\n- [ ]")).toStrictEqual(["a@0", "@0"]);
  });

  test("indented, too", () => {
    expect(todoIndents("- [ ] a\n\t- [ ]\n  - [x]")).toStrictEqual([
      "a@0",
      "@1",
      "@1",
    ]);
  });

  test("survives a save", () => {
    const markdown = lexicalContentToMarkdown(
      markdownToLexicalContent("- [ ] a\n\t- [ ] \n- [ ] c"),
    ).replaceAll(/[ \t]+$/gm, "");
    expect(todoIndents(markdown)).toStrictEqual(["a@0", "@1", "c@0"]);
  });
});
