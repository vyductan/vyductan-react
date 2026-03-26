/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type { ElementNode, LexicalNode } from "lexical";
import { useEffect } from "react";
import {
  $getClipboardDataFromSelection,
  setLexicalClipboardDataTransfer,
} from "@lexical/clipboard";
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
const MULTI_PARAGRAPH_TOP_LEVEL_SELECTOR =
  "p, div, li, ul, ol, blockquote, pre, h1, h2, h3, h4, h5, h6, table, thead, tbody, tfoot, tr, td, th";
const SOFT_LINEBREAK_BLOCK_SELECTOR =
  "div, li, ul, ol, blockquote, pre, h1, h2, h3, h4, h5, h6, table, thead, tbody, tfoot, tr, td, th";

export function getSingleParagraphSoftLineBreakCopyHtml(
  text: string,
  html: string,
): string {
  const normalizedText = text.replace(/\r\n?/g, "\n");
  if (
    !html ||
    !normalizedText.includes("\n") ||
    normalizedText.includes("\n\n")
  ) {
    return html;
  }

  const document = new DOMParser().parseFromString(html, "text/html");
  const root = document.body.firstElementChild;

  if (document.body.children.length === 1 && root?.tagName === "P") {
    if (
      !root.querySelector("br") ||
      root.querySelector(SOFT_LINEBREAK_BLOCK_SELECTOR)
    ) {
      return html;
    }
  } else if (document.body.children.length === 0) {
    if (
      !document.body.querySelector("br") ||
      document.body.querySelector(SOFT_LINEBREAK_BLOCK_SELECTOR)
    ) {
      return html;
    }
  } else {
    const topLevelChildren = Array.from(document.body.children);
    if (
      !document.body.querySelector("br") ||
      document.body.querySelector(SOFT_LINEBREAK_BLOCK_SELECTOR) ||
      topLevelChildren.some((element) =>
        element.matches(MULTI_PARAGRAPH_TOP_LEVEL_SELECTOR),
      )
    ) {
      return html;
    }
  }

  const container = document.createElement("div");
  container.style.whiteSpace = "break-spaces";
  container.style.wordBreak = "break-word";
  container.textContent = normalizedText;

  return container.outerHTML;
}

function getClipboardNodePlainText(node: ChildNode): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent?.replace(/\r\n?/g, "\n") ?? "";
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const element = node as HTMLElement;
  if (element.tagName === "BR") {
    return "\n";
  }

  return Array.from(element.childNodes).map(getClipboardNodePlainText).join("");
}

export function getMultiParagraphCopyPlainText(text: string, html: string): string {
  if (!html) {
    return text;
  }

  const normalizedText = text.replace(/\r\n?/g, "\n");
  if (!normalizedText.includes("\n") || normalizedText.includes("\n\n")) {
    return normalizedText;
  }

  const document = new DOMParser().parseFromString(html, "text/html");
  const topLevelBlocks = Array.from(document.body.children).filter((element) =>
    element.matches(MULTI_PARAGRAPH_TOP_LEVEL_SELECTOR),
  );

  if (topLevelBlocks.length < 2 || topLevelBlocks.length !== document.body.children.length) {
    return normalizedText;
  }

  return topLevelBlocks
    .map((element) => Array.from(element.childNodes).map(getClipboardNodePlainText).join(""))
    .join("\n\n");
}

export function BlockCopyPastePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      COPY_COMMAND,
      (event: ClipboardEvent) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }

        if (!event.clipboardData) {
          return false;
        }

        if (!selection.isCollapsed()) {
          event.preventDefault();

          editor.update(() => {
            const currentSelection = $getSelection();
            if (!$isRangeSelection(currentSelection)) {
              return;
            }

            const clipboardData = $getClipboardDataFromSelection(currentSelection);
            clipboardData["text/html"] = getSingleParagraphSoftLineBreakCopyHtml(
              clipboardData["text/plain"],
              clipboardData["text/html"] ?? "",
            );
            clipboardData["text/plain"] = getMultiParagraphCopyPlainText(
              clipboardData["text/plain"],
              clipboardData["text/html"] ?? "",
            );
            setLexicalClipboardDataTransfer(event.clipboardData, clipboardData);
          });

          return true;
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
          let text = targetBlock.getTextContent();
          let html = $generateHtmlFromNodes(editor, selectionToSerialize);

          if ($isListItemNode(targetBlock)) {
            const parent = targetBlock.getParent();
            if ($isListNode(parent)) {
              const tag = parent.getTag();
              html = `<${tag}>${html}</${tag}>`;
            }
          }

          html = getSingleParagraphSoftLineBreakCopyHtml(text, html);
          text = getMultiParagraphCopyPlainText(text, html);

          if (event.clipboardData) {
            const wrappedHtml = `<div ${BLOCK_COPY_ATTRIBUTE}="true">${html}</div>`;
            event.clipboardData.setData("text/html", wrappedHtml);
            event.clipboardData.setData("text/plain", text);
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
        if (!$isRangeSelection(selection)) {
          return false;
        }

        if (!event.clipboardData) {
          return false;
        }

        if (!selection.isCollapsed()) {
          event.preventDefault();

          editor.update(() => {
            const currentSelection = $getSelection();
            if (!$isRangeSelection(currentSelection)) {
              return;
            }

            const clipboardData = $getClipboardDataFromSelection(currentSelection);
            clipboardData["text/html"] = getSingleParagraphSoftLineBreakCopyHtml(
              clipboardData["text/plain"],
              clipboardData["text/html"] ?? "",
            );
            clipboardData["text/plain"] = getMultiParagraphCopyPlainText(
              clipboardData["text/plain"],
              clipboardData["text/html"] ?? "",
            );
            setLexicalClipboardDataTransfer(event.clipboardData, clipboardData);
            currentSelection.removeText();
          });

          return true;
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
          let text = targetBlock.getTextContent();
          let html = $generateHtmlFromNodes(editor, selectionToSerialize);

          if ($isListItemNode(targetBlock)) {
            const parent = targetBlock.getParent();
            if ($isListNode(parent)) {
              const tag = parent.getTag();
              html = `<${tag}>${html}</${tag}>`;
            }
          }

          html = getSingleParagraphSoftLineBreakCopyHtml(text, html);
          text = getMultiParagraphCopyPlainText(text, html);

          if (event.clipboardData) {
            const wrappedHtml = `<div ${BLOCK_COPY_ATTRIBUTE}="true">${html}</div>`;
            event.clipboardData.setData("text/html", wrappedHtml);
            event.clipboardData.setData("text/plain", text);
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
