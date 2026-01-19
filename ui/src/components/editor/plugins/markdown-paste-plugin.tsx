"use client";

import { useEffect } from "react";
import { $convertFromMarkdownString } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  PASTE_COMMAND,
} from "lexical";

import { MARKDOWN_TRANSFORMERS } from "../transformers/markdown-transformers";

/**
 * Plugin that converts pasted markdown text to Lexical format
 * When markdown syntax like "# Heading" is pasted, it converts to proper heading nodes
 */
export function MarkdownPastePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }

        const clipboardData = event.clipboardData;
        if (!clipboardData) {
          return false;
        }

        // Get plain text from clipboard
        const text = clipboardData.getData("text/plain");
        if (!text || text.trim().length === 0) {
          return false;
        }

        // Check if the text looks like markdown (has markdown syntax)
        const hasMarkdownSyntax =
          /^#{1,6}\s|^\*\s|^-\s|^\d+\.\s|^>\s|^`|^\[.*\]\(|^!\[.*\]\(/m.test(
            text,
          );

        if (!hasMarkdownSyntax) {
          // Not markdown, let default paste handler deal with it
          return false;
        }

        // Convert markdown to Lexical format and insert at cursor
        editor.update(() => {
          const currentSelection = $getSelection();
          if (!$isRangeSelection(currentSelection)) {
            return;
          }

          // Delete selected content if any
          if (!currentSelection.isCollapsed()) {
            currentSelection.removeText();
          }

          // Create a temporary paragraph to convert markdown into
          const tempParagraph = $createParagraphNode();
          const root = $getRoot();

          // Temporarily append temp paragraph to root
          root.append(tempParagraph);

          // Convert markdown into the temp paragraph
          $convertFromMarkdownString(
            text,
            MARKDOWN_TRANSFORMERS,
            tempParagraph,
          );

          // Get all children from temp paragraph
          const children = tempParagraph.getChildren();

          // Remove temp paragraph from root
          tempParagraph.remove();

          // Insert converted nodes at cursor position
          if (children.length > 0) {
            $insertNodes(children);
          }
        });

        // Prevent default paste behavior
        event.preventDefault();
        return true;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);

  return null;
}
