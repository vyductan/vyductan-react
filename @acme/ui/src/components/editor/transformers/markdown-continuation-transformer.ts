import type { ListNode } from "@lexical/list";
import type { ElementTransformer } from "@lexical/markdown";
import type { ElementNode, LexicalNode } from "lexical";
import { $isListItemNode, $isListNode } from "@lexical/list";
import {
  $createLineBreakNode,
  $createParagraphNode,
  $isElementNode,
  $isParagraphNode,
  $isTextNode,
} from "lexical";

import { $isUnmarkedItem } from "../utils/list-marker";
import { $importedTodoIndent } from "./markdown-nfm-raw-transformer";

/*
 * Words under a list item or a to-do with no marker of their own — what
 * Backspace at the start of an item leaves (an unmarked item; for a to-do
 * read from markdown, a paragraph at its indent). Written as markdown
 * writes them: a line under the item, indented, no marker. Written as an
 * item, the marker came back on the next load.
 */

type ExportChildren = (node: ElementNode) => string;

/**
 * What an empty one writes: nothing — Lexical drops empty lines read from
 * markdown, so it could not come back, and a line of its own split the list.
 * `$convertToMarkdownDocument` takes it out, line and all.
 */
export const EMPTY_CONTINUATION = "\uE002";

const hasUnmarkedItem = (list: ListNode): boolean =>
  list
    .getChildren()
    .some(
      (child) =>
        $isUnmarkedItem(child) ||
        ($isListItemNode(child) &&
          child
            .getChildren()
            .some((node) => $isListNode(node) && hasUnmarkedItem(node))),
    );

/**
 * Lexical's list export, with unmarked items written as indented lines and
 * left out of the count. Null when there are none — Lexical's own stands.
 *
 * In a checklist the line is indented by its depth, as text under the
 * to-do above reads back (see CONTINUATION). In a bullet or numbered list
 * it lines up with the words of the item above, and reads back as part of
 * that item.
 */
export function $exportListWithUnmarked(
  list: ListNode,
  exportChildren: ExportChildren,
): string | null {
  if (!hasUnmarkedItem(list)) return null;
  const lines: string[] = [];
  const walk = (node: ListNode, depth: number) => {
    const indent = "\t".repeat(depth);
    const type = node.getListType();
    // `*` or `+` when the list was read from markdown so: Lexical keeps it.
    const marker =
      (node.exportJSON() as { $?: { mdListMarker?: string } }).$
        ?.mdListMarker ?? "-";
    let number = node.getStart();
    let width = 2;
    for (const item of node.getChildren()) {
      if (!$isListItemNode(item)) continue;
      const first = item.getFirstChild();
      if (item.getChildrenSize() === 1 && $isListNode(first)) {
        walk(first, depth + 1);
        continue;
      }
      if ($isUnmarkedItem(item)) {
        const words = exportChildren(item);
        const align = type === "check" ? "" : " ".repeat(width);
        if (words) lines.push(indent + align + words);
        continue;
      }
      const prefix =
        type === "number"
          ? `${number++}. `
          : type === "check"
            ? `${marker} [${item.getChecked() ? "x" : " "}] `
            : `${marker} `;
      width = prefix.length;
      let words = exportChildren(item);
      // As Lexical: words that would read as a number are not one.
      if (type !== "number")
        words = words.replace(/^(\s{0,3}\d+)(\.\s)/, "$1\\$2");
      lines.push(indent + prefix + words);
    }
  };
  walk(list, 0);
  return lines.join("\n");
}

/** Whether `node` is words under the to-do above, by the rules above. */
export function $isTodoContinuation(node: LexicalNode | null): boolean {
  if (!$isParagraphNode(node) || node.getIndent() === 0) return false;
  let above = node.getPreviousSibling();
  while ($isParagraphNode(above) && above.getIndent() > 0) {
    above = above.getPreviousSibling();
  }
  return above?.getType() === "check-block";
}

/** The to-do (or words under one) just above `node`, blank lines between not counting. */
function $todoContext(node: LexicalNode): boolean {
  let above = node.getPreviousSibling();
  while ($isParagraphNode(above) && above.getTextContentSize() === 0) {
    above = above.getPreviousSibling();
  }
  return (
    above?.getType() === "check-block" ||
    ($isParagraphNode(above) && $isTodoContinuation(above))
  );
}

/**
 * Words under a to-do ⇄ an indented line below it.
 *
 * Out: a paragraph indented under a to-do is written `\t` per level, so it
 * reads back under the to-do whose words it reaches. Format on save lines it
 * up with those words; it reads back the same.
 *
 * In: a line below a to-do, no marker, takes the indent of the to-do whose
 * words it reaches, plus one — at the margin, none; the rest of the line is
 * its words.
 */
export const CONTINUATION: ElementTransformer = {
  dependencies: [],
  export: (node, traverseChildren) => {
    if (!$isTodoContinuation(node) || !$isParagraphNode(node)) return null;
    const words = traverseChildren(node);
    return words ? "\t".repeat(node.getIndent()) + words : EMPTY_CONTINUATION;
  },
  // Nothing is consumed: replace takes the indent off itself, when it is
  // words under a to-do. A list marker is a list item's, not words.
  regExp: /^(?=([ \t]*)(?![-*+] |\d+[.)] )\S)/,
  replace: (parentNode, children, match) => {
    // The line after a to-do's line that ends in a backslash — markdown's
    // line break — is that to-do's own next line (Shift+Enter).
    const above = parentNode.getPreviousSibling();
    const end = $isElementNode(above) ? above.getLastDescendant() : null;
    if (
      above?.getType() === "check-block" &&
      $isTextNode(end) &&
      end.getTextContent().endsWith("\\")
    ) {
      end.setTextContent(end.getTextContent().slice(0, -1));
      if (end.getTextContentSize() === 0) end.remove();
      (above as ElementNode).append($createLineBreakNode(), ...children);
      parentNode.remove();
      return;
    }
    if (!$todoContext(parentNode)) return false;
    const leading = match[1] ?? "";
    const first = children[0];
    if ($isTextNode(first)) {
      first.setTextContent(first.getTextContent().slice(leading.length));
    }
    // A paragraph of its own: the one Lexical made, still in place, would
    // take the next line's words into it.
    const line = $createParagraphNode().setIndent(
      leading
        ? $importedTodoIndent(parentNode.getPreviousSibling(), leading)
        : 0,
    );
    line.append(...children);
    parentNode.replace(line);
  },
  type: "element",
};
