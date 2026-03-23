/**
 * Shared utilities for converting between Lexical editor content and Markdown
 * Used across the application to avoid code duplication
 */

import type { LexicalEditor } from "lexical";
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

/**
 * Convert markdown string to LexicalEditorContent
 * Uses Lexical's markdown converter to properly parse markdown syntax
 */
export function markdownToLexicalContent(
  markdown: string,
): LexicalEditorContent {
  if (!markdown.trim()) {
    return {
      root: {
        type: "root",
        format: "",
        indent: 0,
        version: 1,
        children: [],
        direction: "ltr",
      },
    };
  }

  try {
    // Create a temporary editor instance with proper nodes to convert markdown to Lexical
    const editor = createEditor({
      namespace: "temp-markdown-converter",
      onError: (error) => {
        console.error(
          "Lexical editor error during markdown conversion:",
          error,
        );
      },
      nodes: nodes as never,
    });

    let lexicalContent: LexicalEditorContent | null = null;

    // Convert markdown to Lexical editor state
    editor.update(
      () => {
        const root = $getRoot();
        root.clear(); // Clear existing content
        $convertFromMarkdownString(markdown, MARKDOWN_TRANSFORMERS);
      },
      { discrete: true },
    );

    // Get the editor state immediately after update (update is synchronous)
    const editorState = editor.getEditorState();
    const serializedState = editorState.toJSON();
    lexicalContent = serializedState as LexicalEditorContent;

    return lexicalContent;
  } catch (error) {
    console.error("Error converting markdown to Lexical:", error);
    // Fallback to empty structure on error
    return {
      root: {
        type: "root",
        format: "",
        indent: 0,
        version: 1,
        children: [],
        direction: "ltr",
      },
    };
  }
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
