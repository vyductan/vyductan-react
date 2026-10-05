import { describe, expect, test } from "vitest";

import { cleanCopiedHtml } from "./copy-html-cleanup-plugin";

const parse = (html: string) =>
  new DOMParser().parseFromString(html, "text/html").body;

/**
 * What the editor exports for a quote with inline code, as copied: every run
 * of text a `white-space: pre-wrap` span, inline code a span in a `<code>`,
 * the theme's classes on everything.
 */
const EXPORTED =
  '<blockquote class="border-l-[3px] pl-3.5"><b><strong class="font-semibold" style="white-space: pre-wrap;">Phạm vi:</strong></b><span style="white-space: pre-wrap;"> GTMS (buffer </span><code spellcheck="false" style="white-space: pre-wrap;"><span class="bg-muted px-1 font-mono RichTextSemanticContract__inlineCode">direct_web</span></code><span style="white-space: pre-wrap;">, ledger </span><code spellcheck="false" style="white-space: pre-wrap;"><span class="bg-muted px-1 font-mono">booking</span></code><span style="white-space: pre-wrap;">)</span><br><b><strong class="font-semibold" style="white-space: pre-wrap;">Chuẩn:</strong></b><span style="white-space: pre-wrap;"> GDPR</span></blockquote>';

/**
 * Pasted into Notion, that became a code block per inline code, and the text
 * between them was lost: Notion takes `white-space: pre` for code. What goes
 * on the clipboard is plain semantic HTML, as a rendered markdown page has.
 */
describe("cleanCopiedHtml", () => {
  test("inline code is a bare <code>, with no white-space, classes or inner span", () => {
    const body = parse(cleanCopiedHtml(EXPORTED));

    const codes = [...body.querySelectorAll("code")];
    expect(codes.map((code) => code.outerHTML)).toStrictEqual([
      "<code>direct_web</code>",
      "<code>booking</code>",
    ]);
    expect(body.querySelector("[class]")).toBeNull();
    expect(body.innerHTML).not.toContain("white-space");
  });

  test("keeps every word of the text", () => {
    const body = parse(cleanCopiedHtml(EXPORTED));

    expect(body.textContent?.replaceAll(" ", " ")).toBe(
      "Phạm vi: GTMS (buffer direct_web, ledger booking)Chuẩn: GDPR",
    );
  });

  test("a quote's lines are a paragraph in it, bold once", () => {
    const body = parse(cleanCopiedHtml(EXPORTED));

    const quote = body.querySelector("blockquote")!;
    expect([...quote.children].map((child) => child.tagName)).toStrictEqual([
      "P",
    ]);
    expect(quote.querySelectorAll("br")).toHaveLength(1);
    expect(body.querySelectorAll("b")).toHaveLength(0);
    expect(
      [...body.querySelectorAll("strong")].map((strong) => strong.outerHTML),
    ).toStrictEqual(["<strong>Phạm vi:</strong>", "<strong>Chuẩn:</strong>"]);
  });

  /** pre-wrap kept them; without it they would collapse on the way in. */
  test("keeps runs of spaces, and spaces at the edges of a line", () => {
    const body = parse(
      cleanCopiedHtml(
        '<p><span style="white-space: pre-wrap;"> a   b </span><br><span style="white-space: pre-wrap;"> c</span></p>',
      ),
    );

    expect(body.querySelector("p")!.innerHTML).toBe(
      " a   b <br> c".replaceAll(" ", "&nbsp;"),
    );
  });

  test("leaves code blocks as they are, but for their classes", () => {
    const body = parse(
      cleanCopiedHtml(
        '<pre class="RichTextSemanticContract__code" data-language="sql" spellcheck="false"><span class="token">select</span>  1</pre>',
      ),
    );

    expect(body.innerHTML).toBe(
      '<pre data-language="sql" spellcheck="false"><span>select</span>  1</pre>',
    );
  });

  /**
   * The editor's own text colors stay (they are the writer's), and a block
   * copy keeps the mark its paste looks for.
   */
  test("keeps text colors and data attributes", () => {
    const body = parse(
      cleanCopiedHtml(
        '<div data-lexical-block-copy="true"><p><span style="color: rgb(224, 62, 62); white-space: pre-wrap;">red</span></p></div>',
      ),
    );

    expect(body.innerHTML).toBe(
      '<div data-lexical-block-copy="true"><p><span style="color: rgb(224, 62, 62);">red</span></p></div>',
    );
  });
});
