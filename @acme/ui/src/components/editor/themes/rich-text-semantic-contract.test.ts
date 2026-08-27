import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

import { editorTheme } from "./editor-theme";
import {
  richTextSemanticContract,
  richTextSemanticContractKeys,
} from "./rich-text-semantic-contract";

describe("richTextSemanticContract", () => {
  const editorThemeCss = readFileSync(
    path.resolve(import.meta.dirname, "./editor-theme.css"),
    "utf8",
  );
  const editorRuntimeCss = readFileSync(
    path.resolve(import.meta.dirname, "./editor-theme.runtime.css"),
    "utf8",
  );

  test("covers only publish-safe semantic rich-text styles", () => {
    expect(richTextSemanticContractKeys).toEqual([
      "heading",
      "paragraph",
      "quote",
      "link",
      "list",
      "text",
      "code",
      "codeHighlight",
      "table",
      "tableCell",
      "tableCellHeader",
      "hr",
      "checkBlock",
      "checkBlockIcon",
      "checkBlockChecked",
    ]);

    expect(richTextSemanticContract).toMatchObject({
      heading: {
        h1: expect.any(String),
        h2: expect.any(String),
        h3: expect.any(String),
        h4: expect.any(String),
        h5: expect.any(String),
        h6: expect.any(String),
      },
      paragraph: expect.any(String),
      quote: expect.any(String),
      link: expect.any(String),
      list: {
        checklist: expect.any(String),
        listitem: expect.any(String),
        listitemChecked: expect.any(String),
        listitemUnchecked: expect.any(String),
        nested: {
          listitem: expect.any(String),
        },
        ol: expect.any(String),
        olDepth: expect.any(Array),
        ul: expect.any(String),
        ulDepth: expect.any(Array),
      },
      text: {
        bold: expect.any(String),
        code: expect.any(String),
        italic: expect.any(String),
        strikethrough: expect.any(String),
        subscript: expect.any(String),
        superscript: expect.any(String),
        underline: expect.any(String),
        underlineStrikethrough: expect.any(String),
      },
      code: "RichTextSemanticContract__code",
      codeHighlight: {
        atrule: "RichTextSemanticContract__tokenAttr",
        attr: "RichTextSemanticContract__tokenAttr",
        boolean: "RichTextSemanticContract__tokenProperty",
        builtin: "RichTextSemanticContract__tokenSelector",
        cdata: "RichTextSemanticContract__tokenComment",
        char: "RichTextSemanticContract__tokenSelector",
        class: "RichTextSemanticContract__tokenFunction",
        "class-name": "RichTextSemanticContract__tokenFunction",
        comment: "RichTextSemanticContract__tokenComment",
        constant: "RichTextSemanticContract__tokenProperty",
        deleted: "RichTextSemanticContract__tokenProperty",
        doctype: "RichTextSemanticContract__tokenComment",
        entity: "RichTextSemanticContract__tokenOperator",
        function: "RichTextSemanticContract__tokenFunction",
        important: "RichTextSemanticContract__tokenVariable",
        inserted: "RichTextSemanticContract__tokenSelector",
        keyword: "RichTextSemanticContract__tokenAttr",
        namespace: "RichTextSemanticContract__tokenVariable",
        number: "RichTextSemanticContract__tokenProperty",
        operator: "RichTextSemanticContract__tokenOperator",
        prolog: "RichTextSemanticContract__tokenComment",
        property: "RichTextSemanticContract__tokenProperty",
        punctuation: "RichTextSemanticContract__tokenPunctuation",
        regex: "RichTextSemanticContract__tokenVariable",
        selector: "RichTextSemanticContract__tokenSelector",
        string: "RichTextSemanticContract__tokenSelector",
        symbol: "RichTextSemanticContract__tokenProperty",
        tag: "RichTextSemanticContract__tokenProperty",
        url: "RichTextSemanticContract__tokenOperator",
        variable: "RichTextSemanticContract__tokenVariable",
      },
      table: expect.stringContaining("RichTextSemanticContract__table"),
      tableCell: expect.stringContaining("RichTextSemanticContract__tableCell"),
      tableCellHeader: expect.stringContaining(
        "RichTextSemanticContract__tableCellHeader",
      ),
      hr: expect.stringContaining("after:bg-border"),
      checkBlock: expect.any(String),
      checkBlockIcon: expect.any(String),
      checkBlockChecked: expect.any(String),
    });

    expect(richTextSemanticContract).not.toHaveProperty(
      "tableCellActionButton",
    );
    expect(richTextSemanticContract).not.toHaveProperty("tableCellResizer");
    expect(richTextSemanticContract).not.toHaveProperty("tableCellSelected");
    expect(richTextSemanticContract).not.toHaveProperty("tableSelected");
    expect(richTextSemanticContract).not.toHaveProperty("image");
    expect(richTextSemanticContract).not.toHaveProperty("inlineImage");
    expect(richTextSemanticContract).not.toHaveProperty("hashtag");
    expect(richTextSemanticContract).not.toHaveProperty("keyword");
  });

  test("is reused by editorTheme for semantic keys while editor-only keys stay local", () => {
    for (const key of richTextSemanticContractKeys) {
      expect(editorTheme[key]).toBe(richTextSemanticContract[key]);
    }

    expect(editorTheme.tableCellActionButton).toEqual(expect.any(String));
    expect(editorTheme.tableCellResizer).toEqual(expect.any(String));
    expect(editorTheme.tableSelected).toEqual(expect.any(String));
  });

  test("editor-theme.css keeps only shared semantic CSS hooks", () => {
    expect(editorThemeCss).toContain(".RichTextSemanticContract__code");
    expect(editorThemeCss).toContain(".RichTextSemanticContract__table");
    expect(editorThemeCss).toContain(".RichTextSemanticContract__tableCell");
    expect(editorThemeCss).toContain(
      ".RichTextSemanticContract__tableCellHeader",
    );
    expect(editorThemeCss).toContain(".RichTextSemanticContract__tokenComment");
    expect(editorThemeCss).toContain(
      ".RichTextSemanticContract__tokenFunction",
    );

    expect(editorThemeCss).not.toContain(
      '.ContentEditable__root [data-lexical-editor="true"]',
    );
    expect(editorThemeCss).not.toContain(".Collapsible__");
    expect(editorThemeCss).not.toContain(".editor-image");
    expect(editorThemeCss).not.toContain(".inline-editor-image");
  });

  test("expresses color through theme tokens rather than literals", () => {
    // Published content has to follow the host's palette. A literal here pins it
    // to whichever theme the author happened to be looking at.
    const serialized = JSON.stringify(richTextSemanticContract);

    expect(serialized).not.toMatch(/rgba?\(/);
    expect(serialized).not.toMatch(/#[\da-f]{3,8}/i);
    expect(serialized).not.toMatch(/-(gray|slate|zinc|neutral|stone)-\d{2,3}/);
  });

  test("stylesheets are layered so utilities can still win", () => {
    // Unlayered rules outrank every Tailwind utility, which is how the CSS here
    // silently beat the contract's own classes.
    for (const css of [editorThemeCss, editorRuntimeCss]) {
      expect(css).toContain("@layer components");
      expect(css).not.toContain("rgba(55, 53, 47");
      expect(css).not.toContain("rgba(247, 246, 243");
    }

    // Prism's palette is the deliberate exception — no host ships syntax colors —
    // so it carries both themes itself.
    expect(editorThemeCss).toContain(
      ":is(.dark *).RichTextSemanticContract__tokenProperty",
    );
  });

  test("EditorRender carries the publish-safe stylesheet itself", () => {
    // Without this import the renderer only looks styled on routes that also
    // mount the editor: a publish-only route would silently lose the code block
    // and table styling, which no rendering assertion would catch.
    const editorRenderSource = readFileSync(
      path.resolve(import.meta.dirname, "../editor-render.tsx"),
      "utf8",
    );

    expect(editorRenderSource).toContain('import "./themes/editor-theme.css"');
    expect(editorRenderSource).not.toContain("editor-theme.runtime.css");
  });

  test("editor runtime CSS keeps editor-only classes out of the shared artifact", () => {
    expect(editorRuntimeCss).toContain(".Collapsible__container");
    expect(editorRuntimeCss).toContain(".Collapsible__title");
    expect(editorRuntimeCss).toContain(".editor-image");
    expect(editorRuntimeCss).toContain(".inline-editor-image");
  });
});
