"use client";

import type { LexicalEditor } from "lexical";
import { useEffect } from "react";
import { $isListItemNode, $isListNode, ListItemNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isTableCellNode } from "@lexical/table";
import { $dfs, $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $setState,
  COMMAND_PRIORITY_LOW,
  INDENT_CONTENT_COMMAND,
  KEY_BACKSPACE_COMMAND,
  OUTDENT_CONTENT_COMMAND,
} from "lexical";

import {
  $displayedListValues,
  $isNestedListHolder,
  $isUnmarkedItem,
  $splitNestedLists,
  unmarkedState,
} from "../utils/list-marker";

/** Left edge of an element's text, not of its box. */
function textLeft(element: HTMLElement): number {
  const range = document.createRange();
  range.selectNodeContents(element);
  return range.getBoundingClientRect().left;
}

/**
 * Hide an item's marker and pull its text left to where markers start, as
 * Notion lines a continuation up with the labels rather than the text.
 *
 * Measured, not assumed: Chrome draws an outside marker (a glyph for numbers,
 * a shape for bullets) against the text, and turning it inside pushes the text
 * right by exactly that width — so the width is read from a real marker,
 * whatever its font or level. Not the item's own hidden number, though: under
 * that number every line of a run measured a different label (i. / ii. / iii.
 * differ by several pixels) and the run came out ragged. Each line measures
 * `referenceValue` instead — the label of the item it continues.
 */
function alignUnmarked(element: HTMLLIElement, referenceValue: number) {
  element.style.marginInlineStart = "";
  element.style.listStyleType = "";
  const ownValue = element.getAttribute("value");
  element.value = referenceValue;
  const outside = textLeft(element);
  element.style.listStylePosition = "inside";
  const inside = textLeft(element);
  element.style.listStylePosition = "";
  if (ownValue === null) element.removeAttribute("value");
  else element.setAttribute("value", ownValue);
  element.style.listStyleType = "none";
  const markerWidth = inside - outside;
  if (markerWidth > 0) element.style.marginInlineStart = `${-markerWidth}px`;
}

/**
 * Notion-style Backspace at the start of a list item: the marker goes, the
 * line stays in the list at the same depth as a continuation of the item
 * above. Backspace again on that line joins it to the line above. In a
 * checklist the marker is the checkbox: it goes the same way.
 *
 * Lexical renders every item with a marker and numbers them by position, so
 * after each update the DOM is corrected: unmarked items lose their marker and
 * the numbers of the rest skip them.
 */
/**
 * The item on the line above `item` in its list: the one before it, or the
 * last line nested in it. None for the first item.
 */
function $lineAbove(item: ListItemNode): ListItemNode | null {
  let above = item.getPreviousSibling();
  while ($isListItemNode(above) && $isNestedListHolder(above)) {
    const nested = above.getLastChild();
    above = $isListNode(nested) ? nested.getLastChild() : null;
  }
  return $isListItemNode(above) ? above : null;
}

function tabInCellList(editor: LexicalEditor, event: KeyboardEvent) {
  if (event.key !== "Tab" || event.metaKey || event.ctrlKey || event.altKey)
    return;
  const inCellList = editor.read(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return false;
    const node = selection.anchor.getNode();
    const item = $isListItemNode(node)
      ? node
      : $findMatchingParent(node, $isListItemNode);
    return (
      $isListItemNode(item) &&
      $findMatchingParent(item, $isTableCellNode) !== null
    );
  });
  if (!inCellList) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  editor.dispatchCommand(
    event.shiftKey ? OUTDENT_CONTENT_COMMAND : INDENT_CONTENT_COMMAND,
    undefined,
  );
}

export function ListMarkerPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const onTabInCellList = (event: KeyboardEvent) =>
      tabInCellList(editor, event);
    return mergeRegister(
      // An item holding words and a nested list side by side (a copy from
      // the middle of a list) is split as Lexical keeps items.
      editor.registerNodeTransform(ListItemNode, $splitNestedLists),
      // As in Notion: in a list in a table cell, Tab nests the item and
      // Shift+Tab takes it back out. The table's own Tab (to the next
      // cell) runs first in Lexical, so this listens ahead of it, on the
      // root in the capture phase; anywhere else Tab is left to it.
      editor.registerRootListener((root, previous) => {
        previous?.removeEventListener("keydown", onTabInCellList, true);
        root?.addEventListener("keydown", onTabInCellList, true);
      }),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        (event) => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
            return false;
          }
          const { anchor } = selection;
          if (anchor.offset !== 0) return false;
          const anchorNode = anchor.getNode();
          const item = $isListItemNode(anchorNode)
            ? anchorNode
            : $findMatchingParent(anchorNode, $isListItemNode);
          if (!$isListItemNode(item) || $isNestedListHolder(item)) return false;
          if ($isUnmarkedItem(item)) {
            // Its words join the line above, as in Notion — an empty one
            // simply goes: Enter then Backspace twice is back where it was.
            // Taken out of the list instead, it cut the list in two and
            // put the items after it a level off.
            const above = $lineAbove(item);
            if (!above) return false;
            const first = item.getFirstDescendant();
            const atStart =
              anchorNode.is(item) || (first !== null && anchorNode.is(first));
            if (!atStart) return false;
            event?.preventDefault();
            const end = above.getLastDescendant();
            const endOffset = $isTextNode(end) ? end.getTextContentSize() : 0;
            const childrenBefore = above.getChildrenSize();
            above.append(...item.getChildren());
            item.remove();
            if ($isTextNode(end) && end.isAttached()) {
              end.select(endOffset, endOffset);
            } else {
              above.select(childrenBefore, childrenBefore);
            }
            return true;
          }
          const list = item.getParent();
          if (!$isListNode(list)) return false;
          // In a table cell, as in Notion, an item of the outer list
          // becomes words at the cell's margin: Lexical's own Backspace
          // takes it out of the list.
          if (
            !$isListItemNode(list.getParent()) &&
            $findMatchingParent(list, $isTableCellNode) !== null
          ) {
            return false;
          }
          // Only at the very start of the item's text.
          const first = item.getFirstDescendant();
          const atStart =
            anchorNode.is(item) || (first !== null && anchorNode.is(first));
          if (!atStart) return false;

          event?.preventDefault();
          $setState(item, unmarkedState, true);
          // A to-do's checkbox is its marker: it goes, tick and all.
          if (list.getListType() === "check") item.setChecked(undefined);
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          for (const { node } of $dfs($getRoot())) {
            if (!$isListNode(node)) continue;
            const values = $displayedListValues(node);
            const numbered = node.getListType() === "number";
            // The label an unmarked line continues: the nearest labelled
            // item above it, or the list's first label when there is none.
            let referenceValue = node.getStart();
            for (const child of node.getChildren()) {
              if (!$isListItemNode(child) || $isNestedListHolder(child)) {
                continue;
              }
              const element = editor.getElementByKey(child.getKey());
              if (!(element instanceof HTMLLIElement)) continue;
              const unmarked = $isUnmarkedItem(child);
              if (unmarked && node.getListType() === "check") {
                // A to-do's box is drawn by its own CSS, keyed on this; it
                // is no checkbox any more for assistive tech either.
                element.dataset.unmarked = "true";
                element.removeAttribute("role");
                element.removeAttribute("aria-checked");
              } else if (unmarked) alignUnmarked(element, referenceValue);
              else {
                delete element.dataset.unmarked;
                element.style.listStyleType = "";
                element.style.marginInlineStart = "";
              }
              const value = values.get(child.getKey());
              if (value !== undefined) referenceValue = value;
              if (numbered && value !== undefined && element.value !== value) {
                element.value = value;
              }
            }
          }
        });
      }),
    );
  }, [editor]);

  return null;
}
