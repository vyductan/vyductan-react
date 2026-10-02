import type { ElementTransformer } from "@lexical/markdown";
import type { LexicalNode } from "lexical";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from "@lexical/markdown";
import {
  $createTableCellNode,
  $createTableNode,
  $createTableRowNode,
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
  TableCellHeaderStates,
  TableCellNode,
  TableNode,
  TableRowNode,
} from "@lexical/table";
import { $getState, $isParagraphNode, $isTextNode } from "lexical";

import { MARKDOWN_TRANSFORMERS } from "../transformers/markdown-transformers";
import {
  $exportNfmTable,
  nfmTableState,
} from "./markdown-nfm-table-transformer";

// Very primitive table setup
const TABLE_ROW_REG_EXP = /^(?:\|)(.+)(?:\|)\s?$/;
const TABLE_ROW_DIVIDER_REG_EXP = /^(\| ?:?-*:? ?)+\|\s?$/;

export const TABLE: ElementTransformer = {
  dependencies: [TableNode, TableRowNode, TableCellNode],
  export: (node: LexicalNode) => {
    if (!$isTableNode(node)) {
      return null;
    }

    // Read from Notion's <table> markup: written back in it.
    const nfmAttributes = $getState(node, nfmTableState);
    if (nfmAttributes !== null) {
      return $exportNfmTable(node, nfmAttributes);
    }

    const output: string[] = [];

    for (const row of node.getChildren()) {
      const rowOutput = [];
      if (!$isTableRowNode(row)) {
        continue;
      }

      let isHeaderRow = false;
      for (const cell of row.getChildren()) {
        // It's TableCellNode so it's just to make flow happy
        if ($isTableCellNode(cell)) {
          rowOutput.push($exportTableCell(cell));
          if (cell.__headerState === TableCellHeaderStates.ROW) {
            isHeaderRow = true;
          }
        }
      }

      output.push(`| ${rowOutput.join(" | ")} |`);
      if (isHeaderRow) {
        output.push(`| ${rowOutput.map((_) => "---").join(" | ")} |`);
      }
    }

    return output.join("\n");
  },
  regExp: TABLE_ROW_REG_EXP,
  replace: (parentNode, _1, match) => {
    // Header row
    if (TABLE_ROW_DIVIDER_REG_EXP.test(match[0]!)) {
      const table = parentNode.getPreviousSibling();
      if (!table || !$isTableNode(table)) {
        return;
      }

      const rows = table.getChildren();
      const lastRow = rows.at(-1);
      if (!lastRow || !$isTableRowNode(lastRow)) {
        return;
      }

      // Add header state to row cells
      for (const cell of lastRow.getChildren()) {
        if (!$isTableCellNode(cell)) {
          continue;
        }
        cell.setHeaderStyles(
          TableCellHeaderStates.ROW,
          TableCellHeaderStates.ROW,
        );
      }

      // Remove line
      parentNode.remove();
      return;
    }

    const matchCells = mapToTableCells(match[0]!);

    if (matchCells == undefined) {
      return;
    }

    const rows = [matchCells];
    let sibling = parentNode.getPreviousSibling();
    let maxCells = matchCells.length;

    while (sibling) {
      if (!$isParagraphNode(sibling)) {
        break;
      }

      if (sibling.getChildrenSize() !== 1) {
        break;
      }

      const firstChild = sibling.getFirstChild();

      if (!$isTextNode(firstChild)) {
        break;
      }

      const cells = mapToTableCells(firstChild.getTextContent());

      if (cells == undefined) {
        break;
      }

      maxCells = Math.max(maxCells, cells.length);
      rows.unshift(cells);
      const previousSibling = sibling.getPreviousSibling();
      sibling.remove();
      sibling = previousSibling;
    }

    const table = $createTableNode();

    for (const cells of rows) {
      const tableRow = $createTableRowNode();
      table.append(tableRow);

      for (let index = 0; index < maxCells; index++) {
        tableRow.append(
          index < cells.length ? cells[index]! : $createTableCell(""),
        );
      }
    }

    const previousSibling = parentNode.getPreviousSibling();
    if (
      $isTableNode(previousSibling) &&
      getTableColumnsSize(previousSibling) === maxCells
    ) {
      previousSibling.append(...table.getChildren());
      parentNode.remove();
    } else {
      parentNode.replace(table);
    }

    table.selectEnd();
  },
  type: "element",
};

function getTableColumnsSize(table: TableNode) {
  const row = table.getFirstChild();
  return $isTableRowNode(row) ? row.getChildrenSize() : 0;
}

/*
 * GFM has no block content in table cells. The common reading — GitHub, VS
 * Code, AI-written tables — is `<br>` for a line break, and `• a<br>• b` for
 * a list. Cells are written that way and read back the same. The literal
 * `\n` Lexical's playground used is still read, for content saved with it.
 */
const CELL_LINE_BREAK = /<br\s*\/?>|\\n/gi;
const UNESCAPED_PIPE = /(?<!\\)\|/g;
// `- [ ] x` is a check item, not a bullet: keep its `-`.
const CELL_BULLET_EXPORT = /^(\s*)[-*+] (?!\[[ x]\] )/i;
const CELL_BULLET_IMPORT = /^(\s*)• ?/;

export const $exportTableCell = (cell: TableCellNode): string =>
  $convertToMarkdownString(MARKDOWN_TRANSFORMERS, cell)
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) =>
      line
        .trimEnd()
        .replace(CELL_BULLET_EXPORT, "$1• ")
        .replaceAll(UNESCAPED_PIPE, String.raw`\|`),
    )
    .join("<br>");

export const $createTableCell = (textContent: string): TableCellNode => {
  const markdown = textContent
    .trim()
    .replaceAll(String.raw`\|`, "|")
    .split(CELL_LINE_BREAK)
    .map((line) => line.trimEnd().replace(CELL_BULLET_IMPORT, "$1- "))
    .join("\n");
  const cell = $createTableCellNode(TableCellHeaderStates.NO_STATUS);
  $convertFromMarkdownString(markdown, MARKDOWN_TRANSFORMERS, cell);
  return cell;
};

const mapToTableCells = (textContent: string): Array<TableCellNode> | null => {
  const match = TABLE_ROW_REG_EXP.exec(textContent);
  if (!match?.[1]) {
    return null;
  }
  return match[1].split(UNESCAPED_PIPE).map((text) => $createTableCell(text));
};
