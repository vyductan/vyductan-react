/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
import { createHeadlessEditor } from "@lexical/headless";
import { $generateNodesFromDOM } from "@lexical/html";
import { $getRoot } from "lexical";

import type { LexicalEditorContent } from "../types";
import { nodes } from "../nodes/nodes";

export function createBrowserHtmlDocument(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

export function importDomIntoEditor(
  editor: Parameters<typeof $generateNodesFromDOM>[0],
  document: Document,
): void {
  const lexicalNodes = $generateNodesFromDOM(editor, document);
  const root = $getRoot();

  root.clear();
  root.append(...lexicalNodes);
}

type HtmlDocumentFactoryResult =
  | Document
  | { window: { document: Document } }
  | Promise<Document | { window: { document: Document } }>;

type HtmlConverterOptions = {
  createEditor?: typeof createHeadlessEditor;
  createDocument?: (html: string) => HtmlDocumentFactoryResult;
};

async function defaultCreateServerHtmlDocument(
  html: string,
): Promise<Document> {
  const { JSDOM } = await import("jsdom");
  return new JSDOM(html).window.document;
}

function resolveDocument(value: Awaited<HtmlDocumentFactoryResult>): Document {
  if ("window" in value) {
    return value.window.document;
  }

  return value;
}

export function tryHtmlDocumentToLexicalContent(
  document: Document,
  options: Pick<HtmlConverterOptions, "createEditor"> = {},
): LexicalEditorContent | null {
  const createHtmlEditor = options.createEditor ?? createHeadlessEditor;

  try {
    const editor = createHtmlEditor({
      namespace: "temp-html-converter",
      nodes: nodes as never,
      onError: (error) => {
        throw error;
      },
    });

    editor.update(
      () => {
        importDomIntoEditor(editor, document);
      },
      { discrete: true },
    );

    return editor.getEditorState().toJSON() as LexicalEditorContent;
  } catch (error) {
    console.error("Error converting HTML document to Lexical:", error);
    return null;
  }
}

export async function tryHtmlToLexicalContent(
  html: string,
  options: HtmlConverterOptions = {},
): Promise<LexicalEditorContent | null> {
  try {
    const documentFactory =
      options.createDocument ??
      (typeof DOMParser === "function"
        ? (markup: string) => createBrowserHtmlDocument(markup)
        : defaultCreateServerHtmlDocument);

    const document = resolveDocument(await documentFactory(html));
    return tryHtmlDocumentToLexicalContent(document, options);
  } catch (error) {
    console.error("Error converting HTML to Lexical:", error);
    return null;
  }
}
