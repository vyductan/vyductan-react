import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_CRITICAL,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
} from "lexical";

/**
 * Like Notion: with the caret at the edge of inline code, the first arrow
 * press toward the outside leaves the code without moving the caret, so what
 * is typed next is plain text beside it. The next press moves on as usual.
 *
 * Without it the caret moved a character past the edge — and at the start
 * of a table cell, where there is nothing to the left, the table took the
 * key and jumped to the previous cell: there was no way to type before code
 * that opened a cell.
 *
 * Critical priority: ahead of the table's own arrow handling.
 */
export function InlineCodeExitPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const exit = (edge: "start" | "end") => (event: KeyboardEvent | null) => {
      if (event?.shiftKey || event?.altKey || event?.metaKey || event?.ctrlKey)
        return false;
      const selection = $getSelection();
      if (
        !$isRangeSelection(selection) ||
        !selection.isCollapsed() ||
        !selection.hasFormat("code")
      ) {
        return false;
      }
      const { anchor } = selection;
      const node = anchor.getNode();
      if (
        anchor.type !== "text" ||
        !$isTextNode(node) ||
        !node.hasFormat("code")
      )
        return false;
      const atEdge =
        edge === "start"
          ? anchor.offset === 0
          : anchor.offset === node.getTextContentSize();
      if (!atEdge) return false;

      selection.toggleFormat("code");
      event?.preventDefault();
      return true;
    };

    return mergeRegister(
      editor.registerCommand(
        KEY_ARROW_LEFT_COMMAND,
        exit("start"),
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        KEY_ARROW_RIGHT_COMMAND,
        exit("end"),
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [editor]);

  return null;
}
