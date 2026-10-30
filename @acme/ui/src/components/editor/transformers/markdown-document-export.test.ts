import { describe, expect, test } from "vitest";

import {
  lexicalContentToMarkdown,
  markdownToLexicalContent,
} from "../utils/lexical-converter";

const roundTrip = (markdown: string) =>
  lexicalContentToMarkdown(markdownToLexicalContent(markdown));

describe("$convertToMarkdownDocument", () => {
  test("keeps a checklist tight instead of a blank line between items", () => {
    const markdown = "- [ ] first\n- [x] second\n- [ ] third";

    expect(roundTrip(markdown)).toBe(markdown);
  });

  test("keeps check items with inline formatting on one line each", () => {
    const markdown =
      "- [ ] use `agent_dashboard` on **GitLab**\n- [x] done `gzg-app`";

    expect(roundTrip(markdown)).toBe(markdown);
  });

  test("still separates a checklist from the blocks around it", () => {
    const markdown = "## Archive\n\n- [ ] one\n- [ ] two\n\nAfter the list.";

    expect(roundTrip(markdown)).toBe(markdown);
  });

  test("leaves no private-use marker characters in the output", () => {
    expect(roundTrip("- [ ] a\n- [ ] b")).not.toMatch(/[]/);
  });

  test("does not touch text that only looks like a checklist inside code", () => {
    const markdown = "```\n- [ ] a\n\n- [ ] b\n```";

    expect(roundTrip(markdown)).toBe(markdown);
  });
});
