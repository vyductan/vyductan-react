import type { RangeSelection } from "lexical";
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  PASTE_COMMAND,
} from "lexical";

import {
  hasMarkdownPasteSyntax,
  normalizeMarkdownPasteForLists,
} from "./markdown-paste-plugin";

const HTML_LINEBREAK_STRUCTURE_SELECTOR =
  "br, p, div, li, ul, ol, blockquote, pre, h1, h2, h3, h4, h5, h6, table, thead, tbody, tfoot, tr, td, th";

export function splitPlainTextIntoParagraphs(text: string): string[][] {
  const normalizedText = text.replaceAll(/\r\n?/g, "\n");
  const paragraphs = normalizedText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.split("\n"));

  return paragraphs.filter((paragraph) =>
    paragraph.some((line) => line.length > 0),
  );
}

/**
 * Inserts plain text as it is: blank lines between paragraphs, single line
 * breaks within one. Nothing in it is read as markdown.
 */
export function $insertPlainText(selection: RangeSelection, text: string) {
  if (!selection.isCollapsed()) {
    selection.removeText();
  }

  for (const [paragraphIndex, lines] of splitPlainTextIntoParagraphs(
    text,
  ).entries()) {
    if (paragraphIndex > 0) {
      selection.insertParagraph();
    }

    for (const [lineIndex, line] of lines.entries()) {
      if (lineIndex > 0) {
        selection.insertLineBreak();
      }

      if (line.length > 0) {
        selection.insertText(line);
      }
    }
  }
}

export function shouldPreferPlainTextLinebreakPaste(
  text: string,
  html: string,
): boolean {
  if (!html) {
    return false;
  }

  const normalizedText = text.replaceAll(/\r\n?/g, "\n");
  if (!normalizedText.includes("\n")) {
    return false;
  }

  const document = new DOMParser().parseFromString(html, "text/html");

  return !document.body.querySelector(HTML_LINEBREAK_STRUCTURE_SELECTOR);
}

export function PlainTextLinebreakPastePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        if (!event || !("clipboardData" in event)) return false;
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }

        const clipboardData = event.clipboardData;
        if (!clipboardData) {
          return false;
        }

        const html = clipboardData.getData("text/html");
        const text = clipboardData.getData("text/plain");
        if (!text || text.trim().length === 0) {
          return false;
        }

        if (html && !shouldPreferPlainTextLinebreakPaste(text, html)) {
          return false;
        }

        // Markdown is the markdown plugin's to handle. This asks the same
        // question it does rather than keeping a copy of the check: the copy
        // had drifted, and missed tables entirely, so a pasted table was
        // claimed here as plain text before the markdown plugin saw it.
        if (hasMarkdownPasteSyntax(normalizeMarkdownPasteForLists(text))) {
          return false;
        }

        if (splitPlainTextIntoParagraphs(text).length === 0) {
          return false;
        }

        event.preventDefault();

        editor.update(() => {
          const currentSelection = $getSelection();
          if ($isRangeSelection(currentSelection)) {
            $insertPlainText(currentSelection, text);
          }
        });

        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);

  return null;
}
