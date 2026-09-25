import type { LexicalNode, PointType } from "lexical";
import {
  $createListItemNode,
  $createListNode,
  $isListItemNode,
  $isListNode,
} from "@lexical/list";
import {
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
} from "lexical";

import { $isNestedListHolder } from "./list-marker";
import { $joinNeighboursOfSameKind, $moveIntoListOfType } from "./list-runs";

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

/**
 * The line a node is on, as Notion counts blocks: the list item it is in —
 * a line of its own at any depth, though its list shares a top-level block
 * with others — or else the top-level block. The holder of a nested list is
 * no line; the root is in none.
 */
export function $lineOf(node: LexicalNode): LexicalNode | null {
  if ($isRootOrShadowRoot(node)) return null;
  let current: LexicalNode | null = node;
  while (current) {
    if ($isListItemNode(current) && !$isNestedListHolder(current))
      return current;
    const parent: LexicalNode | null = current.getParent();
    if (parent === null || $isRootOrShadowRoot(parent)) return current;
    current = parent;
  }
  return null;
}

/** Every line of the document, in order. */
function $lines(): LexicalNode[] {
  const lines: LexicalNode[] = [];
  const visitList = (list: LexicalNode) => {
    if (!$isElementNode(list)) return;
    for (const item of list.getChildren()) {
      if (!$isListItemNode(item)) continue;
      if (!$isNestedListHolder(item)) lines.push(item);
      for (const child of item.getChildren()) {
        if ($isListNode(child)) visitList(child);
      }
    }
  };
  for (const block of $getRoot().getChildren()) {
    if ($isListNode(block)) visitList(block);
    else lines.push(block);
  }
  return lines;
}

/** Whether a point sits before any of its line's text. */
function $isAtLineStart(point: PointType, line: LexicalNode): boolean {
  if (point.offset !== 0) return false;
  const node = point.getNode();
  if (node.is(line)) return true;
  const first = $isElementNode(line) ? line.getFirstDescendant() : null;
  return first !== null && (node.is(first) || node.isParentOf(first));
}

/**
 * The lines a selection spans, in document order — Notion's block selection,
 * a list line counting as a block of its own. Only once it crosses from one
 * line into another: inside a single line a selection is text.
 *
 * A selection that ends at the very start of a line — as a triple-click or a
 * drag to the end of a line leaves it — has selected nothing of that line,
 * and does not take it.
 */
export function $selectedBlocks(): LexicalNode[] {
  const selection = $getSelection();
  if (!$isRangeSelection(selection) || selection.isCollapsed()) return [];

  const [start, end] = selection.isBackward()
    ? [selection.focus, selection.anchor]
    : [selection.anchor, selection.focus];
  const first = $lineOf(start.getNode());
  let last = $lineOf(end.getNode());
  if (!first || !last || first.is(last)) return [];

  const lines = $lines();
  let lastIndex = lines.findIndex((line) => line.is(last));
  const firstIndex = lines.findIndex((line) => line.is(first));
  if (firstIndex === -1 || lastIndex === -1) return [];

  if (lastIndex > firstIndex && $isAtLineStart(end, last)) {
    lastIndex -= 1;
    last = lines[lastIndex]!;
  }
  if (first.is(last)) return [];

  return lines.slice(firstIndex, lastIndex + 1);
}

/**
 * Turns the selected lines — or, without a block selection, the line the
 * caret is on — into items of a `type` list, at the depth each is at.
 *
 * A line in a list of another kind moves into a list of `type` of its own,
 * the lines around it keeping theirs; any other block becomes an item. Each
 * then joins a list of the same kind right beside it, so a run of converted
 * lines, and the list they meet, number as one.
 */
export function $turnSelectedBlocksIntoList(type: "bullet" | "number"): void {
  const selection = $getSelection();
  const selected = $selectedBlocks();
  const caretLine = $isRangeSelection(selection)
    ? $lineOf(selection.anchor.getNode())
    : null;
  const lines = selected.length > 0 ? selected : caretLine ? [caretLine] : [];

  for (const line of lines) {
    if ($isListItemNode(line)) {
      const list = line.getParent();
      if (!$isListNode(list)) continue;
      if (list.getListType() !== type) $moveIntoListOfType(line, type, 1);
      const moved = line.getParent();
      if ($isListNode(moved)) $joinNeighboursOfSameKind(moved);
    } else if ($isElementNode(line)) {
      const item = $createListItemNode().append(...line.getChildren());
      const list = $createListNode(type).append(item);
      line.replace(list);
      $joinNeighboursOfSameKind(list);
    }
  }
}
