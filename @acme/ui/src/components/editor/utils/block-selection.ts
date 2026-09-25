import type { LexicalNode } from "lexical";
import { $getSelection, $isRangeSelection } from "lexical";

/** Marks a block covered by a multi-block selection; styled by the editable. */
export const BLOCK_SELECTED_ATTRIBUTE = "data-block-selected";

/**
 * The top-level blocks a selection spans, in document order — Notion's block
 * selection. Only once it crosses from one block into another: inside a single
 * block a selection is text, and stays text.
 */
export function $selectedTopLevelBlocks(): LexicalNode[] {
  const selection = $getSelection();
  if (!$isRangeSelection(selection) || selection.isCollapsed()) return [];
  const anchor = selection.anchor.getNode().getTopLevelElement();
  const focus = selection.focus.getNode().getTopLevelElement();
  if (!anchor || !focus || anchor.is(focus)) return [];

  const [first, last] = anchor.isBefore(focus)
    ? [anchor, focus]
    : [focus, anchor];
  const blocks: LexicalNode[] = [first];
  let node = first.getNextSibling();
  while (node && !node.is(last)) {
    blocks.push(node);
    node = node.getNextSibling();
  }
  blocks.push(last);
  return blocks;
}
