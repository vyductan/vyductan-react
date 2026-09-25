import type { LexicalNode } from "lexical";
import { $dfs, $findMatchingParent } from "@lexical/utils";
import {
  $getSelection,
  $isElementNode,
  $isLineBreakNode,
  $isRangeSelection,
  $isTextNode,
} from "lexical";

const isBlock = (node: LexicalNode) => $isElementNode(node) && !node.isInline();

/**
 * The text between the start of the caret's line and the caret, or null when
 * there is no collapsed range selection.
 *
 * "Line" is the visual line inside the block: a soft break (Shift+Enter)
 * starts a new one. Read across every text node of the block rather than the
 * anchor node alone — a line split into runs by formatting (bold text, then a
 * plain "/") has its "/" at offset 0 of the second node, not at the line start.
 *
 * Call inside an editor read or update.
 */
export function $textBeforeCaretOnLine(): string | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection) || !selection.isCollapsed()) return null;

  const { anchor } = selection;
  const anchorNode = anchor.getNode();
  const block = isBlock(anchorNode)
    ? anchorNode
    : $findMatchingParent(anchorNode, isBlock);
  if (!block) return null;

  let text = "";
  for (const { node } of $dfs(block)) {
    if (node.is(anchorNode)) {
      if ($isTextNode(node)) {
        text += node.getTextContent().slice(0, anchor.offset);
      }
      break;
    }
    if ($isLineBreakNode(node)) text += "\n";
    else if ($isTextNode(node)) text += node.getTextContent();
  }

  return text.slice(text.lastIndexOf("\n") + 1);
}
