import type { ElementNode, LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createTableNodeWithDimensions } from "@lexical/table";
import { cleanup, render, waitFor } from "@testing-library/react";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";

// Runs in the `browser` project: Cmd+A has to be a real key press for the
// browser's own handling to be in play.

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

async function renderEditor() {
  let editor: LexicalEditor | null = null;

  render(
    <Editor autoFocus={false}>
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

const modifier = navigator.platform.startsWith("Mac") ? "Meta" : "Control";
const selectAll = () => userEvent.keyboard(`{${modifier}>}a{/${modifier}}`);
const selected = () => globalThis.getSelection()?.toString() ?? "";

/**
 * Like Notion: Cmd+A first selects the line the caret is on, and only a
 * second Cmd+A selects the whole page.
 */
test("Cmd+A selects the line first, then the whole page", async () => {
  await renderEditor();
  await userEvent.keyboard("first line{Enter}second line");

  await selectAll();
  await waitFor(() => expect(selected()).toBe("second line"));

  await selectAll();
  await waitFor(() => {
    expect(selected()).toContain("first line");
    expect(selected()).toContain("second line");
  });
});

test("Cmd+A on an empty line selects the whole page at once", async () => {
  await renderEditor();
  await userEvent.keyboard("first line{Enter}");

  await selectAll();
  await waitFor(() => expect(selected()).toContain("first line"));
});

/** A page with a table between two lines; cell [1][0] has two lines. */
async function renderTable() {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  (editor as unknown as LexicalEditor).update(
    () => {
      const table = $createTableNodeWithDimensions(2, 2, false);
      const cells = table
        .getChildren<ElementNode>()
        .flatMap((row) => row.getChildren<ElementNode>());
      const texts = [["A1"], ["B1"], ["A2 one", "A2 two"], ["B2"]];
      cells.forEach((cell, index) => {
        cell.clear();
        for (const line of texts[index]!) {
          cell.append($createParagraphNode().append($createTextNode(line)));
        }
      });
      $getRoot()
        .clear()
        .append(
          $createParagraphNode().append($createTextNode("before")),
          table,
          $createParagraphNode().append($createTextNode("after")),
        );
    },
    { discrete: true },
  );
  const cell = await waitFor(() => {
    const node = [...document.querySelectorAll<HTMLElement>("td")].find(
      (td) => td.textContent === "B1",
    );
    expect(node).toBeDefined();
    return node!;
  });
  return { cell };
}

/**
 * In a table cell, as for a line: the first Cmd+A selects what is in the
 * cell, the next the whole page.
 */
test("Cmd+A in a table cell selects the cell's text first, then the page", async () => {
  const { cell } = await renderTable();
  await userEvent.click(cell);

  await selectAll();
  await waitFor(() => expect(selected()).toBe("B1"));

  await selectAll();
  await waitFor(() => {
    expect(selected()).toContain("before");
    expect(selected()).toContain("after");
  });
});

/** Every line of the cell, not only the one the caret is on. */
test("Cmd+A in a cell of several lines selects all of them", async () => {
  await renderTable();
  const cell = [...document.querySelectorAll<HTMLElement>("td")].find((td) =>
    td.textContent?.startsWith("A2 one"),
  )!;
  await userEvent.click(cell.querySelector("p")!);

  await selectAll();
  await waitFor(() => {
    expect(selected()).toContain("A2 one");
    expect(selected()).toContain("A2 two");
    expect(selected()).not.toContain("B2");
  });

  await selectAll();
  await waitFor(() => {
    expect(selected()).toContain("before");
    expect(selected()).toContain("after");
  });
});
