import type {
  ElementNode,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  RangeSelection,
} from "lexical";
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isTableCellNode } from "@lexical/table";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  COMMAND_PRIORITY_NORMAL,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  SELECT_ALL_COMMAND,
} from "lexical";

/** The line a node is in: its table cell, or else its nearest block. */
const $blockOf = (node: LexicalNode) =>
  $findMatchingParent(node, $isTableCellNode) ??
  $findMatchingParent(
    node,
    (candidate): candidate is ElementNode =>
      $isElementNode(candidate) && !candidate.isInline(),
  );

/**
 * Cmd+A as Notion does it: the first press selects the line (block) the caret
 * is in — in a table, the cell — the next one the whole page.
 *
 * "Already selected" is the trigger for the second step, so a line whose text
 * is all selected — by the first press or by hand — goes straight to the
 * page, as does an empty line or a selection across blocks.
 */
// The line a triple-click selected last, per editor: Backspace or Delete
// while it is still all selected takes the line away. Written by the click,
// read by the keys — both outside React.
const tripleClicked = new WeakMap<LexicalEditor, NodeKey>();

/** Whether `selection` covers all of `line` and nothing else. */
function $coversLine(selection: RangeSelection, line: ElementNode): boolean {
  const inLine = (node: LexicalNode) => {
    const block = $blockOf(node);
    return block !== null && block.is(line);
  };
  return (
    inLine(selection.anchor.getNode()) &&
    inLine(selection.focus.getNode()) &&
    selection.getTextContent() === line.getTextContent()
  );
}

/**
 * Takes `line` away, the caret to the end of the line above (or, `forward`,
 * the start of the one below). The only line left is emptied instead.
 */
function $removeLine(line: ElementNode, forward: boolean) {
  let node: LexicalNode = line;
  let beside: LexicalNode | null = null;
  while (!$isRootOrShadowRoot(node)) {
    beside = forward ? node.getNextSibling() : node.getPreviousSibling();
    if (beside) break;
    const parent = node.getParent();
    if (!parent) break;
    node = parent;
  }
  if (!beside) {
    line.clear();
    line.select(0, 0);
    return;
  }
  line.remove();
  if ($isElementNode(beside)) {
    if (forward) beside.selectStart();
    else beside.selectEnd();
  } else if (forward) {
    beside.selectPrevious();
  } else {
    beside.selectNext();
  }
}

export function SelectLineFirstPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(
    () =>
      mergeRegister(
        // A triple-click selects its line, and Chrome ends the selection at
        // the start of the next one: Backspace or typing then took that line
        // in too — a to-do below joined the cleared bullet, its checkbox
        // gone. The selection is kept to the line clicked.
        editor.registerCommand(
          CLICK_COMMAND,
          (event) => {
            tripleClicked.delete(editor);
            if (event.detail !== 3) return false;
            const selection = $getSelection();
            if (!$isRangeSelection(selection) || selection.isCollapsed()) {
              return false;
            }
            const [start, end] = selection.isBackward()
              ? [selection.focus, selection.anchor]
              : [selection.anchor, selection.focus];
            const line = $blockOf(start.getNode());
            const next = $blockOf(end.getNode());
            if (!line || !next) return false;
            if (!line.is(next)) {
              const first = next.getFirstDescendant();
              const endNode = end.getNode();
              const atNextStart =
                end.offset === 0 &&
                (endNode.is(next) || (first !== null && endNode.is(first)));
              if (!atNextStart) return false;
              line.select(0, line.getChildrenSize());
            }
            tripleClicked.set(editor, line.getKey());
            return false;
          },
          COMMAND_PRIORITY_LOW,
        ),
        // A line a triple-click selected goes whole with Backspace or Delete,
        // not just its words; selected by hand, its words go as before.
        ...[KEY_BACKSPACE_COMMAND, KEY_DELETE_COMMAND].map((command) =>
          editor.registerCommand(
            command,
            (event) => {
              const key = tripleClicked.get(editor);
              tripleClicked.delete(editor);
              const selection = $getSelection();
              if (key === undefined || !$isRangeSelection(selection)) {
                return false;
              }
              const line = $blockOf(selection.anchor.getNode());
              if (!line || line.getKey() !== key) return false;
              if (!$coversLine(selection, line)) return false;
              event.preventDefault();
              $removeLine(line, command === KEY_DELETE_COMMAND);
              return true;
            },
            COMMAND_PRIORITY_NORMAL,
          ),
        ),
        editor.registerCommand(
          SELECT_ALL_COMMAND,
          () => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return false;

            // In a table cell, the cell: its lines are one block, as in Notion.
            const block = $blockOf(selection.anchor.getNode());
            if (!block || block !== $blockOf(selection.focus.getNode()))
              return false;

            // A cell's lines join with line breaks a selection's text counts
            // differently, so those do not tell the two apart.
            const lines = (value: string) => value.replaceAll(/\n+/g, "\n");
            const text = lines(block.getTextContent());
            if (text === "" || lines(selection.getTextContent()) === text)
              return false;

            block.select(0, block.getChildrenSize());
            return true;
          },
          // Ahead of the rich-text plugin's own select-all, which takes the
          // page, and of @lexical/table's, which took the whole table from a
          // cell at the first press — at the same priority, it ran first.
          COMMAND_PRIORITY_NORMAL,
        ),
      ),
    [editor],
  );

  return null;
}
