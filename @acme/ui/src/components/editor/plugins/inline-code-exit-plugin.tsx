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
  SELECTION_CHANGE_COMMAND,
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
    // Where the caret left the code. The selection's format alone does not
    // hold it: a selectionchange the editor did not cause, later than 200ms
    // after the press (VS Code's webview sends them), makes Lexical take the
    // format back from the code node the caret is still in. Every press then
    // "left" the code again and the caret never got past it.
    let exited: { key: string; offset: number } | null = null;

    /** The caret, collapsed in inline code at its `edge`. */
    const $caretAtCodeEdge = (edge: "start" | "end") => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection) || !selection.isCollapsed())
        return null;
      const { anchor } = selection;
      const node = anchor.getNode();
      if (
        anchor.type !== "text" ||
        !$isTextNode(node) ||
        !node.hasFormat("code")
      )
        return null;
      const atEdge =
        edge === "start"
          ? anchor.offset === 0
          : anchor.offset === node.getTextContentSize();
      return atEdge ? selection : null;
    };
    const isExitPoint = (point: { key: string; offset: number }) =>
      exited?.key === point.key && exited.offset === point.offset;

    const exit = (edge: "start" | "end") => (event: KeyboardEvent | null) => {
      if (event?.shiftKey || event?.altKey || event?.metaKey || event?.ctrlKey)
        return false;
      const selection = $caretAtCodeEdge(edge);
      if (!selection) return false;
      // Already out: this press moves on as usual.
      if (isExitPoint(selection.anchor) || !selection.hasFormat("code")) {
        exited = null;
        return false;
      }

      selection.toggleFormat("code");
      exited = { key: selection.anchor.key, offset: selection.anchor.offset };
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
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          if (!exited) return false;
          const selection = $getSelection();
          if (
            !$isRangeSelection(selection) ||
            !selection.isCollapsed() ||
            !isExitPoint(selection.anchor)
          ) {
            exited = null;
          } else if (selection.hasFormat("code")) {
            selection.toggleFormat("code");
          }
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [editor]);

  return null;
}
