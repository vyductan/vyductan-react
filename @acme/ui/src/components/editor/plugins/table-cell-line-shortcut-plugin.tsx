import type { ListType } from "@lexical/list";
import type { LexicalNode } from "lexical";
import { useEffect } from "react";
import {
  $createListItemNode,
  $createListNode,
  ListItemNode,
  ListNode,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isTableCellNode } from "@lexical/table";
import {
  $createParagraphNode,
  $getSelection,
  $isLineBreakNode,
  $isParagraphNode,
  $isRangeSelection,
  TextNode,
} from "lexical";

/** A list's marker at a line's start, with the space that ends it. */
const MARKERS: [RegExp, ListType][] = [
  [/^\[[ xX]?\] /, "check"],
  [/^[-*+] /, "bullet"],
  [/^\d{1,9}[.)] /, "number"],
];

/**
 * In a table cell a new line (Shift+Enter) is a line break inside the cell's
 * paragraph, and the markdown shortcuts work on whole paragraphs: "- " typed
 * after a line break stayed "- ", and typed on the first line it took every
 * line under it into the list item too. As in Notion, a marker typed at the
 * start of a line in a cell — the caret just past it — makes that line, and
 * only it, a list in the cell; the lines above and below stay as they were.
 * A marker already in the text, the caret elsewhere (a file opened, a
 * paste), is left alone.
 */
export function TableCellLineShortcutPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ListNode, ListItemNode])) return;

    return editor.registerNodeTransform(TextNode, (node) => {
      const before = node.getPreviousSibling();
      const paragraph = node.getParent();
      if (
        (before !== null && !$isLineBreakNode(before)) ||
        !$isParagraphNode(paragraph) ||
        !$isTableCellNode(paragraph.getParent())
      ) {
        return;
      }
      // The line: from here to the next line break.
      const line: LexicalNode[] = [node];
      let after = node.getNextSibling();
      while (after && !$isLineBreakNode(after)) {
        line.push(after);
        after = after.getNextSibling();
      }
      // A paragraph of one line is the markdown shortcuts' own case.
      if (before === null && after === null) return;
      const text = node.getTextContent();
      const found = MARKERS.map(
        ([pattern, type]) => [pattern.exec(text)?.[0], type] as const,
      ).find(([marker]) => marker !== undefined);
      if (!found) return;
      const [marker, type] = found as [string, ListType];

      const selection = $getSelection();
      if (
        !$isRangeSelection(selection) ||
        !selection.isCollapsed() ||
        selection.anchor.key !== node.getKey() ||
        selection.anchor.offset !== marker.length
      ) {
        return;
      }

      // The line leaves the paragraph for a list item; the lines under it
      // go on in a paragraph of their own under the list.
      const item = $createListItemNode(
        type === "check" ? /^\[[xX]\]/.test(marker) : undefined,
      );
      const below = after ? after.getNextSiblings() : [];
      before?.remove();
      after?.remove();
      item.append(...line);
      const list = $createListNode(
        type,
        type === "number" ? Number.parseInt(marker, 10) : undefined,
      ).append(item);
      paragraph.insertAfter(list);
      if (after) list.insertAfter($createParagraphNode().append(...below));
      if (paragraph.isEmpty()) paragraph.remove();

      const remaining = text.slice(marker.length);
      if (remaining) {
        node.setTextContent(remaining);
        node.select(0, 0);
      } else {
        node.remove();
        item.select(0, 0);
      }
    });
  }, [editor]);

  return null;
}
