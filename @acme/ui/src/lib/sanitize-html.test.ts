import { describe, expect, test } from "vitest";

import {
  containsRichTextMarkup,
  sanitizeEmailHtml,
  sanitizeRichTextHtml,
} from "./sanitize-html";

describe("sanitizeRichTextHtml", () => {
  test("strips script tags and event handlers", () => {
    expect(sanitizeRichTextHtml("<p>ok</p><script>alert(1)</script>")).toBe(
      "<p>ok</p>",
    );
    expect(
      sanitizeRichTextHtml('<img src="x" onerror="alert(1)">'),
    ).not.toContain("onerror");
    expect(
      sanitizeRichTextHtml('<p onclick="alert(1)">text</p>'),
    ).not.toContain("onclick");
  });

  test("strips javascript: urls but keeps ordinary links", () => {
    expect(
      sanitizeRichTextHtml('<a href="javascript:alert(1)">x</a>'),
    ).not.toContain("javascript:");
    expect(
      sanitizeRichTextHtml('<a href="https://example.com">x</a>'),
    ).toContain('href="https://example.com"');
  });

  test("forces rel on links that open a new tab", () => {
    const sanitized = sanitizeRichTextHtml(
      '<a href="https://example.com" target="_blank">x</a>',
    );

    expect(sanitized).toContain('rel="noreferrer noopener"');
  });

  test("keeps the inline styling the editor persists", () => {
    // The whole reason `style` is allowed: text color would otherwise be lost
    // between the editor and the published view.
    const sanitized = sanitizeRichTextHtml(
      '<p><span style="color: rgb(251, 44, 54);">red</span></p>',
    );

    expect(sanitized).toContain("color: rgb(251, 44, 54)");
  });

  test("keeps images, which the editor can insert", () => {
    const sanitized = sanitizeRichTextHtml(
      '<img src="https://example.com/a.png" alt="a" width="100" height="50">',
    );

    expect(sanitized).toContain('src="https://example.com/a.png"');
    expect(sanitized).toContain('alt="a"');
  });

  test("keeps the block structure prose styles", () => {
    const html =
      "<h2>Title</h2><ul><li>one</li></ul><blockquote><p>q</p></blockquote><table><tbody><tr><td>c</td></tr></tbody></table>";

    expect(sanitizeRichTextHtml(html)).toBe(html);
  });

  test("keeps the structure Lexical exports that is easy to miss", () => {
    // Both were dropped until editor-sanitize-parity.test.tsx caught them: the
    // language attributes carry a code block's highlighting, and the colgroup
    // carries table column widths.
    const codeBlock =
      '<pre data-language="typescript" data-highlight-language="typescript">const a = 1;</pre>';
    expect(sanitizeRichTextHtml(codeBlock)).toContain(
      'data-language="typescript"',
    );

    const table =
      "<table><colgroup><col><col></colgroup><tbody><tr><td>c</td></tr></tbody></table>";
    expect(sanitizeRichTextHtml(table)).toContain("<colgroup>");
  });

  test("drops tags outside the allowlist without dropping their text", () => {
    expect(sanitizeRichTextHtml("<p>keep <marquee>this</marquee></p>")).toBe(
      "<p>keep this</p>",
    );
  });
});

describe("sanitizeEmailHtml", () => {
  test("keeps the table layout real mail is built from", () => {
    const html =
      '<table cellpadding="8" cellspacing="0" border="0" bgcolor="#f5f5f5"><tbody><tr><td valign="top" align="center"><font face="Arial" color="#333333">Hi</font></td></tr></tbody></table>';

    const sanitized = sanitizeEmailHtml(html);

    expect(sanitized).toContain('cellpadding="8"');
    expect(sanitized).toContain('bgcolor="#f5f5f5"');
    expect(sanitized).toContain('valign="top"');
    expect(sanitized).toContain("<font");
  });

  test("still strips script, handlers, and javascript: urls", () => {
    expect(sanitizeEmailHtml("<p>ok</p><script>alert(1)</script>")).toBe(
      "<p>ok</p>",
    );
    expect(
      sanitizeEmailHtml('<td onmouseover="alert(1)">x</td>'),
    ).not.toContain("onmouseover");
    expect(
      sanitizeEmailHtml('<a href="javascript:alert(1)">x</a>'),
    ).not.toContain("javascript:");
  });

  test("drops a sender stylesheet instead of letting it style the app", () => {
    const sanitized = sanitizeEmailHtml(
      '<style>body{display:none}@import url("https://evil.test/x.css");</style><p>body</p>',
    );

    expect(sanitized).not.toContain("<style");
    expect(sanitized).not.toContain("@import");
    expect(sanitized).toContain("<p>body</p>");
  });

  test("drops the background attribute, which skips the scheme check", () => {
    expect(
      sanitizeEmailHtml('<td background="javascript:alert(1)">x</td>'),
    ).not.toContain("background");
  });

  test("neutralises svg and foreign-content mutation attempts", () => {
    for (const payload of [
      "<svg><style><img src=x onerror=alert(1)></style></svg>",
      "<math><mtext><table><mglyph><style><img src=x onerror=alert(1)>",
      '<noscript><p title="</noscript><img src=x onerror=alert(1)>">',
    ]) {
      const sanitized = sanitizeEmailHtml(payload);
      expect(sanitized).not.toContain("onerror");
    }
  });
});

describe("containsRichTextMarkup", () => {
  test("recognises markup the editor produces", () => {
    for (const value of [
      "<p>text</p>",
      "<h2>Title</h2>",
      "<ul><li>one</li></ul>",
      '<a href="https://example.com">link</a>',
      "<table><tbody><tr><td>c</td></tr></tbody></table>",
      '<img src="https://example.com/a.png">',
      "text with a <br> in it",
      '<span style="color: red">colored</span>',
    ]) {
      expect(containsRichTextMarkup(value)).toBe(true);
    }
  });

  test("leaves prose alone, including comparisons that look like tags", () => {
    for (const value of [
      "Comfortable walking shoes, sunscreen, and a water bottle.",
      "",
      "Bring 2 <3 litre bottles",
      "if a<b then c>d",
      "Price < cost > margin",
      "5 <apples> and 3 <oranges>",
      "email us at a@b.c",
    ]) {
      expect(containsRichTextMarkup(value)).toBe(false);
    }
  });

  test("agrees with the sanitizer about what markup is", () => {
    // A value the detector calls plain text must not lose anything to the
    // sanitizer, and a value it calls markup must survive it.
    const prose = "if a<b then c>d";
    expect(containsRichTextMarkup(prose)).toBe(false);

    const markup = "<p>kept</p>";
    expect(containsRichTextMarkup(markup)).toBe(true);
    expect(sanitizeRichTextHtml(markup)).toBe(markup);
  });
});
