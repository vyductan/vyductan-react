import type { ElementNode, LexicalNode } from "lexical";
import { $createListNode, $isListItemNode, $isListNode } from "@lexical/list";
import { $findMatchingParent } from "@lexical/utils";
import { $isRootOrShadowRoot } from "lexical";

import type { LayoutItemNode } from "../../nodes/layout-item-node";
import {
  $createLayoutContainerNode,
  $isLayoutContainerNode,
} from "../../nodes/layout-container-node";
import {
  $createLayoutItemNode,
  $isLayoutItemNode,
} from "../../nodes/layout-item-node";

/*
 * Columns made by dragging, as Notion does: a block dropped on the left or
 * right edge of another goes beside it. Beside a block on its own, the two
 * become a pair of columns; beside a block already in a column, it becomes a
 * column of its own next to that one. A column a drag empties goes, and
 * columns down to one are columns no more: what is left takes their place.
 */

export type Side = "left" | "right";

/** Equal widths for `count` columns: what a drag leaves them at. */
export const equalColumns = (count: number) =>
  Array.from({ length: count }, () => "1fr").join(" ");

/** The column `node` is in, if it is in one. */
export function $columnOf(node: LexicalNode): LayoutItemNode | null {
  return $findMatchingParent(node, $isLayoutItemNode);
}

/**
 * The block `node` stands for when blocks are moved: the node itself at the
 * top of the document or of a column, else what holds it there — the list
 * around an item.
 */
export function $blockAnchor(node: LexicalNode): LexicalNode {
  let anchor = node;
  let parent = anchor.getParent();
  while (parent && !$isRootOrShadowRoot(parent)) {
    anchor = parent;
    parent = anchor.getParent();
  }
  return anchor;
}

/**
 * What a dragged node goes into a column as: a list item comes with its
 * nested children, in a list of its own of the same kind.
 */
function $asBlock(node: LexicalNode): LexicalNode[] {
  if (!$isListItemNode(node)) return [node];
  const list = node.getParent();
  const wrapper = $createListNode(
    $isListNode(list) ? list.getListType() : "bullet",
  );
  const next = node.getNextSibling();
  const children =
    $isListItemNode(next) &&
    next.getChildrenSize() === 1 &&
    $isListNode(next.getFirstChild())
      ? next
      : null;
  wrapper.append(node);
  if (children) wrapper.append(children);
  return [wrapper];
}

/** Remove lists (and wrapper items) a move left with no items. */
function $pruneEmptyLists(start: LexicalNode | null) {
  let node = start;
  while (
    node &&
    ($isListNode(node) || $isListItemNode(node)) &&
    (node as ElementNode).getChildrenSize() === 0
  ) {
    const parent: LexicalNode | null = node.getParent();
    node.remove();
    node = parent;
  }
}

/**
 * Tidy the columns `column` was in after blocks left it: gone if empty, and
 * its container undone once one column is left.
 */
export function $pruneColumn(column: LayoutItemNode | null) {
  if (!column?.isAttached()) return;
  const container = column.getParent();
  if (column.getChildrenSize() === 0) column.remove();
  if (!$isLayoutContainerNode(container) || !container.isAttached()) return;
  const columns = container.getChildren().filter($isLayoutItemNode);
  if (columns.length > 1) {
    container.setTemplateColumns(equalColumns(columns.length));
    return;
  }
  for (const last of columns) {
    for (const child of last.getChildren()) container.insertBefore(child);
  }
  container.remove();
}

/**
 * Whether `dragged` may go beside `target`: not beside itself or something
 * of its own, never in a table cell, and columns are never put inside
 * columns.
 */
export function $canDropBeside(
  dragged: LexicalNode[],
  target: LexicalNode,
): boolean {
  const anchor = $blockAnchor(target);
  if ($isLayoutContainerNode(anchor) || $isLayoutItemNode(anchor)) return false;
  // At the top of the document or of a column — not in a table cell.
  const parent = anchor.getParent();
  if (!parent || !($isLayoutItemNode(parent) || parent.getParent() === null)) {
    return false;
  }
  return !dragged.some(
    (node) =>
      node.is(anchor) ||
      node.isParentOf(anchor) ||
      $isLayoutContainerNode(node) ||
      $isLayoutItemNode(node),
  );
}

/**
 * Put `dragged` (in order) in a new column on `side` of `target`'s block,
 * then tidy the columns they came from.
 */
export function $dropBeside(
  dragged: LexicalNode[],
  target: LexicalNode,
  side: Side,
): void {
  const anchor = $blockAnchor(target);
  const from = dragged.map((node) => ({
    column: $columnOf(node),
    parent: node.getParent(),
  }));

  const column = $createLayoutItemNode();
  for (const node of dragged) column.append(...$asBlock(node));

  const targetColumn = $columnOf(anchor);
  if (targetColumn) {
    if (side === "left") targetColumn.insertBefore(column);
    else targetColumn.insertAfter(column);
    const container = targetColumn.getParent();
    if ($isLayoutContainerNode(container)) {
      container.setTemplateColumns(
        equalColumns(container.getChildren().filter($isLayoutItemNode).length),
      );
    }
  } else {
    const container = $createLayoutContainerNode(equalColumns(2));
    anchor.insertBefore(container);
    const targetSide = $createLayoutItemNode();
    targetSide.append(anchor);
    container.append(
      ...(side === "left" ? [column, targetSide] : [targetSide, column]),
    );
  }

  for (const { column: old, parent } of from) {
    $pruneEmptyLists(parent);
    $pruneColumn(old);
  }
}
