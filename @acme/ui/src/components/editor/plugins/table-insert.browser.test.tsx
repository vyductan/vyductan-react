import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";

// Runs in the `browser` project: the slash menu needs real key presses, and
// "typing lands in the first cell" is only proven by real keys.

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

async function renderEditor(variant?: "simple") {
  let editor: LexicalEditor | null = null;

  render(
    <Editor autoFocus={false} variant={variant}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );

  await waitFor(() => expect(editor).not.toBeNull());
  await userEvent.click(
    await waitFor(() => {
      const node = document.querySelector<HTMLElement>(
        '[contenteditable="true"]',
      );
      expect(node).not.toBeNull();
      return node!;
    }),
  );
}

/**
 * Like Notion: inserting a table asks nothing. A 3×3 table goes in, the caret
 * in its first cell; rows and columns are added later from the "+" handles.
 */
async function expectThreeByThreeWithCaretInFirstCell() {
  const table = await waitFor(() => {
    const node = document.querySelector("table");
    expect(node).not.toBeNull();
    return node!;
  });
  expect(document.querySelector('[role="dialog"]')).toBeNull();

  const rows = [...table.querySelectorAll("tr")];
  expect(
    rows.map((row) => row.querySelectorAll("td, th").length),
  ).toStrictEqual([3, 3, 3]);

  // A header row, as GFM requires when the table is saved as markdown; no
  // header column, which markdown cannot hold and a save would drop.
  expect(rows.map((row) => row.querySelector("td, th")?.tagName)).toStrictEqual(
    ["TH", "TD", "TD"],
  );
  expect([...rows[0]!.children].map((cell) => cell.tagName)).toStrictEqual([
    "TH",
    "TH",
    "TH",
  ]);

  // Spread across the width it has, in equal columns, as Notion does —
  // not three narrow columns sized by their (empty) content.
  const container = table.closest<HTMLElement>('[contenteditable="true"]')!;
  const style = getComputedStyle(container);
  const available =
    container.clientWidth -
    Number.parseFloat(style.paddingLeft) -
    Number.parseFloat(style.paddingRight);
  await waitFor(() => {
    const width = table.getBoundingClientRect().width;
    expect(width).toBeGreaterThan(available * 0.95);
    expect(width).toBeLessThanOrEqual(available + 1);
  });
  const widths = [...rows[0]!.children].map((cell) =>
    Math.round(cell.getBoundingClientRect().width),
  );
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1);

  await userEvent.keyboard("hi");
  await waitFor(() =>
    expect(rows[0]?.querySelector("td, th")?.textContent).toBe("hi"),
  );
}

test("'/table' inserts a 3×3 table without asking for its size", async () => {
  await renderEditor();

  await userEvent.keyboard("/table");
  const option = await waitFor(() => {
    const match = [
      ...document.querySelectorAll<HTMLElement>('[role="option"]'),
    ].find((node) => node.textContent?.trim().startsWith("Table"));
    expect(match).toBeDefined();
    return match!;
  });
  await userEvent.click(option);

  await expectThreeByThreeWithCaretInFirstCell();
});

test("the toolbar table button inserts a 3×3 table without asking", async () => {
  await renderEditor("simple");

  await userEvent.click(
    await waitFor(() => {
      const button = document.querySelector<HTMLElement>(
        'button[aria-label="Insert Table"]',
      );
      expect(button).not.toBeNull();
      return button!;
    }),
  );

  await expectThreeByThreeWithCaretInFirstCell();
});
