import type { BaseSelection } from "lexical";
import { $isListNode, ListNode } from "@lexical/list";
import { $isHeadingNode } from "@lexical/rich-text";
import { $findMatchingParent, $getNearestNodeOfType } from "@lexical/utils";
import { $isRangeSelection, $isRootOrShadowRoot } from "lexical";

import { blockTypeToBlockName } from "../plugins/toolbar/block-format-data";

/**
 * Resolve the block type ("h1" | "bullet" | "code" | "paragraph" | ...) of the
 * current selection. Single implementation of the walk-to-top-level +
 * list-vs-heading branch that the toolbar and useBlockType previously each
 * hand-rolled (and had let drift: one used a string-matching fake
 * $isHeadingNode and skipped list-type validation).
 *
 * Returns null when the caller should keep its previous value: selection is
 * not a range selection, the element has no DOM yet, or a list reports a type
 * outside blockTypeToBlockName. Unknown non-list types resolve to "paragraph".
 *
 * Must run inside an editor read/update context (uses $ functions).
 */
export function $resolveBlockType(
  selection: BaseSelection | null,
  getElementByKey: (key: string) => HTMLElement | null,
): string | null {
  if (!$isRangeSelection(selection)) {
    return null;
  }

  const anchorNode = selection.anchor.getNode();
  let element =
    anchorNode.getKey() === "root"
      ? anchorNode
      : $findMatchingParent(anchorNode, (e) => {
          const parent = e.getParent();
          return parent !== null && $isRootOrShadowRoot(parent);
        });

  element ??= anchorNode.getTopLevelElementOrThrow();

  if (getElementByKey(element.getKey()) === null) {
    return null;
  }

  if ($isListNode(element)) {
    const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
    const type = parentList ? parentList.getListType() : element.getListType();
    return type in blockTypeToBlockName ? type : null;
  }

  const type = $isHeadingNode(element) ? element.getTag() : element.getType();
  return type in blockTypeToBlockName ? type : "paragraph";
}
