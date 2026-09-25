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

/** What typing each marker, then a space, asks for. */
function listTypeFor(marker: string): ListType | null {
  if (/^[-*+]$/.test(marker)) return "bullet";
  if (/^\d+[.)]$/.test(marker)) return "number";
  return null;
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
 * "1. " a numbered item, at the same depth.
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
            $moveIntoListOfType(
              item,
              type,
              type === "number" ? Number.parseInt(marker, 10) || 1 : 1,
            );
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
