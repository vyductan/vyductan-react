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
  INDENT_CONTENT_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_TAB_COMMAND,
  OUTDENT_CONTENT_COMMAND,
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

    const unregisterTab = editor.registerCommand(
      KEY_TAB_COMMAND,
      (event) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;

        const node = selection.anchor.getNode();
        const block = node.getTopLevelElementOrThrow();

        if ($isCheckBlockNode(block)) {
          if (event) event.preventDefault();
          if (event?.shiftKey) {
            editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, void 0);
          } else {
            editor.dispatchCommand(INDENT_CONTENT_COMMAND, void 0);
          }
          return true;
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
        // Click on the real checkbox icon span
        if (target.dataset.checkIcon === "true") {
          const node = target.parentElement
            ? $getNearestNodeFromDOMNode(target.parentElement)
            : null;
          if ($isCheckBlockNode(node)) {
            editor.update(() => {
              node.toggle();
            });
            return true;
          }
        }
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    return () => {
      unregisterEnter();
      unregisterTab();
      unregisterBackspace();
      unregisterClick();
    };
  }, [editor]);

  return null;
}
