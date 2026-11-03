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
 * Notion keeps no list blocks in a table cell: a list there is lines of
 * text — two spaces and "• " a level, four more spaces a level deeper,
 * "◦ " — which it lays out as a list. A <ul> sent in a cell pasted as
 * "• a" with no indent, plain text to Notion. Each item goes out as such a
 * line, a paragraph of its own, its spaces plain.
 */
describe("cleanCopiedHtml, lists in table cells", () => {
  const cell = (html: string) =>
    parse(
      cleanCopiedHtml(
        `<table><tbody><tr><td>${html}</td></tr></tbody></table>`,
      ),
    ).querySelector("td")!;

  test("a bulleted list is Notion's lines of text, nested items indented", () => {
    const td = cell(
      "<p>base url</p><ul><li>a</li><li><ul><li>d</li></ul></li></ul><p>after</p>",
    );

    expect(td.innerHTML).toBe(
      "<p>base url</p><p>  • a</p><p>      ◦ d</p><p>after</p>",
    );
  });

  test("an item keeps its formatting", () => {
    const td = cell(
      "<ul><li><b><strong>Bold:</strong></b> see <code>fn_x</code></li></ul>",
    );

    expect(td.innerHTML).toBe(
      "<p>\u200b  • <strong>Bold:</strong> see <code>fn_x</code></p>",
    );
  });

  /**
   * Notion trims the spaces at the start of a pasted cell — `&nbsp;` too —
   * so a cell opening with a list lost its first item's indent, the rest
   * kept theirs. A zero-width space ahead of them keeps them; Notion drops
   * it, leaving the line as its own.
   */
  test("a list opening a cell keeps its first item's indent", () => {
    const td = cell("<ul><li>a</li><li>b</li></ul>");

    expect(td.innerHTML).toBe("<p>\u200b  • a</p><p>  • b</p>");
  });

  test("a numbered list counts from its start", () => {
    const td = cell('<ol start="3"><li>c</li><li>d</li></ol>');

    expect(td.innerHTML).toBe("<p>\u200b  3. c</p><p>  4. d</p>");
  });

  /**
   * Cmd+A in a cell and copy: what is on the clipboard is the cell's
   * content, no table around it, and it is pasted into a Notion cell. Its
   * lists go out as the cell lines too.
   */
  test("a copy from inside one cell sends its lists as the cell lines", () => {
    expect(
      cleanCopiedHtml("<p>top</p><ul><li>a</li><li>b</li></ul>", {
        fromCell: true,
      }),
    ).toBe("<p>top</p><p>  • a</p><p>  • b</p>");
    expect(cleanCopiedHtml("<ul><li>a</li></ul>", { fromCell: true })).toBe(
      "<p>\u200b  • a</p>",
    );
  });

  test("a list outside a table stays a list", () => {
    expect(cleanCopiedHtml("<ul><li>a</li></ul>")).toBe("<ul><li>a</li></ul>");
  });
});

/**
 * Lexical keeps a nested list in an item of its own after its parent item.
 * Notion (and HTML) take that item for an empty one: pasted, each nested
 * list came in under an extra empty "List" item, a level off. Nested lists
 * go out inside their parent item, as HTML nests them.
 */
describe("cleanCopiedHtml, nested lists", () => {
  test("a nested list goes into the item before it", () => {
    const body = parse(
      cleanCopiedHtml(
        "<ol><li>Khách</li><li><ul><li>Nguy cơ</li><li>Giải pháp</li><li><ul><li></li><li>Nếu không</li></ul></li><li>Dùng Cron</li></ul></li></ol>",
      ),
    );

    expect(body.innerHTML).toBe(
      "<ol><li>Khách<ul><li>Nguy cơ</li><li>Giải pháp<ul><li></li><li>Nếu không</li></ul></li><li>Dùng Cron</li></ul></li></ol>",
    );
  });

  /**
   * Bullets under a numbered item are a list of their own after it, opening
   * with a holder: as copied from the editor. They go into the numbered
   * item, as Notion nests them; pasted as they were, Notion made an empty
   * bullet of the holder.
   */
  test("a nested list opening the next list goes into the item before", () => {
    const body = parse(
      cleanCopiedHtml(
        '<ol><li value="1">Khách</li></ol><ul><li value="1"><ul><li value="1">Nguy cơ</li><li value="2">Giải pháp<ul><li value="1">Nếu giữ</li></ul></li><li value="3">Dùng Cron</li></ul></li></ul>',
      ),
    );

    expect(body.innerHTML).toBe(
      '<ol><li value="1">Khách<ul><li value="1">Nguy cơ</li><li value="2">Giải pháp<ul><li value="1">Nếu giữ</li></ul></li><li value="3">Dùng Cron</li></ul></li></ol>',
    );
  });

  /** With no item before it — a list under a to-do — it stays as it is. */
  test("a nested list first in its list stays", () => {
    const body = parse(
      cleanCopiedHtml("<ul><li><ul><li>a</li></ul></li><li>b</li></ul>"),
    );

    expect(body.innerHTML).toBe(
      "<ul><li><ul><li>a</li></ul></li><li>b</li></ul>",
    );
  });
});
