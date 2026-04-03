import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  PASTE_COMMAND,
} from "lexical";

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
      (event: ClipboardEvent) => {
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

        const hasMarkdownSyntax =
          /^#{1,6}\s|^\*\s|^-\s|^\d+\.\s|^>\s|^`|^\[.*\]\(|^!\[.*\]\(/m.test(
            text,
          );

        if (hasMarkdownSyntax) {
          return false;
        }

        const paragraphs = splitPlainTextIntoParagraphs(text);
        if (paragraphs.length === 0) {
          return false;
        }

        event.preventDefault();

        editor.update(() => {
          const currentSelection = $getSelection();
          if (!$isRangeSelection(currentSelection)) {
            return;
          }

          if (!currentSelection.isCollapsed()) {
            currentSelection.removeText();
          }

          for (const [paragraphIndex, lines] of paragraphs.entries()) {
            if (paragraphIndex > 0) {
              currentSelection.insertParagraph();
            }

            for (const [lineIndex, line] of lines.entries()) {
              if (lineIndex > 0) {
                currentSelection.insertLineBreak();
              }

              if (line.length > 0) {
                currentSelection.insertText(line);
              }
            }
          }
        });

        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);

  return null;
}
