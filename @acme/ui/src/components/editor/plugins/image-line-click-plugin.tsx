"use client";

import type { ElementNode } from "lexical";
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getNearestNodeFromDOMNode,
  $isDecoratorNode,
  $isElementNode,
  $isTextNode,
} from "lexical";

import { $isImageNode } from "../nodes/image-node";

/** A line that holds images and nothing else a caret could sit beside. */
function $isImageOnlyLine(block: ElementNode): boolean {
  const children = block.getChildren();
  return (
    children.some($isImageNode) &&
    children.every(
      (child) =>
        $isDecoratorNode(child) ||
        ($isTextNode(child) && child.getTextContent().trim() === ""),
    )
  );
}

/**
 * Notion-style click beside an image: the caret goes to the start of the line
 * below, never next to the image.
 *
 * An image sits inline in a paragraph, so clicking the empty space right of it
 * put the caret after the image, sized to an empty text line at the image's
 * baseline — a tiny caret floating at its bottom corner. Now a click to the
 * right of an image-only line moves the caret to the start of the next block,
 * whatever that block holds, and adds an empty paragraph when the image is the
 * last thing in the document.
 *
 * Handled on mousedown, with the default prevented: on `click` the browser had
 * already put its caret beside the image, and it was painted there for a frame
 * before the move.
 */
export function ImageLineClickPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0 || !editor.isEditable()) return;
      const target = event.target;
      if (!(target instanceof Element) || target.closest("img")) return;

      const { clientX } = event;
      editor.update(() => {
        const node = $getNearestNodeFromDOMNode(target);
        if (!node) return;
        const block =
          $isElementNode(node) && !node.isInline()
            ? node
            : node.getTopLevelElement();
        if (!block || !$isElementNode(block) || !$isImageOnlyLine(block)) {
          return;
        }

        // Only to the right of the images, not on or left of them.
        const rightEdge = Math.max(
          ...block
            .getChildren()
            .filter($isImageNode)
            .map(
              (image) =>
                editor.getElementByKey(image.getKey())?.getBoundingClientRect()
                  .right ?? Number.NEGATIVE_INFINITY,
            ),
        );
        if (clientX <= rightEdge) return;

        event.preventDefault();
        const next = block.getNextSibling();
        if ($isElementNode(next)) {
          next.selectStart();
        } else {
          const paragraph = $createParagraphNode();
          block.insertAfter(paragraph);
          paragraph.select();
        }
      });
      // preventDefault also stops the browser focusing the editor.
      if (event.defaultPrevented) {
        editor.getRootElement()?.focus({ preventScroll: true });
      }
    };

    return editor.registerRootListener((root, previous) => {
      previous?.removeEventListener("mousedown", onMouseDown);
      root?.addEventListener("mousedown", onMouseDown);
    });
  }, [editor]);

  return null;
}
