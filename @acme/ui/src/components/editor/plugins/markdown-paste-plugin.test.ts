import { describe, expect, test, vi } from "vitest";

import * as markdownPastePlugin from "./markdown-paste-plugin";

vi.mock("../transformers/markdown-transformers", () => ({
  MARKDOWN_TRANSFORMERS: [],
}));

describe("normalizeMarkdownPasteForLists", () => {
  test("converts flattened nested bullet markers into nested markdown indentation", () => {
    const normalizeMarkdownPasteForLists = (
      markdownPastePlugin as Record<string, unknown>
    ).normalizeMarkdownPasteForLists as ((text: string) => string) | undefined;

    const pastedText = [
      "*   Private tours only",
      "*   Regarding dietary restrictions, please refer to the Tour Information Sheet. Unfortunately, we are unable to accommodate the following cases for both shared and private tours:",
      "*   *   Guests with severe allergies.",
      "    *   Guests who cannot accept any risk of cross-contamination, regardless of the severity of their allergy.  ",
      "        ( including for religious reasons)",
    ].join("\n");

    expect(normalizeMarkdownPasteForLists).toBeTypeOf("function");
    expect(normalizeMarkdownPasteForLists?.(pastedText)).toBe(
      [
        "*   Private tours only",
        "*   Regarding dietary restrictions, please refer to the Tour Information Sheet. Unfortunately, we are unable to accommodate the following cases for both shared and private tours:",
        "    * Guests with severe allergies.",
        "    *   Guests who cannot accept any risk of cross-contamination, regardless of the severity of their allergy.  ",
        "        ( including for religious reasons)",
      ].join("\n"),
    );
  });
});

describe("hasMarkdownPasteSyntax", () => {
  test("recognizes normalized nested list content as markdown", () => {
    const hasMarkdownPasteSyntax = (
      markdownPastePlugin as Record<string, unknown>
    ).hasMarkdownPasteSyntax as ((text: string) => boolean) | undefined;

    expect(hasMarkdownPasteSyntax).toBeTypeOf("function");
    expect(
      hasMarkdownPasteSyntax?.("    * Guests with severe allergies."),
    ).toBe(true);
  });
});

describe("hasMarkdownPasteSyntax on tables", () => {
  const hasMarkdownPasteSyntax = (
    markdownPastePlugin as Record<string, unknown>
  ).hasMarkdownPasteSyntax as ((text: string) => boolean) | undefined;

  /**
   * A table on its own has none of the line starts the other checks look for,
   * so a paste holding only a table was taken for plain text and came in as a
   * run of lines full of pipes. Its delimiter row is what gives it away.
   */
  test.each([
    ["piped", "| Tiêu chí | Chi tiết |\n| --- | --- |\n| a | b |"],
    ["aligned", "| Left | Right |\n|:---|---:|\n| a | b |"],
    ["unpiped edges", "Tiêu chí | Chi tiết\n--- | ---\na | b"],
    ["single column", "| Only |\n| --- |\n| a |"],
  ])("recognizes a %s table", (_name, text) => {
    expect(hasMarkdownPasteSyntax?.(text)).toBe(true);
  });

  test.each([
    ["a sentence with a pipe", "Pick one | or the other"],
    ["a range with a dash", "Open 9 - 5 | Mon to Fri"],
    ["a rule on its own", "Above\n---\nBelow"],
  ])("leaves %s alone", (_name, text) => {
    expect(hasMarkdownPasteSyntax?.(text)).toBe(false);
  });
});

describe("dropEmptyBlockquoteLines", () => {
  const dropEmptyBlockquoteLines = (
    markdownPastePlugin as Record<string, unknown>
  ).dropEmptyBlockquoteLines as ((text: string) => string) | undefined;

  test("is exported", () => {
    expect(dropEmptyBlockquoteLines).toBeTypeOf("function");
  });

  /**
   * Markdown from a chat often closes a quote with a bare ">", meaning an empty
   * line inside it. Lexical's quote transformer wants "> " with the space, so
   * the lone marker fell through as text and the quote ended with a stray ">".
   */
  test("drops a line that is only a blockquote marker", () => {
    expect(
      dropEmptyBlockquoteLines?.(["> Quoted words", ">", ""].join("\n")),
    ).toBe(["> Quoted words", ""].join("\n"));
  });

  test("drops it with trailing spaces too", () => {
    expect(dropEmptyBlockquoteLines?.("> Quoted\n>   \n")).toBe("> Quoted\n");
  });

  test("leaves a quote line that has words on it", () => {
    const text = "> Quoted\n> still quoted\n";
    expect(dropEmptyBlockquoteLines?.(text)).toBe(text);
  });

  test("leaves a bare > inside a fenced block alone", () => {
    const text = ["```", "> not a quote", ">", "```", ""].join("\n");
    expect(dropEmptyBlockquoteLines?.(text)).toBe(text);
  });
});

describe("normalizeLetteredListItems", () => {
  const normalizeLetteredListItems = (
    markdownPastePlugin as Record<string, unknown>
  ).normalizeLetteredListItems as ((text: string) => string) | undefined;

  test("is exported", () => {
    expect(normalizeLetteredListItems).toBeTypeOf("function");
  });

  /**
   * Nested numbered items are shown as "a.", "b.", "c." — here, in Notion, in
   * most documents — so that is how they arrive when copied as text. Markdown
   * numbers them with digits only, so an indented "a." under a list line was
   * read as more text in the item above.
   */
  test("turns indented letter markers under a list into numbered items", () => {
    const pasted = ["1. 11", "    a. a", "    b. b", "    c. c", "2. 22"].join(
      "\n",
    );
    expect(normalizeLetteredListItems?.(pasted)).toBe(
      ["1. 11", "    1. a", "    2. b", "    3. c", "2. 22"].join("\n"),
    );
  });

  test("does the same for roman numerals a level deeper", () => {
    const pasted = [
      "1. one",
      "    a. two",
      "        i. three",
      "        ii. four",
    ].join("\n");
    expect(normalizeLetteredListItems?.(pasted)).toBe(
      ["1. one", "    1. two", "        1. three", "        2. four"].join(
        "\n",
      ),
    );
  });

  test("leaves a letter that does not follow a list line alone", () => {
    const text = "Dear team,\n    A. Lincoln said so.";
    expect(normalizeLetteredListItems?.(text)).toBe(text);
  });

  test("leaves an unindented letter alone", () => {
    const text = "1. first\na. not nested";
    expect(normalizeLetteredListItems?.(text)).toBe(text);
  });
});
