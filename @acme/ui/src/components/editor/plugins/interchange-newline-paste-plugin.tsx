"use client";

import type { LexicalNode } from "lexical";
import { useEffect } from "react";
import { $createListNode, $isListItemNode, $isListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode,
  $getSelection,
  $isElementNode,
  $isLineBreakNode,
  $isParagraphNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_NORMAL,
  PASTE_COMMAND,
  SELECTION_INSERT_CLIPBOARD_NODES_COMMAND,
} from "lexical";

/** Chrome's mark for a copy that began at the end of the line above. */
const INTERCHANGE_START =
  /^(?:<meta[^>]*>)?\s*<br class="?Apple-interchange-newline"?\s*\/?>/i;

/**
 * A copy Chrome starts with `<br class="Apple-interchange-newline">` — the
 * selection began at the end of the line above — pastes as Notion takes it:
 * that break is a new block. Pasted on an empty line the words fill it;
 * anywhere else they go on a line of their own after the block the caret is
 * in, which keeps its words — after a list item, out of the list, the items
 * after it a list of their own below.
 *
 * Read as a line break, the words went in a line down inside the block: on
 * an empty numbered item, under its number.
 */
export function InterchangeNewlinePastePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Set while such a paste is on its way in: its nodes reach
    // SELECTION_INSERT_CLIPBOARD_NODES_COMMAND in the same update.
    let leadingBreak = false;

    return mergeRegister(
      editor.registerCommand(
        PASTE_COMMAND,
        (event) => {
          leadingBreak = false;
          if (!("clipboardData" in event) || !event.clipboardData) return false;
          leadingBreak = INTERCHANGE_START.test(
            event.clipboardData.getData("text/html"),
          );
          queueMicrotask(() => {
            leadingBreak = false;
          });
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        SELECTION_INSERT_CLIPBOARD_NODES_COMMAND,
        ({ nodes, selection }) => {
          if (!leadingBreak) return false;
          leadingBreak = false;
          if (!$isRangeSelection(selection) || !$isLineBreakNode(nodes[0])) {
            return false;
          }
          const rest = nodes.slice(1);
          if (rest.length === 0) return false;

          const block = $findMatchingParent(
            selection.anchor.getNode(),
            (node): node is LexicalNode =>
              $isElementNode(node) && !node.isInline(),
          );
          if (!block) return false;
          // An empty line takes the words itself.
          if (
            $isParagraphNode(block) &&
            block.getTextContentSize() === 0 &&
            selection.isCollapsed()
          ) {
            selection.insertNodes(rest);
            return true;
          }

          const line = $createParagraphNode();
          if ($isListItemNode(block)) {
            const list = block.getParent();
            if (!$isListNode(list) || !$isRootOrShadowRoot(list.getParent())) {
              return false;
            }
            const after = block.getNextSiblings();
            list.insertAfter(line);
            if (after.length > 0) {
              line.insertAfter(
                $createListNode(list.getListType()).append(...after),
              );
            }
          } else {
            block.insertAfter(line);
          }
          line.select();
          const into = $getSelection();
          if ($isRangeSelection(into)) into.insertNodes(rest);
          return true;
        },
        COMMAND_PRIORITY_NORMAL,
      ),
    );
  }, [editor]);

  return null;
}
