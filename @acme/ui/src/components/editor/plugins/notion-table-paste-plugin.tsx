"use client";

import type { LexicalNode } from "lexical";
import type { TableNode } from "@lexical/table";
import { useEffect } from "react";
import { $isLinkNode } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createTableRowNode,
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
} from "@lexical/table";
import { $dfs, mergeRegister } from "@lexical/utils";
import {
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  $isRangeSelection,
  $setSelection,
  PASTE_COMMAND,
  SELECTION_INSERT_CLIPBOARD_NODES_COMMAND,
} from "lexical";

import type { PlainTableRow } from "../utils/notion-plain-table";
import { $createTableCell } from "../transformers/markdown-table-transformer";
import { hasSplitRows, notionPlainTables } from "../utils/notion-plain-table";

/** Notion signs its HTML copy with this comment. */
const NOTION_HTML_MARK = "<!-- notionvc:";

/**
 * Mends what Notion's HTML copy breaks, from its plain-text copy:
 *
 * - A cell of several lines came as a row for each line, the bullets of a
 *   cell's list rows of their own. The plain text keeps each cell whole, so
 *   the table's rows are made again from it: lines in a cell, `•` lines a
 *   list in it, as a cell is read from markdown here.
 * - A file name (`MEMORY.md`) came linked to `http://MEMORY.md`: Notion took
 *   it for a site. Where the plain text has no such address, it is words.
 *
 * Only when each table's rows add up to the lines of the plain one: anything
 * else is a table this does not know, and is left as Notion gave it.
 */
export function NotionTablePastePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // The plain text of a Notion paste on its way in: its nodes reach
    // SELECTION_INSERT_CLIPBOARD_NODES_COMMAND in the same update.
    let pending: string | undefined;

    return mergeRegister(
      editor.registerCommand(
        PASTE_COMMAND,
        (event) => {
          pending = undefined;
          if (!("clipboardData" in event) || !event.clipboardData) return false;
          const html = event.clipboardData.getData("text/html");
          if (!html.includes(NOTION_HTML_MARK)) return false;
          pending = event.clipboardData.getData("text/plain");
          queueMicrotask(() => {
            pending = undefined;
          });
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        SELECTION_INSERT_CLIPBOARD_NODES_COMMAND,
        ({ nodes, selection }) => {
          const plain = pending;
          pending = undefined;
          if (plain === undefined) return false;
          // A cell is read from markdown, which moves the caret into it — a
          // cell not in the document yet — and moves it on this very
          // selection, the one the paste then goes in at. Put it back.
          const at = $isRangeSelection(selection)
            ? {
                anchor: [selection.anchor.key, selection.anchor.offset, selection.anchor.type] as const,
                focus: [selection.focus.key, selection.focus.offset, selection.focus.type] as const,
              }
            : undefined;
          $mendTables(nodes, notionPlainTables(plain));
          if (at && $isRangeSelection(selection)) {
            selection.anchor.set(...at.anchor);
            selection.focus.set(...at.focus);
            $setSelection(selection);
          }
          $unlinkFileNames(nodes, plain);
          // Only mended: the paste goes on as usual.
          return false;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    );
  }, [editor]);

  return null;
}

function $descendants(nodes: LexicalNode[]): LexicalNode[] {
  return nodes.flatMap((node) => $dfs(node).map(({ node: inner }) => inner));
}

function $mendTables(nodes: LexicalNode[], tables: PlainTableRow[][]) {
  if (!hasSplitRows(tables)) return;
  const pasted = $descendants(nodes).filter($isTableNode);
  pasted.forEach((table, index) => {
    const rows = tables[index];
    if (rows) $remakeRows(table, rows);
  });
}

function $remakeRows(table: TableNode, rows: PlainTableRow[]) {
  const lines = rows.reduce((sum, row) => sum + row.lines, 0);
  if (table.getChildrenSize() !== lines) return;
  const columns = Math.max(...rows.map((row) => row.cells.length));
  // The header row keeps its header cells.
  const firstRow = table.getFirstChild();
  const headerStates = $isTableRowNode(firstRow)
    ? firstRow
        .getChildren()
        .map((cell) => ($isTableCellNode(cell) ? cell.getHeaderStyles() : 0))
    : [];
  const remade = rows.map((row, rowIndex) => {
    const tableRow = $createTableRowNode();
    for (let column = 0; column < columns; column++) {
      const cell = $createTableCell(row.cells[column] ?? "");
      if (rowIndex === 0) cell.setHeaderStyles(headerStates[column] ?? 0);
      tableRow.append(cell);
    }
    return tableRow;
  });
  for (const child of table.getChildren()) child.remove();
  table.append(...remade);
}

function $unlinkFileNames(nodes: LexicalNode[], plain: string) {
  for (const link of $descendants(nodes).filter($isLinkNode)) {
    const url = link.getURL();
    const words = link.getTextContent();
    if (url !== `http://${words}` || plain.includes(url)) continue;
    for (const child of link.getChildren()) link.insertBefore(child);
    link.remove();
  }
}
