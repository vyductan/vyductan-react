import type { ElementNode, LexicalEditor } from "lexical";
import * as React from "react";
import { $createListItemNode, $createListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createTableNodeWithDimensions } from "@lexical/table";
import { cleanup, render, waitFor } from "@testing-library/react";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
} from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";

// Runs in the `browser` project: Enter has to be a real key press.

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

/**
 * A two-row, one-column table: "top" over "bottom", or `cell` in the top
 * cell. The caret at the end of `at`.
 */
async function table(
  at: string,
  cell: () => ElementNode[] = () => [
    $createParagraphNode().append($createTextNode("top")),
  ],
) {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  await userEvent.click(
    document.querySelector<HTMLElement>('[contenteditable="true"]')!,
  );
  live.update(
    () => {
      const grid = $createTableNodeWithDimensions(2, 1, false);
      const [first, second] = grid
        .getChildren<ElementNode>()
        .map((row) => row.getFirstChildOrThrow<ElementNode>());
      first!.clear().append(...cell());
      second!
        .clear()
        .append($createParagraphNode().append($createTextNode("bottom")));
      $getRoot().clear().append(grid, $createParagraphNode());
      const text = $getRoot()
        .getAllTextNodes()
        .find((node) => node.getTextContent() === at);
      if (text) text.selectEnd();
      else first!.selectStart();
    },
    { discrete: true },
  );
  return live;
}

/** Each cell's lines, top to bottom. */
const cells = () =>
  [...document.querySelectorAll("td, th")].map((td) =>
    [...td.children].map((block) => block.textContent),
  );

const caret = (live: LexicalEditor) =>
  live.getEditorState().read(() => {
    const selection = $getSelection();
    return $isRangeSelection(selection)
      ? `${selection.anchor.getNode().getTextContent()}@${selection.anchor.offset}`
      : null;
  });

/**
 * As in Notion: Enter on a line of words in a table cell goes to the cell
 * below. It started a new line in the cell.
 */
test("Enter on a line in a cell goes to the cell below", async () => {
  const live = await table("top");

  await userEvent.keyboard("{Enter}");

  await waitFor(() => expect(caret(live)).toBe("bottom@6"));
  expect(cells()).toStrictEqual([["top"], ["bottom"]]);
});

/** Shift+Enter is the new line in a cell. */
test("Shift+Enter in a cell starts a new line there", async () => {
  await table("top");

  await userEvent.keyboard("{Shift>}{Enter}{/Shift}x");

  await waitFor(() =>
    expect(document.querySelector("td")?.innerText).toBe("top\nx"),
  );
});

/** A list in a cell keeps its Enter: the next item. */
test("Enter on a list item in a cell starts the next item", async () => {
  await table("a", () => [
    $createListNode("bullet").append(
      $createListItemNode().append($createTextNode("a")),
    ),
  ]);

  await userEvent.keyboard("{Enter}b");

  await waitFor(() =>
    expect(
      [...document.querySelectorAll("td li")].map((li) => li.textContent),
    ).toStrictEqual(["a", "b"]),
  );
});

/**
 * In the last row there is no cell below: Enter goes on down, to the line
 * under the table. It put the caret back at the start of its cell.
 */
test("Enter in the last row goes to the line under the table", async () => {
  const live = await table("bottom");

  await userEvent.keyboard("{Enter}");

  await waitFor(() =>
    expect(
      live.getEditorState().read(() => {
        const selection = $getSelection();
        return $isRangeSelection(selection)
          ? selection.anchor.getNode().getKey()
          : null;
      }),
    ).toBe(
      live
        .getEditorState()
        .read(() => $getRoot().getLastChildOrThrow().getKey()),
    ),
  );
  expect(cells()).toStrictEqual([["top"], ["bottom"]]);
  expect(live.getEditorState().read(() => $getRoot().getChildrenSize())).toBe(
    2,
  );
});

/** A table that ends the document: Enter there makes the line under it. */
test("Enter in the last row of a table that ends the document adds a line", async () => {
  const live = await table("bottom");
  live.update(
    () => {
      $getRoot().getLastChildOrThrow().remove();
      $getRoot()
        .getAllTextNodes()
        .find((node) => node.getTextContent() === "bottom")!
        .selectEnd();
    },
    { discrete: true },
  );

  await userEvent.keyboard("{Enter}x");

  await waitFor(() =>
    expect(
      live.getEditorState().read(() =>
        $getRoot()
          .getChildren()
          .map((node) => node.getType()),
      ),
    ).toStrictEqual(["table", "paragraph"]),
  );
  expect(
    live
      .getEditorState()
      .read(() => $getRoot().getLastChildOrThrow().getTextContent()),
  ).toBe("x");
  expect(cells()).toStrictEqual([["top"], ["bottom"]]);
});

/** With the "/" menu open in a cell, Enter picks from the menu. */
test("Enter with the slash menu open in a cell picks from the menu", async () => {
  await table("top", () => [$createParagraphNode()]);

  await userEvent.keyboard("/numbered");
  await waitFor(() =>
    expect(document.querySelector('[role="option"]')).not.toBeNull(),
  );
  await userEvent.keyboard("{Enter}");

  await waitFor(() => expect(document.querySelector("td ol")).not.toBeNull());
});

/**
 * A new line in a cell takes the markdown shortcuts a line of its own does:
 * "- " after Shift+Enter starts a list there. It stayed "- " — the new line
 * was a line break inside the same paragraph, and a shortcut only fires at
 * a paragraph's start.
 */
test("“- ” on a new line in a cell starts a list", async () => {
  await table("top");

  await userEvent.keyboard("{Shift>}{Enter}{/Shift}- x");

  await waitFor(() =>
    expect(document.querySelector("td li")?.textContent).toBe("x"),
  );
  expect(cells()).toStrictEqual([["top", "x"], ["bottom"]]);
});
