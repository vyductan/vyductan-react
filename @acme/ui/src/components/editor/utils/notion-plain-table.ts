/**
 * A table row in Notion's plain-text copy: its cells, each one markdown cell
 * (lines joined with `<br>`, as a cell is written here), and how many lines
 * of the copy it took.
 */
export interface PlainTableRow {
  cells: string[];
  lines: number;
}

const ROW_START = /^\s*\|/;
const SEPARATOR = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;
const UNESCAPED_PIPE = /(?<!\\)\|/;

/**
 * The tables of Notion's plain-text copy, each a list of rows.
 *
 * Notion writes a cell of several lines with the lines as they are, so a row
 * runs on over lines until one ends with `|`. Its HTML copy does worse: each
 * of those lines is a row of its own, the cell's bullets rows too. The plain
 * text is the one that still knows which lines are one cell.
 */
export function notionPlainTables(text: string): PlainTableRow[][] {
  const tables: PlainTableRow[][] = [];
  let table: PlainTableRow[] | undefined;
  let open: string[] | undefined;

  for (const line of text.split(/\r?\n/)) {
    if (open) {
      open.push(line);
    } else if (ROW_START.test(line)) {
      open = [line];
    } else {
      table = undefined;
      continue;
    }
    if (!line.trimEnd().endsWith("|")) continue;
    const row = open;
    open = undefined;
    if (row.length === 1 && SEPARATOR.test(row[0]!)) continue;
    if (!table) tables.push((table = []));
    table.push({ cells: cellsOf(row), lines: row.length });
  }
  return tables;
}

function cellsOf(lines: string[]): string[] {
  const joined = lines.join("\n").trim();
  return joined
    .slice(1, -1)
    .split(UNESCAPED_PIPE)
    .map((cell) =>
      cell
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "")
        .join("<br>"),
    );
}

/** Whether any row of these tables ran over lines: one Notion's HTML split. */
export const hasSplitRows = (tables: PlainTableRow[][]) =>
  tables.some((rows) => rows.some((row) => row.lines > 1));
