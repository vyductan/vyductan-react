/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
import type { LexicalEditorContent } from "../types";
import {
  createBrowserHtmlDocument,
  tryHtmlDocumentToLexicalContent,
  tryHtmlToLexicalContent,
} from "../utils/html-converter";
import { tryMarkdownToLexicalContent } from "../utils/lexical-converter";

export type EditorRenderInputFormat = "json" | "markdown" | "html";

export function resolveEditorRenderContentSync(
  value: LexicalEditorContent | string,
  format: EditorRenderInputFormat = "json",
): LexicalEditorContent | string | null {
  if (format === "json") {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  if (format === "markdown") {
    return tryMarkdownToLexicalContent(value);
  }

  if (typeof DOMParser !== "function") {
    return null;
  }

  return tryHtmlDocumentToLexicalContent(createBrowserHtmlDocument(value));
}

export async function resolveServerHtmlEditorRenderContent(
  value: string,
  options?: Parameters<typeof tryHtmlToLexicalContent>[1],
): Promise<LexicalEditorContent | null> {
  return tryHtmlToLexicalContent(value, options);
}
