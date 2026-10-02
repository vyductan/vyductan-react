import type { ElementNode } from "lexical";
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent } from "@lexical/utils";
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECT_ALL_COMMAND,
} from "lexical";

/**
 * Cmd+A as Notion does it: the first press selects the line (block) the caret
 * is in, the next one the whole page.
 *
 * "Already selected" is the trigger for the second step, so a line whose text
 * is all selected — by the first press or by hand — goes straight to the
 * page, as does an empty line or a selection across blocks.
 */
export function SelectLineFirstPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(
    () =>
      editor.registerCommand(
        SELECT_ALL_COMMAND,
        () => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return false;

          const blockOf = (node: Parameters<typeof $findMatchingParent>[0]) =>
            $findMatchingParent(
              node,
              (candidate): candidate is ElementNode =>
                $isElementNode(candidate) && !candidate.isInline(),
            );
          const block = blockOf(selection.anchor.getNode());
          if (!block || block !== blockOf(selection.focus.getNode()))
            return false;

          const text = block.getTextContent();
          if (text === "" || selection.getTextContent() === text) return false;

          block.select(0, block.getChildrenSize());
          return true;
        },
        // Ahead of the rich-text plugin's own select-all, which takes the page.
        COMMAND_PRIORITY_LOW,
      ),
    [editor],
  );

  return null;
}
