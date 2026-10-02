import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createTableNodeWithDimensions } from "@lexical/table";
import { render, waitFor } from "@testing-library/react";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

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
  document.body.replaceChildren();
  document.body.removeAttribute("style");
});

async function tableThenLine() {
  let editor: LexicalEditor | null = null;
  render(
    <div style={{ position: "fixed", top: 120, left: 120, width: 520 }}>
      <Editor autoFocus={false}>
        <EditorRefPlugin onReady={(next) => (editor = next)} />
      </Editor>
    </div>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  live.update(
    () => {
      const table = $createTableNodeWithDimensions(2, 2, false);
      $getRoot()
        .clear()
        .append(
          table,
          $createParagraphNode().append($createTextNode("Next line")),
        );
    },
    { discrete: true },
  );
  const [table, line] = await waitFor(() => {
    const t = document.querySelector<HTMLElement>(
      '[contenteditable="true"] table',
    );
    const p = [
      ...document.querySelectorAll<HTMLElement>('[contenteditable="true"] p'),
    ].find((node) => node.textContent === "Next line");
    expect(t).not.toBeNull();
    expect(p).toBeDefined();
    return [t!, p!] as const;
  });
  return { table, line };
}

const addRowButton = () =>
  document.querySelector<HTMLElement>('button[title="Click to add a new row"]');

/**
 * The add-row bar sits in a gap of its own below the table. It used to hang
 * 24px into the line below, covering its start — and since hovering that line
 * raised it, the line could not be clicked into where the bar was.
 */
test("the add-row bar does not cover the line below the table", async () => {
  const { table, line } = await tableThenLine();
  const rect = table.getBoundingClientRect();

  await userEvent.hover(table, {
    position: { x: rect.width / 2, y: rect.height - 4 },
  });
  const button = await waitFor(() => {
    const node = addRowButton();
    expect(node).not.toBeNull();
    return node!;
  });

  const bar = button.parentElement!.getBoundingClientRect();
  expect(bar.top).toBeGreaterThanOrEqual(rect.bottom - 1);
  expect(bar.bottom).toBeLessThanOrEqual(line.getBoundingClientRect().top + 1);
});

test("moving from the table onto the line below lowers the add-row bar", async () => {
  const { table, line } = await tableThenLine();
  const tableRect = table.getBoundingClientRect();
  await userEvent.hover(table, {
    position: { x: tableRect.width / 2, y: tableRect.height - 4 },
  });
  await waitFor(() => expect(addRowButton()).not.toBeNull());

  const rect = line.getBoundingClientRect();
  await userEvent.hover(line, { position: { x: 10, y: rect.height / 2 } });
  await new Promise((resolve) => setTimeout(resolve, 200));

  expect(addRowButton()).toBeNull();
});
