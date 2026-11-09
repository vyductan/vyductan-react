import type { ListItemNode, ListNode, ListType } from "@lexical/list";
import type { LexicalNode } from "lexical";
import {
  $createListItemNode,
  $createListNode,
  $isListItemNode,
  $isListNode,
} from "@lexical/list";
import { $getState, $isElementNode, $setState, createState } from "lexical";

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

/**
 * Put `item`'s nested lists in items of their own, as Lexical keeps them:
 * `<li>words<ul>…</ul></li>` is the item's words, then an item holding the
 * nested list. Read any other way the item's marker went (it took the
 * nested list's place in Chrome's layout) and its children hung off it.
 *
 * Lexical splits them so when it reads a whole `<ul>`; a copy taken from
 * the middle of a list starts with bare `<li>`s, which it reads as they are.
 * Words after a nested list go on a line of their own, unmarked — still
 * the item's, as they were.
 */
export function $splitNestedLists(item: ListItemNode): void {
  const children = item.getChildren();
  if (!children.some($isListNode) || children.every($isListNode)) return;
  let last: ListItemNode = item;
  let line: ListItemNode | null = item;
  for (const child of children) {
    if ($isListNode(child)) {
      const holder = $createListItemNode().append(child);
      last.insertAfter(holder);
      last = holder;
      line = null;
    } else if (line === null) {
      line = $createListItemNode();
      $setState(line, unmarkedState, true);
      last.insertAfter(line);
      last = line;
      line.append(child);
    } else if (!line.is(item)) {
      line.append(child);
    }
  }
}

/**
 * A list item's words followed by its nested list, as a paste brings them
 * when the copy began inside the item: Chrome leaves out the list around the
 * selection's start, so the item comes as bare inline words, then a `<ul>`.
 * Pasted on a list item, those words join the item, but the list went in as
 * a block of its own — out at the edge instead of under them.
 *
 * Rewritten in place so the nested list comes in as a holder item in a list
 * of the pasted-on item's type: the words still join the item at the caret,
 * and the holder goes in right after it — under the words.
 */
export function $nestListAfterWords(
  nodes: LexicalNode[],
  listType: ListType,
): void {
  const at = nodes.findIndex($isListNode);
  if (at <= 0) return;
  const words = nodes.slice(0, at);
  if (words.some((node) => $isElementNode(node) && !node.isInline())) return;
  if (words.every((node) => node.getTextContent().trim() === "")) return;
  const holder = $createListItemNode().append(nodes[at]!);
  nodes[at] = $createListNode(listType).append(holder);
}
