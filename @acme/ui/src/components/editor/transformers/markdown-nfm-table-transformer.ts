import type { MultilineElementTransformer } from "@lexical/markdown";
import type { TableNode } from "@lexical/table";
import {
  $createTableNode,
  $createTableRowNode,
  $isTableCellNode,
  $isTableRowNode,
  TableCellHeaderStates,
  TableCellNode,
  TableNode as TableNodeClass,
  TableRowNode,
} from "@lexical/table";
import { $setState, createState } from "lexical";

import {
  $createTableCell,
  $exportTableCell,
} from "./markdown-table-transformer";

/*
 * Notion's own table markup, as its markdown API writes it:
 * https://developers.notion.com/guides/data-apis/enhanced-markdown
 *
 *   <table fit-page-width="true" header-row="true">
 *   	<tr>
 *   		<td>Cell</td>
 *   	</tr>
 *   </table>
 *
 * A plain one — just rows and cells — is read into an ordinary TableNode, so
 * it can be edited, and marked with nfmTableState so the TABLE transformer
 * writes it back in this form instead of as pipes. The state holds the
 * <table> tag's attributes as Notion wrote them; an unchanged table comes out
 * byte for byte. Anything more — colors on cells, rows or columns, a
 * <colgroup> — has nowhere to live in a TableNode, so such a table is left to
 * NFM_RAW_BLOCK and kept as a read-only chip.
 */

/** The `<table>` tag's attributes as read (e.g. ` header-row="true"`); null for a pipe table. */
export const nfmTableState = createState("nfmTable", {
  parse: (value) => (typeof value === "string" ? value : null),
});

const TABLE_OPEN = /^<table((?:\s+[\w-]+="[^"]*")*)>$/;
const ROW_OPEN = /^\t<tr>$/;
const CELL = /^\t\t<td>(.*)<\/td>$/;
const ROW_CLOSE = /^\t<\/tr>$/;
const TABLE_CLOSE = /^<\/table>$/;

const flag = (attributes: string, name: string) =>
  new RegExp(String.raw`\b${name}="true"`).test(attributes);

/** The cells of each row, or null when the table is more than rows of cells. */
function readRows(lines: string[]): string[][] | null {
  const rows: string[][] = [];
  let row: string[] | undefined;
  for (const line of lines) {
    const cell = CELL.exec(line);
    if (ROW_OPEN.test(line) && !row) row = [];
    else if (cell && row) row.push(cell[1]!);
    else if (ROW_CLOSE.test(line) && row) {
      rows.push(row);
      row = undefined;
    } else return null;
  }
  if (row || rows.length === 0) return null;
  const width = rows[0]!.length;
  return width > 0 && rows.every((cells) => cells.length === width)
    ? rows
    : null;
}

export const NFM_TABLE: MultilineElementTransformer = {
  dependencies: [TableNodeClass, TableRowNode, TableCellNode],
  // Written by TABLE, which sees the state: see $exportNfmTable.
  export: () => null,
  handleImportAfterStartMatch: ({
    lines,
    rootNode,
    startLineIndex,
    startMatch,
  }) => {
    let end = startLineIndex + 1;
    while (end < lines.length && !TABLE_CLOSE.test(lines[end]!)) end++;
    if (end === lines.length) return null;

    const rows = readRows(lines.slice(startLineIndex + 1, end));
    // Not a plain table: NFM_RAW_BLOCK keeps it as it is.
    if (!rows) return null;

    const attributes = startMatch[1] ?? "";
    const headerRow = flag(attributes, "header-row");
    const headerColumn = flag(attributes, "header-column");

    const table = $createTableNode();
    rows.forEach((cells, rowIndex) => {
      const row = $createTableRowNode();
      cells.forEach((content, columnIndex) => {
        const cell = $createTableCell(content);
        cell.setHeaderStyles(
          (headerRow && rowIndex === 0 ? TableCellHeaderStates.ROW : 0) |
            (headerColumn && columnIndex === 0
              ? TableCellHeaderStates.COLUMN
              : 0),
          TableCellHeaderStates.BOTH,
        );
        row.append(cell);
      });
      table.append(row);
    });
    $setState(table, nfmTableState, attributes);

    rootNode.append(table);
    return [true, end];
  },
  regExpStart: TABLE_OPEN,
  replace: () => false,
  type: "multiline-element",
};

/** Set `name` to `value` in an attribute list, adding it when missing. */
function withAttribute(attributes: string, name: string, value: boolean) {
  const existing = new RegExp(String.raw`(\b${name}=")[^"]*(")`);
  if (existing.test(attributes)) {
    return attributes.replace(existing, `$1${value}$2`);
  }
  return value ? `${attributes} ${name}="true"` : attributes;
}

/** A table read from Notion's markup, written back in it. */
export function $exportNfmTable(node: TableNode, attributes: string): string {
  const rows = node.getChildren().filter($isTableRowNode);
  const cellsOf = (row: TableRowNode) =>
    row.getChildren().filter($isTableCellNode);

  // The header the table has now, which may not be the one it was read with.
  const headerRow =
    rows.length > 0 &&
    cellsOf(rows[0]!).every((cell) =>
      cell.hasHeaderState(TableCellHeaderStates.ROW),
    );
  const headerColumn =
    rows.length > 0 &&
    rows.every((row) =>
      cellsOf(row)[0]?.hasHeaderState(TableCellHeaderStates.COLUMN),
    );
  let tag = attributes;
  if (flag(tag, "header-row") !== headerRow) {
    tag = withAttribute(tag, "header-row", headerRow);
  }
  if (flag(tag, "header-column") !== headerColumn) {
    tag = withAttribute(tag, "header-column", headerColumn);
  }

  return [
    `<table${tag}>`,
    ...rows.flatMap((row) => [
      "\t<tr>",
      ...cellsOf(row).map((cell) => `\t\t<td>${$exportTableCell(cell)}</td>`),
      "\t</tr>",
    ]),
    "</table>",
  ].join("\n");
}
