"use client";

import type { ListItemNode, ListNode, ListType } from "@lexical/list";
import { useEffect } from "react";
import {
  $createListItemNode,
  $createListNode,
  $isListItemNode,
  $isListNode,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $setState,
  COMMAND_PRIORITY_LOW,
  KEY_SPACE_COMMAND,
} from "lexical";

import { $isUnmarkedItem, unmarkedState } from "../utils/list-marker";

const ROMAN_VALUES: Record<string, number> = {
  i: 1,
  v: 5,
  x: 10,
  l: 50,
  c: 100,
};

function romanValue(numeral: string): number {
  let total = 0;
  for (let index = 0; index < numeral.length; index++) {
    const value = ROMAN_VALUES[numeral[index]!] ?? 0;
    const next = ROMAN_VALUES[numeral[index + 1] ?? ""] ?? 0;
    total += value < next ? -value : value;
  }
  return total;
}

/**
 * Where a numbered marker starts counting: "3." is 3, and so is "c." or
 * "iii." — nested numbered lists show letters and numerals, so that is what
 * gets typed at them. A lone "i" is the numeral; other lone letters count as
 * letters.
 */
function numberedStart(marker: string): number | null {
  const token = /^(\d+|[a-z]|[ivxlc]+)[.)]$/i.exec(marker)?.[1]?.toLowerCase();
  if (!token) return null;
  if (/^\d+$/.test(token)) return Number.parseInt(token, 10);
  if (token.length === 1 && token !== "i") return token.charCodeAt(0) - 96;
  return /^[ivxlc]+$/.test(token) ? romanValue(token) : null;
}

/** What typing each marker, then a space, asks for. */
function listTypeFor(marker: string): ListType | null {
  if (/^[-*+]$/.test(marker)) return "bullet";
  if (numberedStart(marker) !== null) return "number";
  return null;
}

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
function $joinNeighboursOfSameKind(list: ListNode) {
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
function $moveIntoListOfType(
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

/**
 * Notion's markers typed at the start of a list line: "- " makes it a bullet,
 * "1. " — or "a.", "i." — a numbered item, at the same depth, joining a list
 * of that kind right beside it.
 *
 * Lexical's markdown shortcuts only fire at the start of a paragraph, never
 * inside a list item — so after Backspace had taken a line's marker away
 * (see ListMarkerPlugin), typing "- " there left "- " on the line as text.
 *
 * A line that already is that kind of item keeps the text, as in Notion,
 * unless it is an unmarked line of the list, which gets its marker back.
 */
export function ListMarkerShortcutPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(
    () =>
      editor.registerCommand(
        KEY_SPACE_COMMAND,
        (event) => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
            return false;
          }

          const anchor = selection.anchor.getNode();
          if (!$isTextNode(anchor)) return false;

          const item = $findMatchingParent(anchor, (node) =>
            $isListItemNode(node),
          );
          if (!$isListItemNode(item)) return false;
          // Only at the very start of the line: its first text, up to the caret.
          if (!anchor.is(item.getFirstDescendant())) return false;

          const offset = selection.anchor.offset;
          const marker = anchor.getTextContent().slice(0, offset);
          const type = listTypeFor(marker);
          if (!type) return false;

          const list = item.getParent();
          if (!$isListNode(list) || list.getListType() === "check")
            return false;

          const sameKind = list.getListType() === type;
          if (sameKind && !$isUnmarkedItem(item)) return false;

          event?.preventDefault();
          anchor.spliceText(0, offset, "", true);
          $setState(item, unmarkedState, false);

          if (!sameKind) {
            $moveIntoListOfType(item, type, numberedStart(marker) ?? 1);
            const moved = item.getParent();
            if ($isListNode(moved)) $joinNeighboursOfSameKind(moved);
          }

          const first = item.getFirstDescendant();
          if ($isTextNode(first)) first.select(0, 0);
          else item.selectStart();
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
    [editor],
  );

  return null;
}
