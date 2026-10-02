import type { ElementNode, LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createTableNodeWithDimensions } from "@lexical/table";
import { cleanup, render, waitFor } from "@testing-library/react";
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
  // Unmount first: the menu is portaled to <body>.
  cleanup();
  document.body.replaceChildren();
  document.body.removeAttribute("style");
});

async function tableWithRows() {
  let editor: LexicalEditor | null = null;
  render(
    <div style={{ position: "fixed", top: 120, left: 160, width: 520 }}>
      <Editor autoFocus={false}>
        <EditorRefPlugin onReady={(next) => (editor = next)} />
      </Editor>
    </div>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  live.update(
    () => {
      const table = $createTableNodeWithDimensions(4, 1, {
        rows: true,
        columns: false,
      });
      table.getChildren().forEach((row, index) => {
        $nodeOf(row)
          .getFirstDescendant()!
          .getParentOrThrow()
          .append($createTextNode(index === 0 ? "Head" : `R${index}`));
      });
      $getRoot().clear().append(table, $createParagraphNode());
    },
    { discrete: true },
  );
  await waitFor(() =>
    expect(rowTexts()).toStrictEqual(["Head", "R1", "R2", "R3"]),
  );

  await userEvent.click(cellOf("R1"));
  const handle = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      'button[aria-label="Row actions"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });
  return handle;
}

const $nodeOf = (node: unknown) => node as ElementNode;
const rowTexts = () =>
  [...document.querySelectorAll("table tr")].map((row) => row.textContent);
const cellOf = (text: string) =>
  [...document.querySelectorAll<HTMLElement>("table td")].find(
    (cell) => cell.textContent === text,
  )!;
const menuIsOpen = () => document.querySelector('[role="menu"]') !== null;

/**
 * Rows are reordered by dragging their handle, and its menu opens on a click,
 * as in Notion. The handle was the menu's dropdown trigger, which opens on
 * pointerdown and cancels it — and a cancelled pointerdown never becomes a
 * drag. Pressing the handle opened the menu and nothing moved; letting go
 * over a menu item then ran it (a drag toward a lower row added a row).
 */
test("pressing a row's handle leaves the drag to the browser and opens no menu", async () => {
  const handle = await tableWithRows();
  const rect = handle.getBoundingClientRect();
  const at = {
    clientX: rect.left + 5,
    clientY: rect.top + 5,
    bubbles: true,
    cancelable: true,
  };

  const pointerDown = new PointerEvent("pointerdown", {
    ...at,
    button: 0,
    pointerType: "mouse",
    isPrimary: true,
  });
  const mouseDown = new MouseEvent("mousedown", { ...at, button: 0 });
  handle.dispatchEvent(pointerDown);
  handle.dispatchEvent(mouseDown);

  expect(pointerDown.defaultPrevented).toBe(false);
  expect(mouseDown.defaultPrevented).toBe(false);
  await new Promise((resolve) => setTimeout(resolve, 100));
  expect(menuIsOpen()).toBe(false);
});

test("a click on a row's handle opens its menu", async () => {
  const handle = await tableWithRows();
  await userEvent.click(handle);
  await waitFor(() => expect(menuIsOpen()).toBe(true));
});

test("dragging a row's handle onto a lower row moves the row there", async () => {
  const handle = await tableWithRows();
  const dataTransfer = new DataTransfer();
  const target = cellOf("R3");
  const rect = target.getBoundingClientRect();
  const over = {
    bubbles: true,
    cancelable: true,
    dataTransfer,
    clientX: rect.left + 10,
    clientY: rect.bottom - 3,
  };

  handle.dispatchEvent(
    new DragEvent("dragstart", { bubbles: true, dataTransfer }),
  );
  target.dispatchEvent(new DragEvent("dragover", over));
  target.dispatchEvent(new DragEvent("drop", over));
  handle.dispatchEvent(
    new DragEvent("dragend", { bubbles: true, dataTransfer }),
  );

  await waitFor(() =>
    expect(rowTexts()).toStrictEqual(["Head", "R2", "R3", "R1"]),
  );
});
