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

describe("cleanCopiedHtml, what the editor reads back", () => {
  /**
   * A to-do goes out as a task list item, the form Notion (and GitHub) read
   * as a to-do — the editor's own <div class="check-block"> pasted into
   * Notion as plain text. Its class stays, for the editor to read it back.
   */
  test("a to-do is a task list item, its checkbox an input", () => {
    const body = parse(
      cleanCopiedHtml(
        '<div class="check-block check-block-checked flex gap-2" data-checked="true"><span class="font-semibold">Create MR</span></div>',
      ),
    );

    expect(body.innerHTML).toBe(
      '<ul><li class="check-block check-block-checked" data-checked="true"><input type="checkbox" checked="">Create MR</li></ul>',
    );
  });

  test("to-dos one after another share a list", () => {
    const body = parse(
      cleanCopiedHtml(
        '<div class="check-block">a</div><div class="check-block check-block-checked" data-checked="true">b</div><p>c</p>',
      ),
    );

    expect(body.innerHTML).toBe(
      '<ul><li class="check-block"><input type="checkbox">a</li><li class="check-block check-block-checked" data-checked="true"><input type="checkbox" checked="">b</li></ul><p>c</p>',
    );
  });
});

/**
 * A simple table in Notion holds no lists: a <ul> in a cell went in as text
 * Notion indented one way or another, cell by cell. A cell's list goes out
 * as lines of text, the way Notion (and this editor's markdown) writes one.
 */
describe("cleanCopiedHtml, lists in table cells", () => {
  test("a bullet list in a cell is lines of text", () => {
    const body = parse(
      cleanCopiedHtml(
        '<table><tbody><tr><td><ul class="ml-6"><li value="1"><span>Keep only</span></li><li value="2">Bỏ qua</li></ul></td></tr></tbody></table>',
      ),
    );

    expect(body.querySelector("td")!.innerHTML).toBe("• Keep only<br>• Bỏ qua");
  });

  test("a numbered list counts, and words before it stay", () => {
    const body = parse(
      cleanCopiedHtml(
        "<table><tbody><tr><td><p>Steps</p><ol><li>one</li><li>two</li></ol></td></tr></tbody></table>",
      ),
    );

    expect(body.querySelector("td")!.innerHTML).toBe(
      "<p>Steps</p>1. one<br>2. two",
    );
  });

  /** As Lexical nests one: in an item of its own after its parent. */
  test("a nested item is indented under its item", () => {
    const body = parse(
      cleanCopiedHtml(
        "<table><tbody><tr><td><ul><li>a</li><li><ul><li>b</li></ul></li></ul></td></tr></tbody></table>",
      ),
    );

    expect(body.querySelector("td")!.innerHTML).toBe(
      "• a<br>&nbsp;&nbsp;&nbsp;&nbsp;• b",
    );
  });

  test("a list outside a table stays a list", () => {
    const body = parse(cleanCopiedHtml("<ul><li>a</li></ul>"));
    expect(body.innerHTML).toBe("<ul><li>a</li></ul>");
  });
});
