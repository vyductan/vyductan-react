import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";

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

afterEach(async () => {
  cleanup();
  document.body.replaceChildren();
  document.body.removeAttribute("style");
  await page.viewport(414, 896);
});

const TEXT = "Some words worth formatting here";

/**
 * Mounts an editor in a fixed box and selects the words of its last line.
 * `linesBefore` gives the bar room above it inside the editor's scroller,
 * which clips anything past its top.
 */
async function selectLine(
  box: React.CSSProperties,
  {
    touch = false,
    linesBefore = 0,
  }: { touch?: boolean; linesBefore?: number } = {},
) {
  let editor: LexicalEditor | null = null;
  render(
    <div style={{ position: "fixed", ...box }}>
      <Editor autoFocus={false}>
        <EditorRefPlugin onReady={(next) => (editor = next)} />
      </Editor>
    </div>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  (editor as unknown as LexicalEditor).update(
    () => {
      const root = $getRoot().clear();
      for (let index = 0; index < linesBefore; index++) {
        root.append(
          $createParagraphNode().append($createTextNode(`Line ${index}`)),
        );
      }
      root.append($createParagraphNode().append($createTextNode(TEXT)));
    },
    { discrete: true },
  );

  const line = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"] p:last-of-type',
    );
    expect(node?.textContent).toBe(TEXT);
    return node!;
  });
  const root = document.querySelector<HTMLElement>('[contenteditable="true"]')!;
  // A phone's long-press starts with a touch pointer going down.
  root.dispatchEvent(
    new PointerEvent("pointerdown", {
      bubbles: true,
      pointerType: touch ? "touch" : "mouse",
    }),
  );
  root.focus();
  const range = document.createRange();
  range.selectNodeContents(line);
  const selection = globalThis.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);

  const bar = await waitFor(() => {
    // The same lookup the block-selection tests use.
    const node = [...document.querySelectorAll<HTMLElement>("div.z-50")].find(
      (element) => element.querySelector('[aria-label="Toggle bold"]'),
    );
    expect(node?.style.opacity).toBe("1");
    return node!;
  });
  return { bar, root, line, range };
}

/** The grid's buttons, in the order Notion's selection menu lays them out. */
const GRID = [
  "Text color",
  "Toggle bold",
  "Toggle italic",
  "Toggle underline",
  "Clear formatting",
  "Toggle link",
  "Toggle strikethrough",
  "Toggle code",
  "More options",
];

const gridButtons = (bar: HTMLElement) =>
  GRID.map((label) =>
    bar.querySelector<HTMLElement>(`[aria-label="${label}"]`),
  );

/**
 * Laid out as Notion's selection menu is now: a panel with the block's type
 * on the first row, then the marks in a grid of two rows — color, bold,
 * italic, underline, clear formatting; link, strikethrough, code, more. It
 * replaced a one-row bar that hid color and clear formatting behind "More"
 * and folded marks away in a narrow editor.
 */
test("opens as a panel: the block type, then two rows of marks", async () => {
  await page.viewport(1280, 800);
  const { bar, range } = await selectLine(
    { top: 200, left: 40, width: 720 },
    { linesBefore: 8 },
  );

  expect(bar.dataset.placement).toBe("top");
  expect(bar.getBoundingClientRect().bottom).toBeLessThanOrEqual(
    range.getBoundingClientRect().top,
  );

  const type = bar.querySelector<HTMLElement>('[aria-label="Turn into"]')!;
  expect(type.textContent).toContain("Text");

  const buttons = gridButtons(bar);
  expect(buttons.every((button) => button !== null)).toBe(true);
  const tops = buttons.map((button) =>
    Math.round(button!.getBoundingClientRect().top),
  );
  const [firstRow, secondRow] = [tops.slice(0, 5), tops.slice(5)];
  expect(new Set(firstRow).size).toBe(1);
  expect(new Set(secondRow).size).toBe(1);
  expect(secondRow[0]).toBeGreaterThan(firstRow[0]!);
  expect(type.getBoundingClientRect().bottom).toBeLessThanOrEqual(
    firstRow[0]! + 0.5,
  );
  for (const button of buttons) {
    expect(button!.getBoundingClientRect().height).toBe(28);
  }

  // The type row spans the panel, as Notion's does.
  expect(type.getBoundingClientRect().width).toBeGreaterThan(
    bar.getBoundingClientRect().width * 0.8,
  );
  expect(bar.textContent).not.toContain("Ask AI");
  expect(bar.textContent).not.toContain("Explain");
});

/**
 * A narrow editor no longer costs any marks: the panel is narrow already, so
 * nothing folds into "More", and it still keeps clear of the handle gutter.
 */
test("keeps every mark in a narrow editor, clear of the handle gutter", async () => {
  const { bar, root } = await selectLine({ top: 300, left: 8, width: 230 });

  expect(gridButtons(bar).every((button) => button !== null)).toBe(true);
  const box = bar.getBoundingClientRect();
  const textStart =
    root.getBoundingClientRect().left +
    Number.parseFloat(getComputedStyle(root).paddingLeft);
  expect(box.left).toBeGreaterThanOrEqual(textStart - 6);
  expect(box.right).toBeLessThanOrEqual(window.innerWidth);
});

/** Color and clear formatting are on the panel now, not in "More". */
test("colors and clears from the panel, and More no longer repeats them", async () => {
  const { bar, line } = await selectLine({ top: 300, left: 8, width: 380 });

  await userEvent.click(bar.querySelector('[aria-label="Text color"]')!);
  await waitFor(() => {
    const text = document.body.textContent ?? "";
    expect(text).toContain("Text color");
    expect(text).toContain("Background color");
  });
  const red = [
    ...document.querySelectorAll<HTMLElement>('[role="menuitem"]'),
  ].find((item) => item.textContent?.trim() === "Red")!;
  await userEvent.click(red);
  await waitFor(() =>
    expect(line.querySelector<HTMLElement>("span")?.style.color).not.toBe(""),
  );

  await userEvent.click(bar.querySelector('[aria-label="Clear formatting"]')!);
  await waitFor(() =>
    expect(line.querySelector<HTMLElement>("span")?.style.color ?? "").toBe(""),
  );

  await userEvent.click(bar.querySelector('[aria-label="More options"]')!);
  const labels = await waitFor(() => {
    const items = [
      ...document.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    ].map((item) => item.textContent?.trim() ?? "");
    expect(items.some((label) => label.startsWith("Superscript"))).toBe(true);
    return items;
  });
  expect(labels.some((label) => label.startsWith("Clear formatting"))).toBe(
    false,
  );
  expect(labels.some((label) => label === "Color")).toBe(false);
});

test("flips below the selection when there is no room above", async () => {
  const { bar, range } = await selectLine({ top: 0, left: 8, width: 380 });

  await waitFor(() => expect(bar.dataset.placement).toBe("bottom"));
  expect(bar.getBoundingClientRect().top).toBeGreaterThanOrEqual(
    range.getBoundingClientRect().bottom,
  );
});

/**
 * Phones draw their own copy/paste menu above a selection, and its drag
 * handles hang below it. A selection made by touch gets the bar below, clear
 * of the handles, instead of on top of the native menu.
 */
test("opens below a selection made by touch, clear of the handles", async () => {
  const { bar, range } = await selectLine(
    { top: 300, left: 8, width: 380 },
    { touch: true },
  );

  await waitFor(() => expect(bar.dataset.placement).toBe("bottom"));
  expect(bar.getBoundingClientRect().top).toBeGreaterThanOrEqual(
    range.getBoundingClientRect().bottom + 20,
  );
});
