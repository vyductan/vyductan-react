import { describe, expect, test } from "vitest";

import {
  lexicalContentToMarkdown,
  markdownToLexicalContent,
} from "./lexical-converter";

const roundTrip = (markdown: string) =>
  lexicalContentToMarkdown(markdownToLexicalContent(markdown));

/**
 * VD Markdown takes a saved document whose round trip is what the editor
 * shows as only re-formatted, and keeps the editor (and its undo history)
 * as it is. That holds only if what a formatter changes — here Prettier, on
 * save — does not survive the round trip. Table padding does not; a list
 * marker does (Lexical keeps it), but the editor writes `-`, as Prettier.
 */
describe("a document re-formatted by Prettier", () => {
  test("round-trips to the markdown the editor wrote", () => {
    const written = roundTrip(
      [
        "# Keys",
        "",
        "| Name | Value |",
        "| --- | --- |",
        "| a very long cell | 1 |",
        "| b | 2 |",
        "",
        "- item",
        "- `stripe_secret_key_7000`✅",
      ].join("\n"),
    );
    const prettier = [
      "# Keys",
      "",
      "| Name             | Value |",
      "| ---------------- | ----- |",
      "| a very long cell | 1     |",
      "| b                | 2     |",
      "",
      "- item",
      "- `stripe_secret_key_7000`✅",
      "",
    ].join("\n");

    expect(roundTrip(prettier)).toBe(written);
  });
});
