"use client";

import type { ListNode } from "@lexical/list";
import type { LexicalNode } from "lexical";
import { useEffect } from "react";
import { $isListItemNode, $isListNode } from "@lexical/list";
import {
  $generateNodesFromMarkdownString,
  MULTILINE_ELEMENT_TRANSFORMERS,
} from "@lexical/markdown";
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

import { MARKDOWN_TRANSFORMERS } from "../transformers/markdown-transformers";

/**
 * The shared list leaves the multiline transformers out on purpose: they drive
 * the typing shortcuts too, and a ``` typed mid-sentence turning into a code
 * block was not wanted. A paste is not typing — the fence is already whole, and
 * the text it wraps is the reason someone is pasting it — so it is honoured
 * here without changing what typing does.
 */
const PASTE_TRANSFORMERS = [
  ...MARKDOWN_TRANSFORMERS,
  ...MULTILINE_ELEMENT_TRANSFORMERS,
];

const MARKDOWN_PASTE_SYNTAX_REGEXP =
  /^#{1,6}\s|^\s*\*\s|^\s*-\s|^\s*\d+\.\s|^>\s|^`|^\[.*\]\(|^!\[.*\]\(/m;

export function hasMarkdownPasteSyntax(text: string): boolean {
  return MARKDOWN_PASTE_SYNTAX_REGEXP.test(text);
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

function collapseMarkdownListWrappers(nodes: LexicalNode[]) {
  for (const node of nodes) {
    collapseMarkdownListWrappersInNode(node);
  }
}

function collapseMarkdownListWrappersInNode(node: LexicalNode) {
  if ($isListNode(node)) {
    collapseMarkdownListWrappersInList(node);
    return;
  }

  if ($isListItemNode(node)) {
    for (const child of node.getChildren()) {
      collapseMarkdownListWrappersInNode(child);
    }
  }
}

function collapseMarkdownListWrappersInList(listNode: ListNode) {
  let current = listNode.getFirstChild();

  while (current !== null) {
    const next = current.getNextSibling();

    if ($isListItemNode(current)) {
      const previous = current.getPreviousSibling();
      const onlyChild =
        current.getChildrenSize() === 1 ? current.getFirstChild() : null;

      if ($isListItemNode(previous) && $isListNode(onlyChild)) {
        const previousLastChild = previous.getLastChild();

        if (
          $isListNode(previousLastChild) &&
          previousLastChild.getListType() === onlyChild.getListType()
        ) {
          previousLastChild.append(...onlyChild.getChildren());
          current.remove();
          collapseMarkdownListWrappersInList(previousLastChild);
          current = next;
          continue;
        }

        previous.append(onlyChild);
        current.remove();
        collapseMarkdownListWrappersInList(onlyChild);
        current = next;
        continue;
      }
    }

    collapseMarkdownListWrappersInNode(current);
    current = next;
  }
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
          normalizeMarkdownPasteForLists(text),
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
            PASTE_TRANSFORMERS,
          );

          collapseMarkdownListWrappers(children);

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
