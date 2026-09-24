import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isTableNode } from "@lexical/table";
import { render, waitFor } from "@testing-library/react";
import { $createParagraphNode, $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";

import { Editor } from "./editor";

// Column widths only exist with real layout, which jsdom does not have.

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

afterEach(() => document.body.replaceChildren());

const PASTED_TABLE = [
  "## Khả năng hỗ trợ và hạn chế",
  "",
  "| Tiêu chí | Chi tiết |",
  "| --- | --- |",
  "| **Dịch vụ hỗ trợ** | Gmail, Google Workspace, Outlook/Hotmail, iCloud Mail, Proton Mail, Fastmail và nhiều dịch vụ khác |",
  "",
].join("\n");

async function pasteTable() {
  let editor: LexicalEditor | null = null;

  render(
    <div style={{ width: 380 }}>
      <Editor autoFocus={false}>
        <EditorRefPlugin onReady={(next) => (editor = next)} />
      </Editor>
    </div>,
  );

  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;

  live.update(() => {
    const root = $getRoot();
    root.clear();
    const paragraph = $createParagraphNode();
    root.append(paragraph);
    paragraph.select();
  });

  const contentEditable = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });

  const clipboardData = new DataTransfer();
  clipboardData.setData("text/plain", PASTED_TABLE);
  contentEditable.dispatchEvent(
    new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData,
    }),
  );

  const table = await waitFor(() => {
    const node = document.querySelector<HTMLTableElement>(
      '[contenteditable="true"] table',
    );
    expect(node).not.toBeNull();
    return node!;
  });

  return { live, table };
}

const columnWidths = (table: HTMLTableElement) =>
  [...(table.rows[0]?.cells ?? [])].map(
    (cell) => cell.getBoundingClientRect().width,
  );

/**
 * A pasted table has no widths of its own yet, so its content decides them. It
 * used to get a fixed 96px per column whatever it held, which broke a list of
 * mail providers onto one word per line beside a nearly empty first column.
 */
test("sizes a pasted table's columns by what they hold", async () => {
  const { table } = await pasteTable();

  const [first, second] = columnWidths(table);

  expect(first).toBeGreaterThan(0);
  expect(second!).toBeGreaterThan(first! * 1.5);
});

test("keeps the table within the width it has to fit in", async () => {
  const { table } = await pasteTable();

  const container = table.closest<HTMLElement>('[contenteditable="true"]');
  expect(table.getBoundingClientRect().width).toBeLessThanOrEqual(
    container!.getBoundingClientRect().width + 1,
  );
});

/**
 * Once someone has dragged a column, the widths are theirs and the content no
 * longer gets a say.
 */
test("honours widths once a table has them", async () => {
  const { live, table } = await pasteTable();

  live.update(() => {
    const node = $getRoot()
      .getChildren()
      .find((child) => $isTableNode(child));
    if ($isTableNode(node)) {
      node.setColWidths([180, 90]);
    }
  });

  await waitFor(() => {
    const [first, second] = columnWidths(table);
    expect(Math.round(first!)).toBe(180);
    expect(Math.round(second!)).toBe(90);
  });
});
