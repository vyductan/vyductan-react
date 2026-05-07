import { describe, expect, test } from "vitest";

import { normalizeEditorContent } from "./normalize-editor-content";
import {
  canonicalEditorRenderFixtureNames,
  editorRenderFixtures,
  invalidEditorRenderFixtureNames,
  unsupportedEditorRenderFixtureNames,
} from "./render-fixtures";

describe("normalizeEditorContent", () => {
  test("normalizes canonical fixture objects without changing identity", () => {
    for (const fixtureName of canonicalEditorRenderFixtureNames) {
      const fixture = editorRenderFixtures[fixtureName];

      expect(normalizeEditorContent(fixture.content)).toBe(fixture.content);
    }
  });

  test("parses canonical fixture JSON strings exactly once at the renderer boundary", () => {
    for (const fixtureName of canonicalEditorRenderFixtureNames) {
      const fixture = editorRenderFixtures[fixtureName];

      expect(normalizeEditorContent(fixture.serialized)).toEqual(
        fixture.content,
      );
    }
  });

  test("returns null for invalid JSON strings", () => {
    expect(normalizeEditorContent("not json")).toBeNull();
    expect(normalizeEditorContent("<p>html is unsupported</p>")).toBeNull();
    expect(normalizeEditorContent("# markdown is unsupported")).toBeNull();
  });

  test("returns null for invalid top-level payloads", () => {
    expect(normalizeEditorContent(null as never)).toBeNull();
    expect(normalizeEditorContent(undefined as never)).toBeNull();
    expect(normalizeEditorContent(42 as never)).toBeNull();
    expect(normalizeEditorContent(true as never)).toBeNull();
    expect(normalizeEditorContent([] as never)).toBeNull();
    expect(normalizeEditorContent({} as never)).toBeNull();
    expect(normalizeEditorContent({ root: [] } as never)).toBeNull();
  });

  test("returns null for malformed Lexical content shapes", () => {
    expect(
      normalizeEditorContent({
        root: {
          type: "root",
          children: [],
        },
      } as never),
    ).toBeNull();

    expect(
      normalizeEditorContent({
        root: {
          type: "paragraph",
          direction: null,
          format: "",
          indent: 0,
          version: 1,
          children: [],
        },
      } as never),
    ).toBeNull();

    expect(
      normalizeEditorContent({
        root: {
          type: "root",
          direction: null,
          format: "",
          indent: 0,
          version: 1,
          children: [
            {
              type: "paragraph",
              direction: null,
              format: "",
              indent: 0,
              version: 1,
              children: [{ text: "missing text node shape" }],
            },
          ],
        },
      } as never),
    ).toBeNull();
  });

  test("accepts the approved supported node fixture set", () => {
    expect(canonicalEditorRenderFixtureNames).toEqual([
      "paragraph",
      "heading",
      "quote",
      "link",
      "autolink",
      "bulletList",
      "numberList",
      "checkList",
      "checkBlock",
      "codeBlock",
      "horizontalRule",
      "table",
      "formattedText",
      "inlineCode",
      "softBreak",
    ]);

    for (const fixtureName of canonicalEditorRenderFixtureNames) {
      expect(
        normalizeEditorContent(editorRenderFixtures[fixtureName].content),
      ).toEqual(editorRenderFixtures[fixtureName].content);
    }
  });

  test("drops unsupported fixtures at the boundary by returning null", () => {
    expect(unsupportedEditorRenderFixtureNames).toEqual([
      "image",
      "video",
      "fileAttachment",
      "equation",
      "poll",
      "toc",
      "layout",
      "collapsible",
      "embed",
      "mention",
      "hashtag",
      "keyword",
      "autocomplete",
      "pageBreak",
    ]);

    for (const fixtureName of unsupportedEditorRenderFixtureNames) {
      const fixture = editorRenderFixtures[fixtureName];

      if (typeof fixture.content !== "string") {
        expect(normalizeEditorContent(fixture.content)).toBeNull();
      }
      expect(normalizeEditorContent(fixture.serialized)).toBeNull();
    }
  });

  test("drops explicit invalid fixtures at the boundary by returning null", () => {
    expect(invalidEditorRenderFixtureNames).toEqual([
      "invalidJson",
      "invalidShape",
    ]);

    for (const fixtureName of invalidEditorRenderFixtureNames) {
      const fixture = editorRenderFixtures[fixtureName];

      if (typeof fixture.content !== "string") {
        expect(normalizeEditorContent(fixture.content)).toBeNull();
      }
      expect(normalizeEditorContent(fixture.serialized)).toBeNull();
    }
  });
});
