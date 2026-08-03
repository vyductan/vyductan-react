import { describe, expect, test } from "vitest";

import { parseInlineStyle } from "./parse-inline-style";

describe("parseInlineStyle", () => {
  test("returns undefined when nothing is styled", () => {
    expect(parseInlineStyle("")).toBeUndefined();
    expect(parseInlineStyle("   ")).toBeUndefined();
  });

  test("keeps the declarations the toolbar plugins write", () => {
    expect(parseInlineStyle("color: #eb5757")).toEqual({ color: "#eb5757" });
    expect(parseInlineStyle("background-color: #fff3bf")).toEqual({
      backgroundColor: "#fff3bf",
    });
    expect(parseInlineStyle("font-size: 20px")).toEqual({ fontSize: "20px" });
    expect(
      parseInlineStyle('font-family: "Segoe UI", -apple-system, sans-serif'),
    ).toEqual({ fontFamily: '"Segoe UI", -apple-system, sans-serif' });
  });

  test("keeps every color notation Lexical can persist", () => {
    expect(parseInlineStyle("color: red")).toEqual({ color: "red" });
    expect(parseInlineStyle("color: #fff")).toEqual({ color: "#fff" });
    expect(parseInlineStyle("color: rgba(235, 87, 87, 0.5)")).toEqual({
      color: "rgba(235, 87, 87, 0.5)",
    });
    expect(parseInlineStyle("color: oklch(65% 0.191 256)")).toEqual({
      color: "oklch(65% 0.191 256)",
    });
  });

  test("parses multiple declarations and tolerates loose formatting", () => {
    expect(
      parseInlineStyle("  COLOR : #eb5757 ; font-size:20px ;  "),
    ).toEqual({ color: "#eb5757", fontSize: "20px" });
  });

  test("drops properties outside the allowlist but keeps their neighbours", () => {
    expect(parseInlineStyle("position: fixed; color: #2f9e44")).toEqual({
      color: "#2f9e44",
    });
    expect(parseInlineStyle("position: fixed")).toBeUndefined();
    expect(parseInlineStyle("--custom-token: 1")).toBeUndefined();
  });

  test("drops values that could smuggle CSS beyond a color", () => {
    // `url()` is the classic exfiltration vector, and the pattern that follows
    // it — unbalanced parens, nested functions, comment escapes — is why values
    // are matched rather than sanitized.
    expect(
      parseInlineStyle("background-color: url(https://example.com/x.png)"),
    ).toBeUndefined();
    expect(
      parseInlineStyle("color: image-set(url(https://example.com/x.png))"),
    ).toBeUndefined();
    expect(parseInlineStyle("color: rgb(0,0,0)/*")).toBeUndefined();
    expect(parseInlineStyle("font-family: Arial(")).toBeUndefined();
    expect(parseInlineStyle("font-size: 20px; }body{color:red")).toEqual({
      fontSize: "20px",
    });
  });

  test("drops malformed font sizes", () => {
    expect(parseInlineStyle("font-size: 20")).toBeUndefined();
    expect(parseInlineStyle("font-size: calc(1rem + 2px)")).toBeUndefined();
  });

  test("ignores declarations with no value", () => {
    expect(parseInlineStyle("color:")).toBeUndefined();
    expect(parseInlineStyle("color")).toBeUndefined();
  });
});
