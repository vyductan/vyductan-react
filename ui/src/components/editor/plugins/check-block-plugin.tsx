import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getNearestNodeFromDOMNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_ENTER_COMMAND,
} from "lexical";

import {
  $createCheckBlockNode,
  $isCheckBlockNode,
  CheckBlockNode,
} from "../nodes/check-block-node";

export function CheckBlockPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([CheckBlockNode])) {
      throw new Error(
        "CheckBlockPlugin: CheckBlockNode not registered on editor",
      );
    }

    const unregisterEnter = editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;

        const anchor = selection.anchor;
        const node = anchor.getNode();
        const block = node.getTopLevelElementOrThrow();

        if ($isCheckBlockNode(block)) {
          // If hitting enter at the start of empty block, Turn into Paragraph
          if (block.getTextContentSize() === 0 && selection.isCollapsed()) {
            const p = $createParagraphNode();
            block.replace(p);
            p.select();
            if (event) event.preventDefault();
            return true;
          }

          if (!event?.shiftKey) {
            const newBlock = $createCheckBlockNode(false);

            if (selection.isCollapsed()) {
              const anchor = selection.anchor;
              const currentNode = anchor.getNode();

              // Check if we are inside a text node to split it
              if ($isTextNode(currentNode)) {
                // Split text at cursor
                if (anchor.offset < currentNode.getTextContentSize()) {
                  // splitText returns [original, new]
                  // Lexical's TextNode.splitText splits and inserts new node
                  const splitNodes = currentNode.splitText(anchor.offset);
                  const rightPart = splitNodes[1];

                  if (rightPart) {
                    // Move rightPart and all successing siblings to new block
                    const nextSiblings = rightPart.getNextSiblings();
                    block.insertAfter(newBlock);
                    newBlock.append(rightPart, ...nextSiblings);
                  }
                } else {
                  // At end of text node
                  const nextSiblings = currentNode.getNextSiblings();
                  block.insertAfter(newBlock);
                  if (nextSiblings.length > 0) {
                    newBlock.append(...nextSiblings);
                  }
                }
                newBlock.selectStart();
                if (event) event.preventDefault();
                return true;
              }
            }

            // Fallback for non-text selections or simplifications
            block.insertAfter(newBlock);
            newBlock.selectStart();
            if (event) event.preventDefault();
            return true;
          }
        }
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    const unregisterBackspace = editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      (event) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;

        const anchor = selection.anchor;
        if (selection.isCollapsed() && anchor.offset === 0) {
          const node = anchor.getNode();
          const block = node.getTopLevelElementOrThrow();
          if (
            $isCheckBlockNode(block) && // If at start, convert to paragraph
            // If there are other blocks before, standard backspace merges.
            // But if we are at start of content, we prefer turning into paragraph?
            // Notion behavior: Backspace at start of empty checkblock -> turn to paragraph
            block.getTextContentSize() === 0
          ) {
            const p = $createParagraphNode();
            block.replace(p);
            p.select();
            event.preventDefault();
            return true;
          }
        }
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    const unregisterClick = editor.registerCommand(
      CLICK_COMMAND,
      (event) => {
        const target = event.target as HTMLElement;
        // Check if we clicked the checkbox area.
        // My default DOM is `div.check-block`.
        // User clicks anywhere?
        // Usually checkbox is absolute/before.
        // If I use styling `before`, the click target is the div.
        // I need to determine if click coordinate is in "checkbox zone".
        // e.g. x < 24px relative to block.

        // Getting the nearest CheckBlockNode
        const node = $getNearestNodeFromDOMNode(target);
        if ($isCheckBlockNode(node)) {
          const rect = target.getBoundingClientRect();
          const x = event.clientX - rect.left;
          // Assume checkbox is on left, ~24px width
          if (x >= 0 && x <= 24) {
            editor.update(() => {
              node.toggle();
            });
            // Prevent default? Maybe default selection.
            // If we toggle, we probably don't want to move caret?
            // Actually, clicking checkbox usually doesn't move caret or focus.
            // event.preventDefault();
            return true;
          }
        }
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    return () => {
      unregisterEnter();
      unregisterBackspace();
      unregisterClick();
    };
  }, [editor]);

  return null;
}
