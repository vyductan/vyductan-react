import type { ListItemNode, ListNode, ListType } from "@lexical/list";
import {
  $createListItemNode,
  $createListNode,
  $isListItemNode,
  $isListNode,
} from "@lexical/list";

/*
 * Moving list lines between runs of a kind, at the same depth. Shared by the
 * marker shortcuts ("- ", "1. ") and by turning selected blocks into a list.
 */

/** The list beside `list` on `side`, at the same depth, if it is of the same kind. */
function $neighbourOfSameKind(
  list: ListNode,
  side: "previous" | "next",
): ListNode | null {
  const holder = list.getParent();
  const beside = $isListItemNode(holder)
    ? side === "previous"
      ? holder.getPreviousSibling()
      : holder.getNextSibling()
    : side === "previous"
      ? list.getPreviousSibling()
      : list.getNextSibling();

  const candidate = $isListItemNode(holder)
    ? $isListItemNode(beside) && beside.getChildrenSize() === 1
      ? beside.getFirstChild()
      : null
    : beside;

  return $isListNode(candidate) &&
    candidate.getListType() === list.getListType()
    ? candidate
    : null;
}

/** Removes `list`, and the holder item it sat in when nested. */
function $removeList(list: ListNode) {
  const holder = list.getParent();
  if ($isListItemNode(holder) && holder.getChildrenSize() === 1)
    holder.remove();
  else list.remove();
}

/**
 * Joins `list` with lists of the same kind right beside it, as Notion numbers
 * adjacent items of a kind as one run. A line turned numbered between "• a"
 * and "a. b  b. c" otherwise started a run of its own, and the list after it
 * counted from "a." again.
 */
export function $joinNeighboursOfSameKind(list: ListNode) {
  let joined = list;

  const previous = $neighbourOfSameKind(joined, "previous");
  if (previous) {
    previous.append(...joined.getChildren());
    $removeList(joined);
    joined = previous;
  }

  const next = $neighbourOfSameKind(joined, "next");
  if (next) {
    joined.append(...next.getChildren());
    $removeList(next);
  }
}

/**
 * Moves `item` into a list of its own of `type`, at the same depth, with the
 * items after it carried on in a list of the kind it came from.
 *
 * A nested list lives in a holder item of its own, so at depth the split is
 * of holders: one for the items before, one for this item, one for the rest.
 */
export function $moveIntoListOfType(
  item: ListItemNode,
  type: ListType,
  start: number,
) {
  const list = item.getParent<ListNode>();
  if (!$isListNode(list)) return;

  const after = item.getNextSiblings();
  const own = $createListNode(type, start);
  const rest =
    after.length > 0
      ? $createListNode(list.getListType()).append(...after)
      : null;

  const holder = list.getParent();
  if ($isListItemNode(holder)) {
    const ownHolder = $createListItemNode().append(own);
    holder.insertAfter(ownHolder);
    if (rest) ownHolder.insertAfter($createListItemNode().append(rest));
    own.append(item);
    if (list.isEmpty()) holder.remove();
  } else {
    list.insertAfter(own);
    if (rest) own.insertAfter(rest);
    own.append(item);
    if (list.isEmpty()) list.remove();
  }
}
