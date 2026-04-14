/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
/**
 * Shared utilities for converting between Lexical editor content and Markdown
 * Used across the application to avoid code duplication
 */

import type { LexicalEditor } from "lexical";
import { createHeadlessEditor } from "@lexical/headless";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from "@lexical/markdown";
import { $getRoot, createEditor } from "lexical";

import type { LexicalEditorContent } from "../types";
import { nodes } from "../nodes/nodes";
import { MARKDOWN_TRANSFORMERS } from "../transformers/markdown-transformers";

/**
 * Convert LexicalEditorContent to markdown string
 * Creates a temporary editor instance to properly convert Lexical state to markdown
 */
export function lexicalContentToMarkdown(
  lexicalContent: LexicalEditorContent | null | undefined,
): string {
  if (!lexicalContent?.root) {
    return "";
  }

  try {
    // Create a temporary editor instance with proper nodes to convert Lexical to markdown
    const editor = createEditor({
      namespace: "temp-converter",
      onError: (error) => {
        console.error("Lexical editor error during conversion:", error);
      },
      nodes: nodes as never,
    });

    let markdown = "";

    // Parse the Lexical content as editor state
    const editorState = editor.parseEditorState(JSON.stringify(lexicalContent));

    // Read the editor state and convert to markdown
    editorState.read(() => {
      markdown = $convertToMarkdownString(MARKDOWN_TRANSFORMERS);
    });

    return markdown;
  } catch (error) {
    console.error("Error converting Lexical to markdown:", error);
    return "";
  }
}

export const EMPTY_LEXICAL_EDITOR_CONTENT: LexicalEditorContent = {
  root: {
    type: "root",
    format: "",
    indent: 0,
    version: 1,
    children: [],
    direction: "ltr",
  },
};

type MarkdownConverterEditorFactory = typeof createHeadlessEditor;

type MarkdownToLexicalContentOptions = {
  createEditor?: MarkdownConverterEditorFactory;
};

/**
 * Convert markdown string to LexicalEditorContent.
 * Returns null when conversion fails so callers can distinguish actual failures.
 */
export function tryMarkdownToLexicalContent(
  markdown: string,
  options: MarkdownToLexicalContentOptions = {},
): LexicalEditorContent | null {
  if (!markdown.trim()) {
    return EMPTY_LEXICAL_EDITOR_CONTENT;
  }

  const createMarkdownEditor = options.createEditor ?? createHeadlessEditor;

  try {
    const editor = createMarkdownEditor({
      namespace: "temp-markdown-converter",
      onError: (error) => {
        throw error;
      },
      nodes: nodes as never,
    });

    editor.update(
      () => {
        const root = $getRoot();
        root.clear();
        $convertFromMarkdownString(markdown, MARKDOWN_TRANSFORMERS);
      },
      { discrete: true },
    );

    return editor.getEditorState().toJSON() as LexicalEditorContent;
  } catch (error) {
    console.error("Error converting markdown to Lexical:", error);
    return null;
  }
}

/**
 * Convert markdown string to LexicalEditorContent
 * Uses Lexical's markdown converter to properly parse markdown syntax
 */
export function markdownToLexicalContent(
  markdown: string,
  options: MarkdownToLexicalContentOptions = {},
): LexicalEditorContent {
  return (
    tryMarkdownToLexicalContent(markdown, options) ??
    EMPTY_LEXICAL_EDITOR_CONTENT
  );
}

/**
 * Convert current editor state to markdown string
 * Uses the provided editor instance directly (more efficient than creating temp editor)
 */
export function getMarkdownFromEditor(editor: LexicalEditor): string {
  try {
    let markdown = "";
    editor.getEditorState().read(() => {
      markdown = $convertToMarkdownString(MARKDOWN_TRANSFORMERS);
    });
    return markdown;
  } catch (error) {
    console.error("Error getting markdown from editor:", error);
    return "";
  }
}
