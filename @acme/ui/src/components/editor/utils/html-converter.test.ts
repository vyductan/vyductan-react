import { createHeadlessEditor } from "@lexical/headless";
import { describe, expect, test } from "vitest";

import { nodes } from "../nodes/nodes";
import {
  createBrowserHtmlDocument,
  importDomIntoEditor,
  tryHtmlDocumentToLexicalContent,
  tryHtmlToLexicalContent,
} from "./html-converter";

describe("importDomIntoEditor", () => {
  test("synchronously inserts nodes from a provided Document", () => {
    const editor = createHeadlessEditor({
      namespace: "html-import-test",
      nodes: nodes as never,
      onError: (error) => {
        throw error;
      },
    });
    const document = new DOMParser().parseFromString("<p>Hello world</p>", "text/html");

    editor.update(
      () => {
        importDomIntoEditor(editor, document);
      },
      { discrete: true },
    );

    expect(editor.getEditorState().toJSON()).toMatchObject({
      root: {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "Hello world",
              },
            ],
          },
        ],
      },
    });
  });
});

describe("createBrowserHtmlDocument", () => {
  test("returns a parsed Document through browser DOMParser", () => {
    const document = createBrowserHtmlDocument("<h2>Heading</h2>");

    expect(document.querySelector("h2")?.textContent).toBe("Heading");
  });
});

describe("tryHtmlDocumentToLexicalContent", () => {
  test("converts a provided Document synchronously", () => {
    const document = new DOMParser().parseFromString("<blockquote>Quoted</blockquote>", "text/html");

    expect(tryHtmlDocumentToLexicalContent(document)).toMatchObject({
      root: {
        type: "root",
      },
    });
  });

  test("returns null when the editor reports a runtime error through onError", () => {
    const document = new DOMParser().parseFromString("<p>Broken</p>", "text/html");

    expect(
      tryHtmlDocumentToLexicalContent(document, {
        createEditor: (config) => ({
          update: () => {
            if (!config?.onError) {
              throw new Error("missing onError");
            }

            config.onError(new Error("runtime boom"));
          },
          getEditorState: () => ({
            toJSON: () => ({
              root: {
                type: "root",
                children: [],
                direction: "ltr",
                format: "",
                indent: 0,
                version: 1,
              },
            }),
          }),
        }) as never,
      }),
    ).toBeNull();
  });
});

describe("tryHtmlToLexicalContent", () => {
  test("uses injected JSDOM-style document factory when DOMParser is unavailable", async () => {
    const originalDOMParser = globalThis.DOMParser;

    // @ts-expect-error test-only override
    delete globalThis.DOMParser;

    try {
      const result = await tryHtmlToLexicalContent("<p>Server path</p>", {
        createDocument: async (html) => ({
          window: {
            document: new originalDOMParser().parseFromString(html, "text/html"),
          },
        }),
      });

      expect(result).toMatchObject({
        root: {
          type: "root",
        },
      });
    } finally {
      globalThis.DOMParser = originalDOMParser;
    }
  });

  test("converts valid server HTML through the async HTML-string resolver", async () => {
    const result = await tryHtmlToLexicalContent("<p>Async server content</p>", {
      createDocument: async (html) => ({
        window: {
          document: new DOMParser().parseFromString(html, "text/html"),
        },
      }),
    });

    expect(result).toMatchObject({
      root: {
        type: "root",
        children: [
          {
            type: "paragraph",
          },
        ],
      },
    });
  });

  test("returns null when the document factory throws", async () => {
    await expect(
      tryHtmlToLexicalContent("<p>Broken</p>", {
        createDocument: async () => {
          throw new Error("boom");
        },
      }),
    ).resolves.toBeNull();
  });
});
