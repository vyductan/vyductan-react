import "@testing-library/jest-dom/vitest";

import * as React from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { sanitizeRichTextHtml } from "@acme/ui/lib/sanitize-html";

import { Editor } from "./editor";

Object.assign(globalThis, { React });

afterEach(() => {
  cleanup();
});

/**
 * A document covering every block and inline construct the html editor round
 * trips. Written as html rather than reusing the Lexical-JSON kitchen sink
 * because this needs the export path specifically, and there is no json-to-html
 * helper to bridge the two.
 */
const FULL_DOCUMENT_HTML = [
  "<h1>Editor kitchen sink</h1>",
  "<h2>Inline marks</h2>",
  "<p><b>bold</b>, <i>italic</i>, <u>underline</u>, <s>struck</s>, <code>code</code>, H<sub>2</sub>O, x<sup>2</sup></p>",
  "<h3>Color and size</h3>",
  '<p><span style="color: rgb(251, 44, 54);">colored</span> <span style="background-color: rgba(251, 44, 54, 0.25);">highlighted</span> <span style="font-size: 20px;">larger</span></p>',
  '<p><a href="https://example.com">a link</a></p>',
  "<ul><li>first</li><li>second<ul><li>nested</li></ul></li></ul>",
  "<ol><li>step one</li><li>step two</li></ol>",
  "<blockquote>a quote</blockquote>",
  "<pre><code>const answer = 42;</code></pre>",
  "<table><tbody><tr><th>Header</th><td>Cell</td></tr></tbody></table>",
  "<hr>",
  "<p>line one<br>line two</p>",
  '<p><img src="https://example.com/a.png" alt="an image" width="100" height="50"></p>',
].join("");

function renderHtmlEditor() {
  let exportedHtml = "";

  render(
    <Editor
      autoFocus={false}
      format="html"
      onChange={(htmlString) => {
        exportedHtml = htmlString;
      }}
      value={FULL_DOCUMENT_HTML}
    />,
  );

  return () => exportedHtml;
}

function tagNamesOf(html: string): string[] {
  const parsed = new DOMParser().parseFromString(html, "text/html");

  return [...parsed.body.querySelectorAll("*")]
    .map((node) => node.localName)
    .sort();
}

/**
 * The sanitizer's allowlist is a claim about what the editor emits, and a claim
 * like that rots quietly: adding a node type to the editor would start losing it
 * on the way out with nothing failing.
 *
 * So rather than restating the allowlist, these round trip a full document and
 * assert sanitizing the export is a no-op. It is the check that can only be
 * written where the editor and the sanitizer live together.
 */
describe("editor output survives sanitizing", () => {
  test("sanitizing a full exported document changes nothing", async () => {
    const readHtml = renderHtmlEditor();

    await waitFor(() => {
      expect(readHtml()).toContain("Editor kitchen sink");
    });

    expect(sanitizeRichTextHtml(readHtml())).toBe(readHtml());
  });

  test("keeps every tag the export produces", async () => {
    const readHtml = renderHtmlEditor();

    await waitFor(() => {
      expect(readHtml()).toContain("Editor kitchen sink");
    });

    const exported = readHtml();

    expect(tagNamesOf(sanitizeRichTextHtml(exported))).toEqual(
      tagNamesOf(exported),
    );
  });
});
