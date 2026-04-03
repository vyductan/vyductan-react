import { describe, expect, test } from "vitest";

import {
  shouldPreferPlainTextLinebreakPaste,
  splitPlainTextIntoParagraphs,
} from "./plain-text-linebreak-paste-plugin";

describe("shouldPreferPlainTextLinebreakPaste", () => {
  test("prefers plain text when html is inline-only and text carries line breaks", () => {
    expect(
      shouldPreferPlainTextLinebreakPaste(
        `<Age> Any age OK\n<Discount> *0-2 yrs old are free\n3-12 yrs: 2,750 yen disount per child`,
        '<span style="white-space: pre-wrap;">&lt;Age&gt; Any age OK\n&lt;Discount&gt; *0-2 yrs old are free\n3-12 yrs: 2,750 yen disount per child</span>',
      ),
    ).toBe(true);
  });

  test("does not prefer plain text when html already carries paragraph structure", () => {
    expect(
      shouldPreferPlainTextLinebreakPaste(
        `<Age> Any age OK\n\n<Discount> *0-2 yrs old are free\n\n3-12 yrs: 2,750 yen disount per child`,
        "<p>&lt;Age&gt; Any age OK</p><p>&lt;Discount&gt; *0-2 yrs old are free</p><p>3-12 yrs: 2,750 yen disount per child</p>",
      ),
    ).toBe(false);
  });
});

describe("splitPlainTextIntoParagraphs", () => {
  test("keeps single newlines as line breaks within one paragraph", () => {
    expect(
      splitPlainTextIntoParagraphs(
        `<Age> Any age OK\n<Discount> *0-2 yrs old are free\n3-12 yrs: 2,750 yen disount per child`,
      ),
    ).toEqual([
      [
        "<Age> Any age OK",
        "<Discount> *0-2 yrs old are free",
        "3-12 yrs: 2,750 yen disount per child",
      ],
    ]);
  });

  test("treats blank lines as paragraph separators", () => {
    expect(
      splitPlainTextIntoParagraphs(
        `<Age> Any age OK\n\n<Discount> *0-2 yrs old are free\n\n3-12 yrs: 2,750 yen disount per child`,
      ),
    ).toEqual([
      ["<Age> Any age OK"],
      ["<Discount> *0-2 yrs old are free"],
      ["3-12 yrs: 2,750 yen disount per child"],
    ]);
  });
});
