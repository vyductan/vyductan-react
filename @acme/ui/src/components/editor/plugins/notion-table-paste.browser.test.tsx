import type { LexicalEditor, LexicalNode } from "lexical";
import * as React from "react";
import { $isLinkNode } from "@lexical/link";
import { $isListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isTableNode } from "@lexical/table";
import { $dfs } from "@lexical/utils";
import { cleanup, render, waitFor } from "@testing-library/react";
import { $getRoot, $isElementNode } from "lexical";
import { afterEach, expect, test } from "vitest";

import { Editor } from "../editor";

Object.assign(globalThis, { React });

function EditorRefPlugin({
  onReady,
}: {
  onReady: (editor: LexicalEditor) => void;
}) {
  const [editor] = useLexicalComposerContext();
  React.useEffect(() => {
    onReady(editor);
  }, [editor, onReady]);
  return null;
}

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

/*
 * A table copied from Notion (2026-11-19). Its HTML has a row for each line
 * of a cell — the bullets of a cell's list rows of their own — and links on
 * file names Notion took for sites. The plain text keeps the cells whole.
 */
const NOTION_HTML = "<meta charset='utf-8'><p><strong>Các việc cần làm</strong></p>\n<table>\n<thead>\n<tr>\n<th></th>\n<th></th>\n<th></th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>Dọn dẹp AGENTS/CLAUDE.md</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td><a href=\"http://MEMORY.md\">MEMORY.md</a></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Tái cấu trúc các thư mục</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>• source code</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>• configuration files</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>• testing (test suites)</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>• assets</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>• documents</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>• adr, scratch,...</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Chỉ AI agent nơi lấy ngữ cảnh</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Tìm hiểu claude agent team</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Viết những thứ còn thiếu xót</td>\n<td>business</td>\n<td></td>\n</tr>\n<tr>\n<td>hiệu năng</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>bảo mật</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>bugs do người dùng báo về</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>verify agents</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>test, fuzz test (kiểu click lung tung, cố dùng thử như người thật), tìm bugs trong implementation code, cố tìm ra các vấn đề rồi tự sửa luôn, lặp lại quy trình đó cho đến khi PR sẵn sàng để merge</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Recall lại quá trình làm trước đây để tìm những thiếu xót</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Xây dựng một quy trình để làm 1 new feature</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Chẳng hạn phân bổ thời gian 70% for spec, 10% for execute code, 20% for testing, document</td>\n<td></td>\n<td></td>\n</tr>\n</tbody>\n</table>\n<ul>\n<li>Mattpocock không xem lại <a href=\"http://spec.md\">spec.md</a> mà AI tạo ra</li>\n</ul>\n<!-- notionvc: 2bc80f1c-a032-4a1b-8213-8fbc37ce6fc3 -->";
const NOTION_TEXT = "**Các việc cần làm**\n\n|  |  |  |\n| --- | --- | --- |\n| Dọn dẹp AGENTS/CLAUDE.md\nMEMORY.md |  |  |\n| Tái cấu trúc các thư mục\n  • source code\n  • configuration files\n  • testing (test suites)\n  • assets\n  • documents\n  • adr, scratch,... |  |  |\n| Chỉ AI agent nơi lấy ngữ cảnh |  |  |\n| Tìm hiểu claude agent team |  |  |\n| Viết những thứ còn thiếu xót | business\nhiệu năng\nbảo mật\nbugs do người dùng báo về\nverify agents\ntest, fuzz test (kiểu click lung tung, cố dùng thử như người thật), tìm bugs trong implementation code, cố tìm ra các vấn đề rồi tự sửa luôn, lặp lại quy trình đó cho đến khi PR sẵn sàng để merge |  |\n| Recall lại quá trình làm trước đây để tìm những thiếu xót |  |  |\n| Xây dựng một quy trình để làm 1 new feature\nChẳng hạn phân bổ thời gian 70% for spec, 10% for execute code, 20% for testing, document |  |  |\n\n- Mattpocock không xem lại spec.md mà AI tạo ra";

async function paste() {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  const root = document.querySelector<HTMLElement>('[contenteditable="true"]')!;
  root.focus();
  live.update(() => $getRoot().selectEnd(), { discrete: true });
  const clipboardData = new DataTransfer();
  clipboardData.setData("text/html", NOTION_HTML);
  clipboardData.setData("text/plain", NOTION_TEXT);
  root.dispatchEvent(
    new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData }),
  );
  return live;
}

/** The table's rows, each cell's lines (blocks or line breaks) joined by " / ". */
function $rows(): string[][] {
  const table = $getRoot().getChildren().find($isTableNode);
  if (!table) return [];
  const lines = (node: LexicalNode): string[] =>
    $isElementNode(node) && !node.isInline() && node.getChildren().some(
      (child) => $isElementNode(child) && !child.isInline(),
    )
      ? node.getChildren().flatMap(lines)
      : [node.getTextContent()];
  return table.getChildren().map((row) =>
    $isElementNode(row)
      ? row.getChildren().map((cell) =>
          $isElementNode(cell)
            ? cell.getChildren().flatMap(lines).join("\n").replaceAll("\n", " / ")
            : "",
        )
      : [],
  );
}

test("a table from Notion keeps its cells of several lines as one row each", async () => {
  const live = await paste();
  await waitFor(() =>
    expect(live.getEditorState().read($rows)).toStrictEqual([
      ["", "", ""],
      ["Dọn dẹp AGENTS/CLAUDE.md / MEMORY.md", "", ""],
      [
        "Tái cấu trúc các thư mục / source code / configuration files / testing (test suites) / assets / documents / adr, scratch,...",
        "",
        "",
      ],
      ["Chỉ AI agent nơi lấy ngữ cảnh", "", ""],
      ["Tìm hiểu claude agent team", "", ""],
      [
        "Viết những thứ còn thiếu xót",
        "business / hiệu năng / bảo mật / bugs do người dùng báo về / verify agents / test, fuzz test (kiểu click lung tung, cố dùng thử như người thật), tìm bugs trong implementation code, cố tìm ra các vấn đề rồi tự sửa luôn, lặp lại quy trình đó cho đến khi PR sẵn sàng để merge",
        "",
      ],
      ["Recall lại quá trình làm trước đây để tìm những thiếu xót", "", ""],
      [
        "Xây dựng một quy trình để làm 1 new feature / Chẳng hạn phân bổ thời gian 70% for spec, 10% for execute code, 20% for testing, document",
        "",
        "",
      ],
    ]),
  );
});

test("a cell's bullets from Notion are a list in the cell", async () => {
  const live = await paste();
  await waitFor(() =>
    expect(
      live.getEditorState().read(() => {
        const table = $getRoot().getChildren().find($isTableNode);
        const list = table ? $dfs(table).map(({ node }) => node).find($isListNode) : undefined;
        return list?.getChildren().map((item) => item.getTextContent());
      }),
    ).toStrictEqual([
      "source code",
      "configuration files",
      "testing (test suites)",
      "assets",
      "documents",
      "adr, scratch,...",
    ]),
  );
});

test("a file name Notion linked as a site is plain words again", async () => {
  const live = await paste();
  await waitFor(() =>
    expect(live.getEditorState().read(() => $dfs().length)).toBeGreaterThan(5),
  );
  expect(
    live.getEditorState().read(() =>
      $dfs()
        .map(({ node }) => node)
        .filter($isLinkNode)
        .map((link) => link.getURL()),
    ),
  ).toStrictEqual([]);
});
