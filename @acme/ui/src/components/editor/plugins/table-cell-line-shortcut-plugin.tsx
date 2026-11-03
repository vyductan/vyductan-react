import type { ListType } from "@lexical/list";
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
 * paragraph, and the markdown shortcuts only fire at a paragraph's start, so
 * "- " typed there stayed "- ". Now a marker typed right after a line break
 * in a cell — the caret just past it — makes the rest of that paragraph a
 * list of its own in the cell. A marker already in the text, the caret
 * elsewhere (a file opened, a paste), is left alone.
 */
export function TableCellLineShortcutPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ListNode, ListItemNode])) return;

    return editor.registerNodeTransform(TextNode, (node) => {
      const lineBreak = node.getPreviousSibling();
      const paragraph = node.getParent();
      if (
        !$isLineBreakNode(lineBreak) ||
        !$isParagraphNode(paragraph) ||
        !$isTableCellNode(paragraph.getParent())
      ) {
        return;
      }
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

      // The line and what follows it leave the paragraph for a list item.
      const item = $createListItemNode(
        type === "check" ? /^\[[xX]\]/.test(marker) : undefined,
      );
      const rest = [node, ...node.getNextSiblings()];
      lineBreak.remove();
      item.append(...rest);
      const list = $createListNode(
        type,
        type === "number" ? Number.parseInt(marker, 10) : undefined,
      ).append(item);
      paragraph.insertAfter(list);

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
