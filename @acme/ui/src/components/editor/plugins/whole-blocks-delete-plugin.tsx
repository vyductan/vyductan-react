"use client";

import type { LexicalNode } from "lexical";
import { useEffect } from "react";
import { $isListItemNode, $isListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode,
  $getRoot,
  $isElementNode,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from "lexical";

import { $lines, $selectedBlocks } from "../utils/block-selection";

/** Put the caret at the start of `line`, or the end of it with `atEnd`. */
function $caretTo(line: LexicalNode, atEnd: boolean) {
  if ($isElementNode(line)) {
    if (atEnd) line.selectEnd();
    else line.selectStart();
  } else if (atEnd) {
    line.selectNext(0, 0);
  } else {
    line.selectPrevious();
  }
}

/** Remove `node`, then any list or holder item it leaves empty. */
function $removeLine(node: LexicalNode) {
  let parent: LexicalNode | null = node.getParent();
  node.remove();
  while (
    parent &&
    !$isRootOrShadowRoot(parent) &&
    ($isListNode(parent) || $isListItemNode(parent)) &&
    parent.getChildrenSize() === 0
  ) {
    const next: LexicalNode | null = parent.getParent();
    parent.remove();
    parent = next;
  }
}

/**
 * Backspace or Delete on a block selection takes the selected blocks away
 * whole, as Notion does — what is highlighted is what goes. The browser's
 * delete took the text between the ends and joined what was left of the
 * last block into the first: a heading after a quote came out a line of the
 * quote.
 *
 * The caret goes to the start of the line after them, or the end of the one
 * before when they were the last; a page left empty gets an empty line.
 */
export function WholeBlocksDeletePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const onDelete = (event: KeyboardEvent | null) => {
      const selected = $selectedBlocks();
      if (selected.length === 0) return false;
      event?.preventDefault();

      const lines = $lines();
      const gone = new Set(selected.map((line) => line.getKey()));
      const lastIndex = lines.findIndex((line) => line.is(selected.at(-1)!));
      const firstIndex = lines.findIndex((line) => line.is(selected[0]!));
      // Lines nested in a selected one go with it; the next line left is
      // the first that is not inside the selection.
      const after = lines
        .slice(lastIndex + 1)
        .find((line) => !selected.some((s) => s.isParentOf(line)));
      const before = lines
        .slice(0, firstIndex)
        .reverse()
        .find((line) => !gone.has(line.getKey()));

      if (after) $caretTo(after, false);
      else if (before) $caretTo(before, true);
      for (const line of selected) {
        if (line.isAttached()) $removeLine(line);
      }
      if ($getRoot().getChildrenSize() === 0) {
        const paragraph = $createParagraphNode();
        $getRoot().append(paragraph);
        paragraph.select();
      } else if (!after && !before) {
        $getRoot().selectStart();
      }
      return true;
    };
    return mergeRegister(
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor]);

  return null;
}
