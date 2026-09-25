/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type {
  ElementNode,
  LexicalNode,
  PointType,
  RangeSelection,
} from "lexical";
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
  $isRootOrShadowRoot,
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
  const normalizedText = text.replaceAll(/\r\n?/g, "\n");
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
    const topLevelChildren = [...document.body.children];
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
    return node.textContent?.replaceAll(/\r\n?/g, "\n") ?? "";
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const element = node as HTMLElement;
  if (element.tagName === "BR") {
    return "\n";
  }

  return [...element.childNodes]
    .map((childNode) => getClipboardNodePlainText(childNode))
    .join("");
}

export function getMultiParagraphCopyPlainText(
  text: string,
  html: string,
): string {
  if (!html) {
    return text;
  }

  const normalizedText = text.replaceAll(/\r\n?/g, "\n");
  if (!normalizedText.includes("\n") || normalizedText.includes("\n\n")) {
    return normalizedText;
  }

  const document = new DOMParser().parseFromString(html, "text/html");
  const topLevelBlocks = [...document.body.children].filter((element) =>
    element.matches(MULTI_PARAGRAPH_TOP_LEVEL_SELECTOR),
  );

  if (
    topLevelBlocks.length < 2 ||
    topLevelBlocks.length !== document.body.children.length
  ) {
    return normalizedText;
  }

  return topLevelBlocks
    .map((element) =>
      [...element.childNodes]
        .map((childNode) => getClipboardNodePlainText(childNode))
        .join(""),
    )
    .join("\n\n");
}

/**
 * The block a point sits in: the innermost list item, or else the top-level
 * block. A nested item is its own block — "a." inside "1." — because that is
 * the line the person is looking at.
 */
function $blockOf(point: PointType): LexicalNode | null {
  let node: LexicalNode | null = point.getNode();
  // A point on the root itself — a select-all — is in no block. Taking the
  // root for one made two such points "the same block", and a whole list was
  // copied without its list: pasted, the items came back as bullets.
  if ($isRootOrShadowRoot(node)) return null;
  while (node) {
    if ($isListItemNode(node)) return node;
    const parent: LexicalNode | null = node.getParent();
    if (parent === null || $isRootOrShadowRoot(parent)) return node;
    node = parent;
  }
  return null;
}

/** Whether a point is at the very start of its block, before any of its text. */
function $isAtBlockStart(point: PointType, block: LexicalNode): boolean {
  if (point.offset !== 0) return false;
  const node = point.getNode();
  if (node.is(block)) return true;
  const first = $isElementNode(block) ? block.getFirstDescendant() : null;
  return first !== null && (node.is(first) || node.isParentOf(first));
}

/**
 * The selection as the person meant it, and whether it lies inside one block.
 *
 * Highlighting a whole line — a triple-click, or a drag to its end — carries
 * the selection to offset 0 of the next line. Nothing of that line is
 * selected, but Lexical copies it as a second, empty block, so pasting brings
 * the first block's list or heading along. Such an end is pulled back to the
 * end of the line before it.
 */
function $selectionForCopy(selection: RangeSelection): {
  selection: RangeSelection;
  withinOneBlock: boolean;
} {
  const copy = selection.clone();
  const backward = copy.isBackward();
  const start = backward ? copy.focus : copy.anchor;
  const end = backward ? copy.anchor : copy.focus;

  const startBlock = $blockOf(start);
  let endBlock = $blockOf(end);

  if (
    startBlock &&
    endBlock &&
    !startBlock.is(endBlock) &&
    $isAtBlockStart(end, endBlock)
  ) {
    const previous =
      endBlock.getPreviousSibling() ??
      endBlock.getParent()?.getPreviousSibling() ??
      null;
    const last =
      startBlock.is(previous) || !previous
        ? $isElementNode(startBlock)
          ? startBlock.getLastDescendant()
          : startBlock
        : $isElementNode(previous)
          ? previous.getLastDescendant()
          : previous;
    if ($isTextNode(last)) {
      end.set(last.getKey(), last.getTextContentSize(), "text");
      endBlock = $blockOf(end);
    }
  }

  return {
    selection: copy,
    withinOneBlock:
      startBlock !== null && endBlock !== null && startBlock.is(endBlock),
  };
}

/** Inline node types — what is left once the blocks around a copy are gone. */
const INLINE_TYPES = new Set([
  "text",
  "linebreak",
  "tab",
  "link",
  "autolink",
  "code-highlight",
  "hashtag",
  "mention",
  "emoji",
  "keyword",
  "image",
  "equation",
]);

/**
 * Lexical's clipboard JSON with the blocks around it taken away, leaving the
 * inline content: what a copy from inside one block should carry. Pasted, it
 * joins the line it lands on instead of replacing that line's block.
 */
export function unwrapToInlineClipboardJson(json: string): string {
  let parsed: { nodes?: unknown[] } & Record<string, unknown>;
  try {
    parsed = JSON.parse(json) as typeof parsed;
  } catch {
    return json;
  }

  let nodes = parsed.nodes ?? [];
  for (;;) {
    const [only] = nodes as Array<{ type?: string; children?: unknown[] }>;
    if (
      nodes.length !== 1 ||
      !only ||
      INLINE_TYPES.has(only.type ?? "") ||
      !Array.isArray(only.children)
    ) {
      break;
    }
    nodes = only.children;
  }

  return JSON.stringify({ ...parsed, nodes });
}

const BLOCK_TAGS = new Set([
  "OL",
  "UL",
  "LI",
  "P",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "BLOCKQUOTE",
  "PRE",
  "DIV",
]);

/** The same for the HTML copy: the markup inside the block wrappers. */
export function unwrapToInlineHtml(html: string): string {
  if (!html) return html;
  const document = new DOMParser().parseFromString(html, "text/html");
  let container: Element = document.body;
  while (
    container.children.length === 1 &&
    container.childNodes.length === 1 &&
    BLOCK_TAGS.has(container.children[0]!.tagName)
  ) {
    container = container.children[0]!;
  }
  return container === document.body ? html : container.innerHTML;
}

export function BlockCopyPastePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      COPY_COMMAND,
      (event) => {
        // Lexical widened this payload to keyboard/input events and null; this
        // handler only knows how to fill a real clipboard.
        if (!event || !("clipboardData" in event)) return false;
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }

        const clipboardDataTransfer = event.clipboardData;
        if (!clipboardDataTransfer) {
          return false;
        }

        if (!selection.isCollapsed()) {
          event.preventDefault();

          editor.update(() => {
            const currentSelection = $getSelection();
            if (!$isRangeSelection(currentSelection)) {
              return;
            }

            const { selection: meant, withinOneBlock } =
              $selectionForCopy(currentSelection);
            const clipboardData = $getClipboardDataFromSelection(meant);

            // Words copied from inside one block carry no block of their
            // own, as in Notion: pasted, they join the line they land on.
            if (withinOneBlock) {
              const lexical = clipboardData["application/x-lexical-editor"];
              if (lexical) {
                clipboardData["application/x-lexical-editor"] =
                  unwrapToInlineClipboardJson(lexical);
              }
              clipboardData["text/html"] = unwrapToInlineHtml(
                clipboardData["text/html"] ?? "",
              );
            }
            clipboardData["text/html"] =
              getSingleParagraphSoftLineBreakCopyHtml(
                clipboardData["text/plain"],
                clipboardData["text/html"] ?? "",
              );
            clipboardData["text/plain"] = getMultiParagraphCopyPlainText(
              clipboardData["text/plain"],
              clipboardData["text/html"] ?? "",
            );
            setLexicalClipboardDataTransfer(
              clipboardDataTransfer,
              clipboardData,
            );
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

        targetBlock ??= anchor.getNode().getTopLevelElement();

        // The caret on the root itself means an empty editor, so
        // there is no block to copy — leave the event alone.
        if (!targetBlock) return false;

        // Non-null for the closures below, which cannot narrow a `let`.
        const block = targetBlock;

        event.preventDefault();
        editor.update(() => {
          // Select the block to generate HTML for it
          if ($isElementNode(block) || $isTextNode(block)) {
            // We know it is ElementNode or TextNode which have select()
            (block as ElementNode).select();
          }

          const selectionToSerialize = $getSelection();
          let text = block.getTextContent();
          let html = $generateHtmlFromNodes(editor, selectionToSerialize);

          if ($isListItemNode(block)) {
            const parent = block.getParent();
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
      (event) => {
        if (!event || !("clipboardData" in event)) return false;
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }

        const clipboardDataTransfer = event.clipboardData;
        if (!clipboardDataTransfer) {
          return false;
        }

        if (!selection.isCollapsed()) {
          event.preventDefault();

          editor.update(() => {
            const currentSelection = $getSelection();
            if (!$isRangeSelection(currentSelection)) {
              return;
            }

            const { selection: meant, withinOneBlock } =
              $selectionForCopy(currentSelection);
            const clipboardData = $getClipboardDataFromSelection(meant);

            // Words copied from inside one block carry no block of their
            // own, as in Notion: pasted, they join the line they land on.
            if (withinOneBlock) {
              const lexical = clipboardData["application/x-lexical-editor"];
              if (lexical) {
                clipboardData["application/x-lexical-editor"] =
                  unwrapToInlineClipboardJson(lexical);
              }
              clipboardData["text/html"] = unwrapToInlineHtml(
                clipboardData["text/html"] ?? "",
              );
            }
            clipboardData["text/html"] =
              getSingleParagraphSoftLineBreakCopyHtml(
                clipboardData["text/plain"],
                clipboardData["text/html"] ?? "",
              );
            clipboardData["text/plain"] = getMultiParagraphCopyPlainText(
              clipboardData["text/plain"],
              clipboardData["text/html"] ?? "",
            );
            setLexicalClipboardDataTransfer(
              clipboardDataTransfer,
              clipboardData,
            );
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

        targetBlock ??= anchor.getNode().getTopLevelElement();

        // The caret on the root itself means an empty editor, so
        // there is no block to cut — leave the event alone.
        if (!targetBlock) return false;

        // Non-null for the closures below, which cannot narrow a `let`.
        const block = targetBlock;

        event.preventDefault();
        editor.update(() => {
          if ($isElementNode(block) || $isTextNode(block)) {
            (block as ElementNode).select();
          }

          const selectionToSerialize = $getSelection();
          let text = block.getTextContent();
          let html = $generateHtmlFromNodes(editor, selectionToSerialize);

          if ($isListItemNode(block)) {
            const parent = block.getParent();
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
          block.remove();
        });
        return true;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        if (!event || !("clipboardData" in event)) return false;
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

          targetBlock ??= anchor.getNode().getTopLevelElement();

          // The caret on the root itself means an empty editor, so
          // there is no block to paste into — leave the event alone.
          if (!targetBlock) return false;

          // Non-null for the closures below, which cannot narrow a `let`.
          const block = targetBlock;

          const parser = new DOMParser();
          const document = parser.parseFromString(html, "text/html");
          const nodes = $generateNodesFromDOM(editor, document);

          // Insert after current block
          let lastNode: LexicalNode = block;
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
