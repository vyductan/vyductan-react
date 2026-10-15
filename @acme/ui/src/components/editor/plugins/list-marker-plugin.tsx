"use client";

import { useEffect } from "react";
import { $isListItemNode, $isListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $dfs, $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $setState,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
} from "lexical";

import {
  $displayedListValues,
  $isNestedListHolder,
  $isUnmarkedItem,
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
 * above. Backspace again on that line falls through to Lexical, which takes it
 * out of the list. Checklists keep Lexical's behaviour — their marker is the
 * checkbox.
 *
 * Lexical renders every item with a marker and numbers them by position, so
 * after each update the DOM is corrected: unmarked items lose their marker and
 * the numbers of the rest skip them.
 */
export function ListMarkerPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(
    () =>
      mergeRegister(
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
            if (!$isListItemNode(item) || $isNestedListHolder(item))
              return false;
            if ($isUnmarkedItem(item)) return false;
            const list = item.getParent();
            if (!$isListNode(list) || list.getListType() === "check") {
              return false;
            }
            // Only at the very start of the item's text.
            const first = item.getFirstDescendant();
            const atStart =
              anchorNode.is(item) || (first !== null && anchorNode.is(first));
            if (!atStart) return false;

            event?.preventDefault();
            $setState(item, unmarkedState, true);
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
                if (unmarked) alignUnmarked(element, referenceValue);
                else {
                  element.style.listStyleType = "";
                  element.style.marginInlineStart = "";
                }
                const value = values.get(child.getKey());
                if (value !== undefined) referenceValue = value;
                if (
                  numbered &&
                  value !== undefined &&
                  element.value !== value
                ) {
                  element.value = value;
                }
              }
            }
          });
        }),
      ),
    [editor],
  );

  return null;
}
