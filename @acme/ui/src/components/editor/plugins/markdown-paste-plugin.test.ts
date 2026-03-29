import { describe, expect, test, vi } from "vitest";

vi.mock("../transformers/markdown-transformers", () => ({
  MARKDOWN_TRANSFORMERS: [],
}));

import * as markdownPastePlugin from "./markdown-paste-plugin";

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
    const hasMarkdownPasteSyntax = (markdownPastePlugin as Record<string, unknown>)
      .hasMarkdownPasteSyntax as ((text: string) => boolean) | undefined;

    expect(hasMarkdownPasteSyntax).toBeTypeOf("function");
    expect(hasMarkdownPasteSyntax?.("    * Guests with severe allergies.")).toBe(
      true,
    );
  });
});
