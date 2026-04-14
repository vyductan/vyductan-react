/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
"use client";

import type { ListNode } from "@lexical/list";
import type { LexicalNode } from "lexical";
import { useEffect } from "react";
import { $isListItemNode, $isListNode } from "@lexical/list";
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

        const normalizedText = normalizeMarkdownPasteForLists(text);

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

          const temporaryParagraph = $createParagraphNode();
          const root = $getRoot();

          root.append(temporaryParagraph);

          $convertFromMarkdownString(
            normalizedText,
            MARKDOWN_TRANSFORMERS,
            temporaryParagraph,
          );

          const children = temporaryParagraph.getChildren();
          temporaryParagraph.remove();

          collapseMarkdownListWrappers(children);

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
