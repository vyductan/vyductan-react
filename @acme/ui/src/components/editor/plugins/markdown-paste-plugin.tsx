"use client";

import { useEffect } from "react";
import { $generateNodesFromMarkdownString } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  $removeFromParent,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  PASTE_COMMAND,
} from "lexical";

import { MARKDOWN_DOCUMENT_TRANSFORMERS } from "../transformers/markdown-transformers";

const MARKDOWN_PASTE_SYNTAX_REGEXP =
  /^#{1,6}\s|^\s*\*\s|^\s*-\s|^\s*\d+\.\s|^>\s|^`|^\[.*\]\(|^!\[.*\]\(/m;

/**
 * A table's delimiter row: nothing but pipes, dashes, colons and spaces, with
 * at least one pipe and one dash — `| --- | :---: |`, or `--- | ---` without the
 * outer pipes. A table has none of the line starts the pattern above looks
 * for, so without this a paste holding only a table was taken for plain text.
 * Requiring both characters, and nothing else on the line, keeps a sentence
 * with a pipe in it and a bare `---` rule out.
 */
const MARKDOWN_TABLE_DELIMITER_REGEXP = /^(?=[^\n]*\|)(?=[^\n]*-)[\t |:-]+$/m;

export function hasMarkdownPasteSyntax(text: string): boolean {
  return (
    MARKDOWN_PASTE_SYNTAX_REGEXP.test(text) ||
    MARKDOWN_TABLE_DELIMITER_REGEXP.test(text)
  );
}

export function normalizeMarkdownPasteForLists(text: string): string {
  return text
    .replaceAll(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => {
      const flattenedNestedBulletMatch = line.match(
        /^([*-])\s{2,}([*-])\s+(.*)$/,
      );
      if (!flattenedNestedBulletMatch) {
        return line;
      }

      const nestedMarker = flattenedNestedBulletMatch[2];
      const content = flattenedNestedBulletMatch[3];

      if (!nestedMarker || content === undefined) {
        return line;
      }

      return `    ${nestedMarker} ${content}`;
    })
    .join("\n");
}

const LIST_LINE = /^\s*(?:\d+[.)]|[-*+]|[a-z][.)]|[ivx]+[.)])\s/i;
const LETTERED_ITEM = /^(\s+)(?:[a-z]|[ivx]+)[.)]\s+(.*)$/i;

/**
 * Renumbers indented lettered items — "a.", "b.", or "i.", "ii." a level
 * deeper — as numbered markdown items.
 *
 * Nested numbered lists are shown with letters, here, in Notion and in most
 * documents, so that is how they arrive when copied as text. Markdown only
 * knows digits, so an indented "a." was read as more text in the item above
 * and the nested list folded into one long item. The digits only have to
 * count: the list shows its own letters again once it is a list.
 *
 * Only an indented marker directly under a list line qualifies, so a line
 * that merely starts with a letter and a full stop is left as it is.
 */
export function normalizeLetteredListItems(text: string): string {
  const counters = new Map<number, number>();
  let previousWasList = false;

  return text
    .split("\n")
    .map((line) => {
      if (line.trim() === "") return line;

      const indent = line.length - line.trimStart().length;
      for (const depth of counters.keys()) {
        if (depth > indent) counters.delete(depth);
      }

      const lettered = LETTERED_ITEM.exec(line);
      if (lettered && previousWasList) {
        const count = (counters.get(indent) ?? 0) + 1;
        counters.set(indent, count);
        return `${lettered[1]}${count}. ${lettered[2]}`;
      }

      if (!LETTERED_ITEM.test(line)) counters.delete(indent);
      previousWasList = LIST_LINE.test(line);
      return line;
    })
    .join("\n");
}

/**
 * Drops lines that are nothing but a blockquote marker.
 *
 * Markdown from a chat often closes a quote with a bare ">", meaning an empty
 * line inside it. Lexical's quote transformer matches "> " with the space, so
 * the lone marker fell through as ordinary text and the quote ended with a
 * stray ">" on its own line. A Lexical quote is one block, so an empty
 * continuation has nothing to carry anyway.
 *
 * Inside a fenced block a ">" is just a character, so fences are left alone.
 */
export function dropEmptyBlockquoteLines(text: string): string {
  let insideFence = false;

  return text
    .split("\n")
    .filter((line) => {
      if (/^\s*```/.test(line)) {
        insideFence = !insideFence;
        return true;
      }

      return insideFence || !/^\s*>\s*$/.test(line);
    })
    .join("\n");
}

/**
 * Plugin that converts pasted markdown text to Lexical format
 * When markdown syntax like "# Heading" is pasted, it converts to proper heading nodes
 */
export function MarkdownPastePlugin(): null {
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

        // Get plain text from clipboard
        const text = clipboardData.getData("text/plain");
        if (!text || text.trim().length === 0) {
          return false;
        }

        const normalizedText = dropEmptyBlockquoteLines(
          normalizeLetteredListItems(normalizeMarkdownPasteForLists(text)),
        );

        if (!hasMarkdownPasteSyntax(normalizedText)) {
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

          // Where the caret is, which is where this paste belongs. Importing
          // markdown moves it: it used to run into a scratch paragraph
          // appended to the root, and `$convertFromMarkdownString` ends with
          // `selectStart()` on the node it is handed — so the caret followed
          // that node to the bottom of the document and the paste landed
          // there. Generating the nodes instead leaves the document alone but
          // still parks the caret in the importer's own container, which has
          // no parent; inserting from there throws. So hold on to the caret
          // and put it back.
          const target = currentSelection.clone();
          const children = $generateNodesFromMarkdownString(
            normalizedText,
            MARKDOWN_DOCUMENT_TRANSFORMERS,
          );

          // The importer builds nested lists the way Lexical keeps them: in a
          // list item of their own, after the item they belong under. They
          // used to be folded into that item here, which Lexical then took
          // for a wrapper — and hid its marker, so "1." vanished.

          if (children.length > 0) {
            // Two things have to hold before inserting, and each has been seen
            // to fail on its own: the nodes belong to no one, and the caret is
            // the person's. The importer's container is not in the document and
            // has no parent, so anything that walks up from a node still inside
            // it, or from a caret still inside it, throws
            // "Expected node N to have a parent" and leaves the paste half
            // applied.
            for (const child of children) {
              $removeFromParent(child);
            }

            $setSelection(target);
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
