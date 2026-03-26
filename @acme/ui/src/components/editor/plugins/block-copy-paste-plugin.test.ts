import { describe, expect, test } from "vitest";

import * as blockCopyPastePlugin from "./block-copy-paste-plugin";

describe("getSingleParagraphSoftLineBreakCopyHtml", () => {
  test("serializes a single plain-text paragraph with soft line breaks as a single break-spaces block", () => {
    expect(
      blockCopyPastePlugin.getSingleParagraphSoftLineBreakCopyHtml(
        `<Age> Any age OK\n<Discount> *0-2 yrs old are free\n3-12 yrs: 2,750 yen disount per child`,
        '<p class="leading-[24px]"><span style="white-space: pre-wrap;">&lt;Age&gt; Any age OK</span><br><span style="white-space: pre-wrap;">&lt;Discount&gt; *0-2 yrs old are free</span><br><span style="white-space: pre-wrap;">3-12 yrs: 2,750 yen disount per child</span></p>',
      ),
    ).toBe(
      '<div style="white-space: break-spaces; word-break: break-word;">&lt;Age&gt; Any age OK\n&lt;Discount&gt; *0-2 yrs old are free\n3-12 yrs: 2,750 yen disount per child</div>',
    );
  });

  test("serializes selected inline clipboard html with soft line breaks as a single break-spaces block", () => {
    expect(
      blockCopyPastePlugin.getSingleParagraphSoftLineBreakCopyHtml(
        `<Age> Any age OK\n<Discount> *0-2 yrs old are free\n3-12 yrs: 2,750 yen disount per child`,
        '<span style="white-space: pre-wrap;">&lt;Age&gt; Any age OK</span><br><span style="white-space: pre-wrap;">&lt;Discount&gt; *0-2 yrs old are free</span><br><span style="white-space: pre-wrap;">3-12 yrs: 2,750 yen disount per child</span>',
      ),
    ).toBe(
      '<div style="white-space: break-spaces; word-break: break-word;">&lt;Age&gt; Any age OK\n&lt;Discount&gt; *0-2 yrs old are free\n3-12 yrs: 2,750 yen disount per child</div>',
    );
  });

  test("serializes formatted inline clipboard html with soft line breaks as a single break-spaces block", () => {
    expect(
      blockCopyPastePlugin.getSingleParagraphSoftLineBreakCopyHtml(
        `<Age> Any age OK\n<Discount> *0-2 yrs old are free\n3-12 yrs: 2,750 yen disount per child`,
        '<strong>&lt;Age&gt; Any age OK</strong><br><em>&lt;Discount&gt; *0-2 yrs old are free</em><br><code>3-12 yrs: 2,750 yen disount per child</code>',
      ),
    ).toBe(
      '<div style="white-space: break-spaces; word-break: break-word;">&lt;Age&gt; Any age OK\n&lt;Discount&gt; *0-2 yrs old are free\n3-12 yrs: 2,750 yen disount per child</div>',
    );
  });

  test("does not collapse multi-paragraph html when one paragraph contains soft line breaks", () => {
    const html =
      '<p class="leading-[24px]"><span style="white-space: pre-wrap;">&lt;Age&gt; Any age OK</span><br><span style="white-space: pre-wrap;">&lt;Discount&gt; *0-2 yrs old are free</span></p><p class="leading-[24px]"><span style="white-space: pre-wrap;">3-12 yrs: 2,750 yen disount per child</span></p>';

    expect(
      blockCopyPastePlugin.getSingleParagraphSoftLineBreakCopyHtml(
        `<Age> Any age OK\n<Discount> *0-2 yrs old are free\n3-12 yrs: 2,750 yen disount per child`,
        html,
      ),
    ).toBe(html);
  });
});

describe("getMultiParagraphCopyPlainText", () => {
  test("adds blank-line separators for multi-paragraph clipboard html", () => {
    expect(
      blockCopyPastePlugin.getMultiParagraphCopyPlainText(
        `PW2_A <Age> Any age OK\nPW2_B <Discount> *0-2 yrs old are free\nPW2_C 3-12 yrs: 2,750 yen disount per child`,
        '<p class="leading-[24px]" dir="ltr"><span style="white-space: pre-wrap;">PW2_A &lt;Age&gt; Any age OK</span></p><p class="leading-[24px]" dir="ltr"><span style="white-space: pre-wrap;">PW2_B &lt;Discount&gt; *0-2 yrs old are free</span></p><p class="leading-[24px]" dir="ltr"><span style="white-space: pre-wrap;">PW2_C 3-12 yrs: 2,750 yen disount per child</span></p>',
      ),
    ).toBe(
      `PW2_A <Age> Any age OK\n\nPW2_B <Discount> *0-2 yrs old are free\n\nPW2_C 3-12 yrs: 2,750 yen disount per child`,
    );
  });

  test("keeps single-paragraph soft line break plain text unchanged", () => {
    expect(
      blockCopyPastePlugin.getMultiParagraphCopyPlainText(
        `<Age> Any age OK\n<Discount> *0-2 yrs old are free\n3-12 yrs: 2,750 yen disount per child`,
        '<div style="white-space: break-spaces; word-break: break-word;">&lt;Age&gt; Any age OK\n&lt;Discount&gt; *0-2 yrs old are free\n3-12 yrs: 2,750 yen disount per child</div>',
      ),
    ).toBe(
      `<Age> Any age OK\n<Discount> *0-2 yrs old are free\n3-12 yrs: 2,750 yen disount per child`,
    );
  });

  test("preserves soft line breaks inside a paragraph when normalizing multiple paragraphs", () => {
    expect(
      blockCopyPastePlugin.getMultiParagraphCopyPlainText(
        `PW2_A <Age> Any age OK\nPW2_B <Discount> *0-2 yrs old are free\nPW2_C 3-12 yrs: 2,750 yen disount per child`,
        '<p class="leading-[24px]" dir="ltr"><span style="white-space: pre-wrap;">PW2_A &lt;Age&gt; Any age OK</span><br><span style="white-space: pre-wrap;">PW2_B &lt;Discount&gt; *0-2 yrs old are free</span></p><p class="leading-[24px]" dir="ltr"><span style="white-space: pre-wrap;">PW2_C 3-12 yrs: 2,750 yen disount per child</span></p>',
      ),
    ).toBe(
      `PW2_A <Age> Any age OK\nPW2_B <Discount> *0-2 yrs old are free\n\nPW2_C 3-12 yrs: 2,750 yen disount per child`,
    );
  });
});
