"use client";

import type { LexicalNode, PointType } from "lexical";
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $createRangeSelection,
  $getNearestNodeFromDOMNode,
  $getSelection,
  $isDecoratorNode,
  $isElementNode,
  $isNodeSelection,
  $isRangeSelection,
  $isTextNode,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
} from "lexical";

/** The block a node sits in: itself if it is one (an image line, a rule). */
const $blockOf = (node: LexicalNode) =>
  $findMatchingParent(
    node,
    (candidate) =>
      ($isElementNode(candidate) || $isDecoratorNode(candidate)) &&
      !candidate.isInline(),
  );

/** Where a block starts or ends, as an element point. */
function $edgeOf(
  block: LexicalNode,
  edge: "start" | "end",
): { key: string; offset: number } | null {
  if ($isElementNode(block)) {
    return {
      key: block.getKey(),
      offset: edge === "start" ? 0 : block.getChildrenSize(),
    };
  }
  // A block-level decorator: the point before or after it in its parent.
  const parent = block.getParent();
  if (!parent) return null;
  const index = block.getIndexWithinParent();
  return { key: parent.getKey(), offset: edge === "start" ? index : index + 1 };
}

const setPoint = (
  point: PointType,
  to: { key: string; offset: number } | null,
) => {
  if (to) point.set(to.key, to.offset, "element");
};

/**
 * As in Notion: a click on a line, then a shift+click further on, selects
 * every line between — then Delete removes them at once. On text the browser
 * extends the selection itself; on an image, or the empty space beside one,
 * it cannot (no text to put the caret in), and the image took the click to
 * select itself alone. There the selection is extended here, over the whole
 * of the clicked block, and the click goes no further.
 */
export function ShiftClickSelectPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    let extended = false;

    const onMouseDown = (event: MouseEvent) => {
      extended = false;
      if (!event.shiftKey || event.button !== 0) return;
      const target = event.target;
      if (!(target instanceof Node)) return;

      editor.update(() => {
        const clicked = $getNearestNodeFromDOMNode(target);
        if (!clicked || $isTextNode(clicked)) return;
        const block = $blockOf(clicked);
        if (!block) return;

        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const from = $blockOf(selection.anchor.getNode());
          if (!from) return;
          const forward = from === block || from.isBefore(block);
          setPoint(selection.focus, $edgeOf(block, forward ? "end" : "start"));
        } else if ($isNodeSelection(selection)) {
          // An image selected alone: the range runs from its line.
          const [first] = selection.getNodes();
          const from = first ? $blockOf(first) : null;
          if (!from) return;
          const forward = from === block || from.isBefore(block);
          const range = $createRangeSelection();
          setPoint(range.anchor, $edgeOf(from, forward ? "start" : "end"));
          setPoint(range.focus, $edgeOf(block, forward ? "end" : "start"));
          $setSelection(range);
        } else {
          return;
        }
        extended = true;
      });

      if (extended) event.preventDefault();
    };

    return mergeRegister(
      editor.registerRootListener((root, previous) => {
        previous?.removeEventListener("mousedown", onMouseDown, true);
        root?.addEventListener("mousedown", onMouseDown, true);
      }),
      // The click that follows: the image would select itself alone.
      editor.registerCommand(
        CLICK_COMMAND,
        (event) => {
          if (!extended || !event.shiftKey) return false;
          extended = false;
          return true;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [editor]);

  return null;
}
