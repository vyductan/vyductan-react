import { describe, expect, test } from "vitest";

import { hasSplitRows, notionPlainTables } from "./notion-plain-table";

// As Notion puts a table on the clipboard as plain text (2026-11-19).
const COPY = [
  "**Các việc cần làm**",
  "",
  "|  |  |  |",
  "| --- | --- | --- |",
  "| Dọn dẹp AGENTS/CLAUDE.md",
  "MEMORY.md |  |  |",
  "| Tái cấu trúc các thư mục",
  "  • source code",
  "  • assets |  |  |",
  "| Chỉ AI agent nơi lấy ngữ cảnh |  |  |",
  "| Viết những thứ còn thiếu xót | business",
  "hiệu năng",
  "bảo mật |  |",
  "",
  "**Nov 18, 2026**",
].join("\n");

describe("notionPlainTables", () => {
  test("a row runs on over lines until one ends with a pipe", () => {
    const [table] = notionPlainTables(COPY);
    expect(table!.map((row) => [row.cells, row.lines])).toStrictEqual([
      [["", "", ""], 1],
      [["Dọn dẹp AGENTS/CLAUDE.md<br>MEMORY.md", "", ""], 2],
      [["Tái cấu trúc các thư mục<br>• source code<br>• assets", "", ""], 3],
      [["Chỉ AI agent nơi lấy ngữ cảnh", "", ""], 1],
      [["Viết những thứ còn thiếu xót", "business<br>hiệu năng<br>bảo mật", ""], 3],
    ]);
  });

  test("an escaped pipe stays in its cell", () => {
    const [table] = notionPlainTables("| a \\| b | c |");
    expect(table![0]!.cells).toStrictEqual(["a \\| b", "c"]);
  });

  test("tables apart are apart", () => {
    const tables = notionPlainTables("| a |\n\ntext\n\n| b |\n| c |");
    expect(tables.map((rows) => rows.length)).toStrictEqual([1, 2]);
  });

  test("only rows over several lines are ones Notion's HTML split", () => {
    expect(hasSplitRows(notionPlainTables(COPY))).toBe(true);
    expect(hasSplitRows(notionPlainTables("| a | b |\n| c | d |"))).toBe(false);
  });
});
