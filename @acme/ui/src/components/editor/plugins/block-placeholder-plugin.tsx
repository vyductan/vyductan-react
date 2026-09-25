"use client";

import type { LexicalNode } from "lexical";
import { useEffect } from "react";
import { $isListItemNode, $isListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isHeadingNode, $isQuoteNode } from "@lexical/rich-text";
import { mergeRegister } from "@lexical/utils";
import {
  $getRoot,
  $getSelection,
  $isElementNode,
  $isParagraphNode,
  $isRangeSelection,
  $isRootNode,
} from "lexical";

import { $isUnmarkedItem } from "../utils/list-marker";

/** Read by the editable's `[data-placeholder]::before` rule. */
export const BLOCK_PLACEHOLDER_ATTRIBUTE = "data-placeholder";

/**
 * The prompt an empty block shows, by kind, as Notion labels them. An unmarked
 * list line is a continuation of the item above — it reads as a paragraph.
 */
function $placeholderFor(node: LexicalNode, paragraph: string): string | null {
  if ($isListItemNode(node)) {
    if ($isUnmarkedItem(node)) return paragraph;
    // A checklist item draws its checkbox with ::before, the pseudo-element
    // the prompt would take; it stays blank rather than lose the box.
    const list = node.getParent();
    return $isListNode(list) && list.getListType() === "check" ? null : "List";
  }
  if ($isHeadingNode(node)) return `Heading ${node.getTag().slice(1)}`;
  if ($isQuoteNode(node)) return "Empty quote";
  if ($isParagraphNode(node)) return paragraph;
  return null;
}

/** The whole document is one empty paragraph: the editor-wide prompt covers it. */
function $isEmptyDocument(): boolean {
  const children = $getRoot().getChildren();
  const [first] = children;
  return (
    children.length === 0 ||
    (children.length === 1 && $isParagraphNode(first) && first.isEmpty())
  );
}

/**
 * Notion-style prompt on the empty line the caret is in: "List" in a list
 * item, "Heading 1" in a heading, the editor's placeholder in a paragraph.
 *
 * Only the focused line, and only top-level blocks and list items — an empty
 * paragraph inside a table cell or column stays blank. The prompt is an
 * attribute on the block's own element, drawn by CSS as a zero-height float,
 * so the caret stays at the line's start and the prompt follows the block's
 * font, size and indent (a heading's prompt is heading-sized).
 */
export function BlockPlaceholderPlugin({
  placeholder,
}: {
  placeholder: string;
}): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    let current: HTMLElement | null = null;

    const show = (element: HTMLElement | null, text: string | null) => {
      if (current && current !== element) {
        current.removeAttribute(BLOCK_PLACEHOLDER_ATTRIBUTE);
      }
      current = element;
      if (element && text) {
        element.setAttribute(BLOCK_PLACEHOLDER_ATTRIBUTE, text);
      } else if (element) {
        element.removeAttribute(BLOCK_PLACEHOLDER_ATTRIBUTE);
      }
    };

    const refresh = () => {
      const root = editor.getRootElement();
      const focused =
        root !== null &&
        editor.isEditable() &&
        root.contains(document.activeElement);
      if (!focused) return show(null, null);

      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if (
          !$isRangeSelection(selection) ||
          !selection.isCollapsed() ||
          $isEmptyDocument()
        ) {
          return show(null, null);
        }
        // An empty block has no children, so the caret sits on the block
        // itself rather than on a text node inside it.
        const node = selection.anchor.getNode();
        const block =
          $isElementNode(node) &&
          node.isEmpty() &&
          ($isListItemNode(node) || $isRootNode(node.getParent()))
            ? node
            : null;
        const text = block ? $placeholderFor(block, placeholder) : null;
        show(
          text && block ? editor.getElementByKey(block.getKey()) : null,
          text,
        );
      });
    };

    // focusout fires before focus has moved on; wait for activeElement.
    const onFocusOut = () => queueMicrotask(refresh);

    return mergeRegister(
      editor.registerUpdateListener(refresh),
      editor.registerEditableListener(refresh),
      editor.registerRootListener((root, previousRoot) => {
        previousRoot?.removeEventListener("focusin", refresh);
        previousRoot?.removeEventListener("focusout", onFocusOut);
        root?.addEventListener("focusin", refresh);
        root?.addEventListener("focusout", onFocusOut);
      }),
      () => {
        const root = editor.getRootElement();
        root?.removeEventListener("focusin", refresh);
        root?.removeEventListener("focusout", onFocusOut);
        show(null, null);
      },
    );
  }, [editor, placeholder]);

  return null;
}
