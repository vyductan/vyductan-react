import type { RangeSelection, TextNode } from "lexical";
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $addUpdateTag,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_CRITICAL,
  getDOMSelection,
  getDOMTextNode,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  SKIP_DOM_SELECTION_TAG,
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
 * Out of the code, the caret is also drawn outside its box when there is
 * text after it: in the DOM it goes to the start of that text. The model
 * cannot follow — Lexical moves a caret at the start of a text node to the
 * end of the one before — so there it stays at the code's end, with the
 * selection's format plain. The same holds when ArrowLeft comes back from
 * that text: the caret stops before it, outside the code.
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
      return atEdge ? { selection, node } : null;
    };
    const isExitPoint = (point: { key: string; offset: number }) =>
      exited?.key === point.key && exited.offset === point.offset;

    /** The DOM text of the plain text right after `code`, if any. */
    const $domTextAfter = (code: TextNode) => {
      const next = code.getNextSibling();
      if (!$isTextNode(next) || !next.isSimpleText() || next.hasFormat("code"))
        return null;
      const element = editor.getElementByKey(next.getKey());
      return element ? getDOMTextNode(element) : null;
    };

    /** Out of the code, leaving the DOM caret where it is drawn. */
    const $leave = (selection: RangeSelection) => {
      if (selection.hasFormat("code")) selection.toggleFormat("code");
      $addUpdateTag(SKIP_DOM_SELECTION_TAG);
      exited = { key: selection.anchor.key, offset: selection.anchor.offset };
    };

    const exit = (edge: "start" | "end") => (event: KeyboardEvent | null) => {
      if (event?.shiftKey || event?.altKey || event?.metaKey || event?.ctrlKey)
        return false;
      const caret = $caretAtCodeEdge(edge);
      if (!caret) return false;
      const { selection, node } = caret;
      // Already out: this press moves on as usual.
      if (isExitPoint(selection.anchor) || !selection.hasFormat("code")) {
        exited = null;
        return false;
      }

      event?.preventDefault();
      const afterDOM = edge === "end" ? $domTextAfter(node) : null;
      if (afterDOM) {
        $leave(selection);
        getDOMSelection(editor._window)?.collapse(afterDOM, 0);
      } else {
        // Nothing beside it to draw the caret in.
        selection.toggleFormat("code");
        exited = { key: selection.anchor.key, offset: selection.anchor.offset };
      }
      return true;
    };

    /**
     * ArrowLeft one character after inline code, from the text after it:
     * the browser would draw the caret at the code's end, inside its box.
     */
    const backBesideCode = (event: KeyboardEvent | null) => {
      if (event?.shiftKey || event?.altKey || event?.metaKey || event?.ctrlKey)
        return false;
      const selection = $getSelection();
      if (!$isRangeSelection(selection) || !selection.isCollapsed())
        return false;
      const { anchor } = selection;
      const node = anchor.getNode();
      if (anchor.type !== "text" || !$isTextNode(node) || anchor.offset === 0)
        return false;
      const code = node.getPreviousSibling();
      if (
        !$isTextNode(code) ||
        !code.isSimpleText() ||
        !code.hasFormat("code") ||
        !isOneCharacter(node.getTextContent().slice(0, anchor.offset))
      )
        return false;
      const afterDOM = $domTextAfter(code);
      if (!afterDOM) return false;

      event?.preventDefault();
      const end = code.getTextContentSize();
      const back = code.select(end, end);
      $leave(back);
      getDOMSelection(editor._window)?.collapse(afterDOM, 0);
      return true;
    };

    const exitStart = exit("start");

    return mergeRegister(
      editor.registerCommand(
        KEY_ARROW_LEFT_COMMAND,
        (event) => exitStart(event) || backBesideCode(event),
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
          const caret = $caretAtCodeEdge("end");
          if (!caret) {
            exited = null;
            return false;
          }
          const { selection, node } = caret;
          // Drawn at the start of the text after the code: arrowed back to
          // from that text, or put there on the way out.
          const afterDOM = $domTextAfter(node);
          const domSelection = getDOMSelection(editor._window);
          const drawnAfter =
            afterDOM !== null &&
            domSelection?.anchorNode === afterDOM &&
            domSelection.anchorOffset === 0;
          if (drawnAfter || isExitPoint(selection.anchor)) {
            $leave(selection);
          } else {
            exited = null;
          }
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [editor]);

  return null;
}

const segmenter = new Intl.Segmenter();
const isOneCharacter = (text: string) => {
  const [first, second] = segmenter.segment(text);
  return first !== undefined && second === undefined;
};
