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
 * pointerdown: pressing it opened the menu, and letting go over a menu item
 * then ran it (a drag toward a lower row added a row).
 */
test("pressing a row's handle opens no menu", async () => {
  const handle = await tableWithRows();
  const rect = handle.getBoundingClientRect();
  handle.dispatchEvent(
    new PointerEvent("pointerdown", {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + 5,
      clientY: rect.top + 5,
      button: 0,
      pointerType: "mouse",
      isPrimary: true,
    }),
  );
  await new Promise((resolve) => setTimeout(resolve, 100));
  expect(menuIsOpen()).toBe(false);
});

test("a click on a row's handle opens its menu", async () => {
  const handle = await tableWithRows();
  await userEvent.click(handle);
  await waitFor(() => expect(menuIsOpen()).toBe(true));
});

const frame = () => new Promise((resolve) => setTimeout(resolve, 50));

/** A mouse drag as the browser delivers it: down, moves over frames, up. */
async function mouseDrag(
  handle: HTMLElement,
  to: { clientX: number; clientY: number },
) {
  const start = handle.getBoundingClientRect();
  const point = (clientX: number, clientY: number) => ({
    bubbles: true,
    cancelable: true,
    clientX,
    clientY,
    button: 0,
    buttons: 1,
    pointerId: 1,
    pointerType: "mouse",
    isPrimary: true,
  });
  const from = { x: start.left + 5, y: start.top + 5 };
  handle.dispatchEvent(new PointerEvent("pointerdown", point(from.x, from.y)));
  for (let step = 1; step <= 4; step++) {
    await frame();
    const x = from.x + ((to.clientX - from.x) * step) / 4;
    const y = from.y + ((to.clientY - from.y) * step) / 4;
    document
      .elementFromPoint(x, y)
      ?.dispatchEvent(new PointerEvent("pointermove", point(x, y)));
  }
  await frame();
  const end =
    document.elementFromPoint(to.clientX, to.clientY) ?? document.body;
  end.dispatchEvent(
    new PointerEvent("pointerup", {
      ...point(to.clientX, to.clientY),
      buttons: 0,
    }),
  );
  end.dispatchEvent(new MouseEvent("click", point(to.clientX, to.clientY)));
  await frame();
}

/**
 * Dragging is done with pointer events, not HTML drag and drop. Inside VS
 * Code's webview (VD Markdown) a native drag's dragover and drop never reach
 * the page — the grip's ghost followed the pointer and the row stayed put.
 */
test("dragging a row's handle onto a lower row moves the row there", async () => {
  const handle = await tableWithRows();
  const rect = cellOf("R3").getBoundingClientRect();

  await mouseDrag(handle, {
    clientX: rect.left + 10,
    clientY: rect.bottom - 3,
  });

  await waitFor(() =>
    expect(rowTexts()).toStrictEqual(["Head", "R2", "R3", "R1"]),
  );
  // The drag ends in a click; it must not also open the menu.
  expect(menuIsOpen()).toBe(false);
});

test("dragging a row's handle up moves the row above", async () => {
  await tableWithRows();
  await userEvent.click(cellOf("R3"));
  const handle = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      'button[aria-label="Row actions"]',
    );
    expect(node?.getBoundingClientRect().top).toBeGreaterThan(
      cellOf("R2").getBoundingClientRect().top,
    );
    return node!;
  });
  const rect = cellOf("R1").getBoundingClientRect();

  await mouseDrag(handle, { clientX: rect.left + 10, clientY: rect.top + 3 });

  await waitFor(() =>
    expect(rowTexts()).toStrictEqual(["Head", "R3", "R1", "R2"]),
  );
});

async function tableWithColumns() {
  let editor: LexicalEditor | null = null;
  render(
    <div style={{ position: "fixed", top: 160, left: 40, width: 360 }}>
      <Editor autoFocus={false}>
        <EditorRefPlugin onReady={(next) => (editor = next)} />
      </Editor>
    </div>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  (editor as unknown as LexicalEditor).update(
    () => {
      const table = $createTableNodeWithDimensions(1, 3, false);
      const [row] = table.getChildren() as ElementNode[];
      (row!.getChildren() as ElementNode[]).forEach((cell, index) => {
        cell
          .getFirstChildOrThrow<ElementNode>()
          .append($createTextNode(`C${index + 1}`));
      });
      $getRoot().clear().append(table, $createParagraphNode());
    },
    { discrete: true },
  );
  await waitFor(() => expect(rowTexts()).toStrictEqual(["C1C2C3"]));
}

const columnHandle = () =>
  waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      'button[aria-label="Column actions"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });

test("dragging a column's handle to the right moves the column", async () => {
  await tableWithColumns();
  await userEvent.click(cellOf("C1"));
  const rect = cellOf("C3").getBoundingClientRect();

  await mouseDrag(await columnHandle(), {
    clientX: rect.right - 3,
    clientY: rect.top + 5,
  });

  await waitFor(() => expect(rowTexts()).toStrictEqual(["C2C3C1"]));
});

test("dragging a column's handle left, onto a column's right half, lands after it", async () => {
  await tableWithColumns();
  await userEvent.click(cellOf("C3"));
  const rect = cellOf("C1").getBoundingClientRect();

  await mouseDrag(await columnHandle(), {
    clientX: rect.right - 3,
    clientY: rect.top + 5,
  });

  await waitFor(() => expect(rowTexts()).toStrictEqual(["C1C3C2"]));
});

const pointer = (type: string, clientX: number, clientY: number) =>
  new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX,
    clientY,
    button: 0,
    buttons: type === "pointerup" ? 0 : 1,
    pointerId: 1,
    pointerType: "mouse",
    isPrimary: true,
  });

const preview = () =>
  document.querySelector<HTMLElement>("[data-table-drag-preview]");

/**
 * Like Notion, the row being dragged follows the pointer — a translucent copy
 * of it — while the row itself fades where it was. Only the drop line showed,
 * so nothing seemed to move until the drop.
 */
test("while dragging a row, a copy of it follows the pointer", async () => {
  const handle = await tableWithRows();
  const start = handle.getBoundingClientRect();
  const from = { x: start.left + 5, y: start.top + 5 };
  const r3 = cellOf("R3").getBoundingClientRect();

  handle.dispatchEvent(pointer("pointerdown", from.x, from.y));
  await frame();
  document.dispatchEvent(pointer("pointermove", from.x, from.y + 10));
  await frame();
  const firstTop = preview()?.getBoundingClientRect().top;
  document.dispatchEvent(pointer("pointermove", from.x, r3.top + 5));
  await frame();

  const copy = preview();
  expect(copy).not.toBeNull();
  expect(copy!.textContent).toBe("R1");
  // It moved with the pointer, down by what the pointer did.
  expect(copy!.getBoundingClientRect().top - firstTop!).toBeCloseTo(
    r3.top + 5 - (from.y + 10),
    0,
  );
  // The row itself stays, faded.
  expect(Number(getComputedStyle(cellOf("R1")).opacity)).toBeLessThan(1);

  document.dispatchEvent(pointer("pointerup", from.x, r3.top + 5));
  await frame();
  expect(preview()).toBeNull();
  expect(Number(getComputedStyle(cellOf("R1")).opacity)).toBe(1);
});

test("while dragging a column, a copy of it follows the pointer", async () => {
  await tableWithColumns();
  await userEvent.click(cellOf("C1"));
  const handle = await columnHandle();
  const start = handle.getBoundingClientRect();
  const from = { x: start.left + 5, y: start.top + 5 };
  const c3 = cellOf("C3").getBoundingClientRect();

  handle.dispatchEvent(pointer("pointerdown", from.x, from.y));
  await frame();
  document.dispatchEvent(pointer("pointermove", from.x + 10, from.y));
  await frame();
  const firstLeft = preview()?.getBoundingClientRect().left;
  document.dispatchEvent(pointer("pointermove", c3.left + 5, from.y));
  await frame();

  expect(preview()?.textContent).toBe("C1");
  expect(preview()!.getBoundingClientRect().left - firstLeft!).toBeCloseTo(
    c3.left + 5 - (from.x + 10),
    0,
  );

  document.dispatchEvent(pointer("pointerup", c3.left + 5, from.y));
  await frame();
  expect(preview()).toBeNull();
});
