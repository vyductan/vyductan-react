import type { ListItemNode } from "@lexical/list";
import type { ElementTransformer } from "@lexical/markdown";
import type { LexicalNode } from "lexical";
import { $createListItemNode, $isListItemNode } from "@lexical/list";
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
import { $dfs } from "@lexical/utils";
import {
  $getState,
  $isLineBreakNode,
  $isParagraphNode,
  $isTabNode,
  $isTextNode,
  $setState,
} from "lexical";

import { unmarkedState } from "../utils/list-marker";
import {
  $exportNfmTable,
  nfmTableState,
} from "./markdown-nfm-table-transformer";
import { getMarkdownTransformers } from "./markdown-transformer-registry";

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
/*
 * A nested item's indent is written as `&nbsp;&nbsp;` a level. A tab or
 * spaces there did not last: Prettier, formatting on save, folds the
 * whitespace inside a cell to one space, and the list came back flat.
 */
const CELL_INDENT_EXPORT = /^\t+/;
const CELL_INDENT_IMPORT = /^(?:&nbsp;|\u00A0)+/;
const NBSP_LEVEL = "&nbsp;&nbsp;";
const CELL_ALIGN_EXPORT = /^(\t*) +/;

export const $exportTableCell = (cell: TableCellNode): string =>
  $convertToMarkdownString(getMarkdownTransformers(), cell)
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) =>
      line
        .trimEnd()
        // An unmarked item is lined up with the words above by spaces;
        // in a cell its line starts at its depth, as any other.
        .replace(CELL_ALIGN_EXPORT, "$1")
        .replace(CELL_BULLET_EXPORT, "$1• ")
        .replace(CELL_INDENT_EXPORT, (tabs) => NBSP_LEVEL.repeat(tabs.length))
        .replaceAll(UNESCAPED_PIPE, String.raw`\|`),
    )
    .join("<br>");

export const $createTableCell = (textContent: string): TableCellNode => {
  const markdown = textContent
    .trim()
    .replaceAll(String.raw`\|`, "|")
    .split(CELL_LINE_BREAK)
    .map((line) =>
      line
        .trimEnd()
        .replace(CELL_INDENT_IMPORT, (indent) =>
          "\t".repeat(Math.ceil(indent.replaceAll("&nbsp;", " ").length / 2)),
        )
        .replace(CELL_BULLET_IMPORT, "$1- "),
    )
    .join("\n");
  const cell = $createTableCellNode(TableCellHeaderStates.NO_STATUS);
  $convertFromMarkdownString(markdown, getMarkdownTransformers(), cell);
  $unmarkLinesUnderItems(cell);
  return cell;
};

/**
 * A line with no bullet under an item in a cell is an item whose bullet
 * was taken off, as it was written. Markdown reads it into the item above,
 * after a line break: it comes out again as a line of its own, unmarked.
 */
function $unmarkLinesUnderItems(cell: TableCellNode) {
  for (const { node } of $dfs(cell)) {
    if (!$isListItemNode(node)) continue;
    let item: ListItemNode = node;
    for (const child of node.getChildren()) {
      if (!$isLineBreakNode(child)) {
        if (!item.is(node)) item.append(child);
        continue;
      }
      child.remove();
      const line = $createListItemNode();
      $setState(line, unmarkedState, true);
      item.insertAfter(line);
      item = line;
    }
    if (item.is(node)) continue;
    // Its depth was written before it as tabs; the item above holds it.
    for (const lead of item.getChildren()) {
      if ($isTabNode(lead)) lead.remove();
      else if ($isTextNode(lead)) {
        lead.setTextContent(lead.getTextContent().trimStart());
        break;
      } else break;
    }
  }
}

const mapToTableCells = (textContent: string): Array<TableCellNode> | null => {
  const match = TABLE_ROW_REG_EXP.exec(textContent);
  if (!match?.[1]) {
    return null;
  }
  return match[1].split(UNESCAPED_PIPE).map((text) => $createTableCell(text));
};
