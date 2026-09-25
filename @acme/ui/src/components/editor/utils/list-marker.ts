import type { ListNode } from "@lexical/list";
import type { LexicalNode } from "lexical";
import { $isListItemNode, $isListNode } from "@lexical/list";
import { $getState, createState } from "lexical";

/**
 * A list item shown without its marker: Notion's "continuation" line, made by
 * Backspace at the start of an item. It stays in the list at the same depth
 * and takes no number.
 *
 * NodeState rather than a ListItemNode subclass: the flag round-trips through
 * JSON under the node's `$` key with no node replacement to register, and a
 * document without it is unchanged.
 */
export const unmarkedState = createState("unmarked", {
  parse: (value) => value === true,
});

export function $isUnmarkedItem(node: LexicalNode | null | undefined): boolean {
  return $isListItemNode(node) && $getState(node, unmarkedState);
}

/** An item that only holds a nested list, e.g. `<li><ol>…</ol></li>`. */
export function $isNestedListHolder(node: LexicalNode): boolean {
  return (
    $isListItemNode(node) &&
    node.getChildrenSize() > 0 &&
    node.getChildren().every((child) => $isListNode(child))
  );
}

/**
 * The number each item of `list` displays, skipping unmarked items and the
 * holders of nested lists. Keyed by item key; unmarked items are absent.
 */
export function $displayedListValues(list: ListNode): Map<string, number> {
  const values = new Map<string, number>();
  let next = list.getStart();
  for (const child of list.getChildren()) {
    if (!$isListItemNode(child) || $isNestedListHolder(child)) continue;
    if ($isUnmarkedItem(child)) continue;
    values.set(child.getKey(), next);
    next += 1;
  }
  return values;
}
