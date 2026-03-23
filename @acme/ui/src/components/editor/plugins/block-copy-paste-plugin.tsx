/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type { ElementNode, LexicalNode } from "lexical";
import { useEffect } from "react";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $isListItemNode, $isListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  COPY_COMMAND,
  CUT_COMMAND,
  PASTE_COMMAND,
} from "lexical";

const BLOCK_COPY_ATTRIBUTE = "data-lexical-block-copy";

export function BlockCopyPastePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      COPY_COMMAND,
      (event: ClipboardEvent) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false;
        }

        const anchor = selection.anchor;
        let currentNode: LexicalNode | null = anchor.getNode();

        // If anchor is element, looking at a specific child might be more accurate
        if (anchor.type === "element" && $isElementNode(currentNode)) {
          const elementNode = currentNode;
          const child = elementNode.getChildAtIndex(anchor.offset);
          if (child) {
            currentNode = child;
          }
        }

        let targetBlock: LexicalNode | null = null;

        while (currentNode) {
          if ($isListItemNode(currentNode)) {
            targetBlock = currentNode;
            break;
          }
          const parent: LexicalNode | null = currentNode.getParent();
          if (parent?.getParent() === null) {
            targetBlock ??= currentNode;
            break;
          }
          currentNode = parent;
        }

        targetBlock ??= anchor.getNode().getTopLevelElementOrThrow();

        event.preventDefault();
        editor.update(() => {
          // Select the block to generate HTML for it
          if ($isElementNode(targetBlock) || $isTextNode(targetBlock)) {
            // We know it is ElementNode or TextNode which have select()
            (targetBlock as ElementNode).select();
          }

          const selectionToSerialize = $getSelection();
          let html = $generateHtmlFromNodes(editor, selectionToSerialize);

          if ($isListItemNode(targetBlock)) {
            const parent = targetBlock.getParent();
            if ($isListNode(parent)) {
              const tag = parent.getTag();
              html = `<${tag}>${html}</${tag}>`;
            }
          }

          if (event.clipboardData) {
            const wrappedHtml = `<div ${BLOCK_COPY_ATTRIBUTE}="true">${html}</div>`;
            event.clipboardData.setData("text/html", wrappedHtml);
            event.clipboardData.setData(
              "text/plain",
              targetBlock.getTextContent(),
            );
          }

          // Restore cursor position if possible
          if ($isRangeSelection(selection)) {
            const originalAnchor = selection.anchor;
            const originalFocus = selection.focus;

            selection.anchor.set(
              originalAnchor.key,
              originalAnchor.offset,
              originalAnchor.type,
            );
            selection.focus.set(
              originalFocus.key,
              originalFocus.offset,
              originalFocus.type,
            );
          }
        });
        return true;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      CUT_COMMAND,
      (event: ClipboardEvent) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false;
        }

        const anchor = selection.anchor;
        let currentNode: LexicalNode | null = anchor.getNode();

        if (anchor.type === "element" && $isElementNode(currentNode)) {
          const elementNode = currentNode;
          const child = elementNode.getChildAtIndex(anchor.offset);
          if (child) {
            currentNode = child;
          }
        }

        let targetBlock: LexicalNode | null = null;

        while (currentNode) {
          if ($isListItemNode(currentNode)) {
            targetBlock = currentNode;
            break;
          }
          const parent: LexicalNode | null = currentNode.getParent();
          if (parent?.getParent() === null) {
            targetBlock ??= currentNode;
            break;
          }
          currentNode = parent;
        }

        targetBlock ??= anchor.getNode().getTopLevelElementOrThrow();

        event.preventDefault();
        editor.update(() => {
          if ($isElementNode(targetBlock) || $isTextNode(targetBlock)) {
            (targetBlock as ElementNode).select();
          }

          const selectionToSerialize = $getSelection();
          let html = $generateHtmlFromNodes(editor, selectionToSerialize);

          if ($isListItemNode(targetBlock)) {
            const parent = targetBlock.getParent();
            if ($isListNode(parent)) {
              const tag = parent.getTag();
              html = `<${tag}>${html}</${tag}>`;
            }
          }

          if (event.clipboardData) {
            const wrappedHtml = `<div ${BLOCK_COPY_ATTRIBUTE}="true">${html}</div>`;
            event.clipboardData.setData("text/html", wrappedHtml);
            event.clipboardData.setData(
              "text/plain",
              targetBlock.getTextContent(),
            );
          }

          // Remove the block after copying
          targetBlock.remove();
        });
        return true;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        const html = clipboardData.getData("text/html");

        // Check if this is our special block copy by partial match or parsing
        // We look for our attribute
        if (!html.includes(BLOCK_COPY_ATTRIBUTE)) {
          return false;
        }

        event.preventDefault();

        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;

          const anchor = selection.anchor;
          let currentNode: LexicalNode | null = anchor.getNode();

          // If anchor is element, looking at a specific child might be more accurate
          if (anchor.type === "element" && $isElementNode(currentNode)) {
            const elementNode = currentNode;
            const child = elementNode.getChildAtIndex(anchor.offset);
            if (child) {
              currentNode = child;
            }
          }

          let targetBlock: LexicalNode | null = null;

          while (currentNode) {
            if ($isListItemNode(currentNode)) {
              targetBlock = currentNode;
              break;
            }
            const parent: LexicalNode | null = currentNode.getParent();
            if (parent?.getParent() === null) {
              targetBlock ??= currentNode;
              break;
            }
            currentNode = parent;
          }

          targetBlock ??= anchor.getNode().getTopLevelElementOrThrow();

          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const nodes = $generateNodesFromDOM(editor, doc);

          // Insert after current block
          let lastNode: LexicalNode = targetBlock;
          for (const node of nodes) {
            lastNode.insertAfter(node);
            lastNode = node;
          }

          // Select the last pasted node
          if (nodes.length > 0) {
            const lastPastedNode = nodes.at(-1);
            if (
              lastPastedNode &&
              ($isElementNode(lastPastedNode) || $isTextNode(lastPastedNode))
            ) {
              // We know it is ElementNode or TextNode which have select()
              (lastPastedNode as ElementNode).select();
            }
          }
        });

        return true;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);

  return null;
}
