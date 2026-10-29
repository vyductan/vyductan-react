import type { LexicalNode } from "lexical";
import { useEffect } from "react";
import { $isListItemNode, $isListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isTableCellNode } from "@lexical/table";
import { $findMatchingParent } from "@lexical/utils";
import {
  $isElementNode,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_INSERT_CLIPBOARD_NODES_COMMAND,
} from "lexical";

/**
 * One block pasted into a line that has words: its words go in at the caret,
 * as in Notion. The whole of a line copies as that line (a heading pastes
 * back a heading on an empty line), so pasted after "Giúp " a list item came
 * in as a new item below rather than joining the text.
 *
 * An empty line is left to the paste as it is: there the block takes it —
 * but not in a table cell, which holds words, as Notion's does: a to-do or a
 * heading pasted there came in checkbox and all. A list keeps its bullets.
 */
export function InlineBlockPastePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(
    () =>
      editor.registerCommand(
        SELECTION_INSERT_CLIPBOARD_NODES_COMMAND,
        ({ nodes, selection }) => {
          if (!$isRangeSelection(selection) || nodes.length !== 1) return false;
          const words = $wordsOf(nodes[0]!);
          if (!words) return false;

          const anchor = selection.anchor.getNode();
          const line =
            $findMatchingParent(anchor, $isListItemNode) ??
            anchor.getTopLevelElement();
          if (!line) return false;
          const inCell =
            $findMatchingParent(anchor, $isTableCellNode) !== null &&
            !$isListNode(nodes[0]);
          if (!inCell && line.getTextContentSize() === 0) return false;

          selection.insertNodes(words);
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
    [editor],
  );

  return null;
}

/**
 * The inline content of one line of text — a paragraph, heading, quote,
 * to-do or a list of one item — or null for anything else (a table, a code
 * block, an image), which goes in as a block.
 */
function $wordsOf(node: LexicalNode): LexicalNode[] | null {
  let block = node;
  if ($isListNode(block)) {
    if (block.getChildrenSize() !== 1) return null;
    block = block.getFirstChildOrThrow();
  }
  if (!$isElementNode(block) || block.isInline()) return null;
  if (block.getType() === "code") return null;
  const children = block.getChildren();
  if (children.length === 0) return null;
  const inline = children.every(
    (child) => !$isElementNode(child) || child.isInline(),
  );
  return inline ? children : null;
}
