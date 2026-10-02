import type { LexicalEditor, RangeSelection, TextNode } from "lexical";
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  BLUR_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  getDOMTextNode,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";

/**
 * Like Notion, the caret at an edge of inline code has two places: inside
 * the code and outside it. An arrow press toward the other side moves it
 * there without moving through the text, so what is typed next goes in or
 * out of the code. The next press moves on as usual.
 *
 * - At the end of code, ArrowRight leaves it (and ArrowLeft goes back in).
 * - At the start of code, ArrowLeft leaves it (and ArrowRight goes back in).
 * - Coming back one character with ArrowLeft stops on the side the caret
 *   came from: before the code's first character, still in the code; or
 *   right after the code, outside it.
 *
 * Without it the caret moved a character past the edge — and at the start
 * of a table cell, where there is nothing to the left, the table took the
 * key and jumped to the previous cell: there was no way to type before code
 * that opened a cell.
 *
 * In the model both places are one point: Lexical moves a caret at the
 * start of a text node to the end of the one before. The side is the
 * selection's format, code or not. The browser cannot draw it either: it
 * puts the caret at the code's text edge whichever side the DOM selection
 * is on — the padding between them is no content to it. So on the side it
 * does not draw, the native caret is hidden and the editor draws its own.
 *
 * Critical priority: ahead of the table's own arrow handling.
 */
export function InlineCodeExitPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // The side chosen, at the point it was chosen for. The selection's
    // format alone does not hold it: a selectionchange the editor did not
    // cause, later than 200ms after the press (VS Code's webview sends
    // them), makes Lexical take the format back from the node the caret is
    // in. Every press then "left" the code again and the caret never got
    // past it.
    let side: { key: string; offset: number; inCode: boolean } | null = null;
    const caret = createDrawnCaret(editor);

    const isSidePoint = (selection: RangeSelection) =>
      side !== null &&
      selection.isCollapsed() &&
      selection.anchor.key === side.key &&
      selection.anchor.offset === side.offset;

    const $choose = (selection: RangeSelection, inCode: boolean) => {
      if (selection.hasFormat("code") !== inCode)
        selection.toggleFormat("code");
      const { key, offset } = selection.anchor;
      side = { key, offset, inCode };
    };

    const press = (direction: "left" | "right") => (event: KeyboardEvent) => {
      if (event.shiftKey || event.altKey || event.metaKey || event.ctrlKey)
        return false;
      const selection = $getSelection();
      if (!$isRangeSelection(selection) || !selection.isCollapsed())
        return false;

      const edge = $codeEdgeAt(selection);
      if (edge) {
        // The press toward the side the caret is not on yet: the code's
        // outside is past its edge.
        const outward = edge.edge === "end" ? "right" : "left";
        const inCode = selection.hasFormat("code");
        if (inCode === (direction === outward)) {
          event.preventDefault();
          $choose(selection, !inCode);
          return true;
        }
        side = null;
        return false;
      }

      if (direction === "left") {
        const back = $oneCharacterAfterBoundary(selection);
        if (back) {
          event.preventDefault();
          const end = back.before.getTextContentSize();
          $choose(back.before.select(end, end), back.after.hasFormat("code"));
          return true;
        }
      }
      return false;
    };

    const $redraw = () => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection) || !isSidePoint(selection)) {
        side = null;
        caret.hide();
        return;
      }
      const edge = $codeEdgeAt(selection);
      // The browser draws the caret in the node the model point is in.
      if (!edge || side!.inCode === edge.at.hasFormat("code")) caret.hide();
      else caret.show(edge, side!.inCode);
    };

    return mergeRegister(
      editor.registerCommand(
        KEY_ARROW_LEFT_COMMAND,
        press("left"),
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        KEY_ARROW_RIGHT_COMMAND,
        press("right"),
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          const selection = $getSelection();
          if (!side || !$isRangeSelection(selection)) return false;
          if (!isSidePoint(selection)) side = null;
          else if (selection.hasFormat("code") !== side.inCode)
            selection.toggleFormat("code");
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        BLUR_COMMAND,
        () => {
          caret.hide();
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read($redraw);
      }),
      caret.dispose,
    );
  }, [editor]);

  return null;
}

/**
 * A caret at an edge of inline code: the code, which edge, and the node the
 * model point is in — the code itself, or the text right before its start.
 */
type CodeEdge = { code: TextNode; edge: "start" | "end"; at: TextNode };

const isCode = (node: TextNode) =>
  node.isSimpleText() && node.hasFormat("code");
const isPlain = (node: TextNode) =>
  node.isSimpleText() && !node.hasFormat("code");

function $codeEdgeAt(selection: RangeSelection): CodeEdge | null {
  const { anchor } = selection;
  const node = anchor.getNode();
  if (anchor.type !== "text" || !$isTextNode(node)) return null;
  const size = node.getTextContentSize();
  if (isCode(node)) {
    if (anchor.offset === size) return { code: node, edge: "end", at: node };
    if (anchor.offset === 0) return { code: node, edge: "start", at: node };
    return null;
  }
  // Text, then code: the text's end is the code's start.
  const next = node.getNextSibling();
  if (
    isPlain(node) &&
    anchor.offset === size &&
    $isTextNode(next) &&
    isCode(next)
  ) {
    return { code: next, edge: "start", at: node };
  }
  return null;
}

/**
 * The caret one character into a text node, from its boundary with the
 * text before it, one of the two code and the other not.
 */
function $oneCharacterAfterBoundary(selection: RangeSelection) {
  const { anchor } = selection;
  const after = anchor.getNode();
  if (anchor.type !== "text" || !$isTextNode(after)) return null;
  const before = after.getPreviousSibling();
  if (!$isTextNode(before)) return null;
  const pair =
    (isCode(before) && isPlain(after)) || (isPlain(before) && isCode(after));
  if (!pair) return null;
  if (!isOneCharacter(after.getTextContent().slice(0, anchor.offset)))
    return null;
  return { before, after };
}

const segmenter = new Intl.Segmenter();
const isOneCharacter = (text: string) => {
  const [first, second] = segmenter.segment(text);
  return first !== undefined && second === undefined;
};

/**
 * The editor's own caret, drawn where the browser would not: a blinking bar
 * over the page, with the native caret hidden meanwhile.
 */
function createDrawnCaret(editor: LexicalEditor) {
  let bar: HTMLElement | null = null;
  let place: (() => void) | null = null;

  const hide = () => {
    bar?.remove();
    bar = null;
    place = null;
    const root = editor.getRootElement();
    if (root) root.style.caretColor = "";
  };

  const show = (edge: CodeEdge, inCode: boolean) => {
    const root = editor.getRootElement();
    const codeElement = editor.getElementByKey(edge.code.getKey());
    const text = codeElement ? getDOMTextNode(codeElement) : null;
    if (!root || !codeElement || !text?.textContent) {
      hide();
      return;
    }
    const doc = root.ownerDocument;
    const element = (bar ??= doc.createElement("div"));
    element.className = "EditorTheme__drawnCaret";
    element.dataset.editorCaret = "";
    if (!element.isConnected) doc.body.append(element);
    root.style.caretColor = "transparent";

    place = () => {
      const length = text.textContent?.length ?? 0;
      if (length === 0) return;
      const atStart = edge.edge === "start";
      // The code's edge character: the line the caret is on, its height.
      const range = doc.createRange();
      range.setStart(text, atStart ? 0 : length - 1);
      range.setEnd(text, atStart ? 1 : length);
      const glyphs = range.getClientRects();
      const boxes = codeElement.getClientRects();
      const glyph = atStart ? glyphs[0] : glyphs[glyphs.length - 1];
      const box = atStart ? boxes[0] : boxes[boxes.length - 1];
      if (!glyph || !box) return;
      const inside = atStart ? glyph.left : glyph.right;
      const outside = atStart ? box.left : box.right;
      element.style.left = `${inCode ? inside : outside}px`;
      element.style.top = `${glyph.top}px`;
      element.style.height = `${glyph.height}px`;
      element.style.backgroundColor = getComputedStyle(
        inCode
          ? (text.parentElement ?? codeElement)
          : (codeElement.parentElement ?? root),
      ).color;
      // Restart the blink: a caret shows the moment it moves.
      element.style.animation = "none";
      void element.offsetWidth;
      element.style.animation = "";
    };
    place();
  };

  const onMove = () => place?.();
  window.addEventListener("scroll", onMove, true);
  window.addEventListener("resize", onMove);

  return {
    show,
    hide,
    dispose: () => {
      hide();
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    },
  };
}
