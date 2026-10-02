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

const buttonsOf = (bar: HTMLElement) => [
  ...bar.querySelectorAll<HTMLButtonElement>("button"),
];

/**
 * The bar over a selection was a heavy, wide strip — Explain, Ask AI and
 * Comment as labelled buttons, a type menu, math, color — ~640px, so it
 * wrapped in most editors. Like Notion's it is now one slim row of 28px
 * buttons, opened just above the selection.
 */
test("opens as one slim row of 28px buttons just above the selection", async () => {
  await page.viewport(1280, 800);
  const { bar, range } = await selectLine(
    { top: 300, left: 40, width: 720 },
    { linesBefore: 3 },
  );

  const box = bar.getBoundingClientRect();
  expect(box.height).toBeLessThanOrEqual(38);
  for (const button of buttonsOf(bar)) {
    expect(button.getBoundingClientRect().height).toBe(28);
  }
  expect(box.bottom).toBeLessThanOrEqual(range.getBoundingClientRect().top);
  expect(bar.dataset.placement).toBe("top");

  // The most-used marks stay on the bar, the rest sit behind "More".
  for (const label of [
    "Toggle bold",
    "Toggle italic",
    "Toggle underline",
    "Toggle strikethrough",
    "Toggle code",
    "Toggle link",
  ]) {
    expect(bar.querySelector(`[aria-label="${label}"]`)).not.toBeNull();
  }
  expect(bar.textContent).not.toContain("Ask AI");
  expect(bar.textContent).not.toContain("Explain");
});

/**
 * In a narrow editor the old bar wrapped onto two or three rows. It now keeps
 * to one row inside the editor (its handle gutter included — see the
 * block-selection tests) and folds what does not fit into its "More" menu.
 */
test("keeps to one row in a narrow editor and folds the rest into More", async () => {
  const { bar, root } = await selectLine({ top: 300, left: 8, width: 230 });

  await waitFor(() =>
    expect(bar.querySelector('[aria-label="Toggle underline"]')).toBeNull(),
  );
  const box = bar.getBoundingClientRect();
  expect(box.height).toBeLessThanOrEqual(38);
  const scroller = (bar.parentElement!.parentElement ??
    bar.parentElement!) as HTMLElement;
  expect(box.right).toBeLessThanOrEqual(
    scroller.getBoundingClientRect().right + 0.5,
  );
  const textStart =
    root.getBoundingClientRect().left +
    Number.parseFloat(getComputedStyle(root).paddingLeft);
  expect(box.left).toBeGreaterThanOrEqual(textStart - 6);
  expect(box.right).toBeLessThanOrEqual(window.innerWidth);

  await userEvent.click(bar.querySelector('[aria-label="More options"]')!);
  await waitFor(() => {
    const labels = [
      ...document.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    ].map((item) => item.textContent?.trim() ?? "");
    expect(labels.some((label) => label.startsWith("Underline"))).toBe(true);
    expect(labels.some((label) => label.startsWith("Strikethrough"))).toBe(
      true,
    );
  });
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
