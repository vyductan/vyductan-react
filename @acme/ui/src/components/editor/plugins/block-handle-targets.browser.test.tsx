import type { LexicalEditor, LexicalNode } from "lexical";
import * as React from "react";
import { $createCodeNode } from "@lexical/code";
import {
  $createListItemNode,
  $createListNode,
  $isListItemNode,
  $isListNode,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  UNDO_COMMAND,
} from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";

// Runs in the `browser` project, against the full Editor as the app mounts it:
// the handle's position and drag are computed from real layout and real
// pointer/drag events, which neither jsdom nor a bare plugin harness has.

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

async function renderEditor(build: () => void) {
  let editor: LexicalEditor | null = null;

  render(
    <div style={{ width: 720, padding: 40 }}>
      <Editor autoFocus={false}>
        <EditorRefPlugin onReady={(next) => (editor = next)} />
      </Editor>
    </div>,
  );

  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  live.update(build, { discrete: true });
  return live;
}

const item = (text: string) =>
  $createListItemNode().append($createTextNode(text));

/** "Intro" paragraph, then 1. Khung / nested (S, B, Ví dụ) / 2. After. */
function buildNestedList() {
  const nested = $createListNode("number").append(
    item("S situation"),
    item("B behavior"),
    item("Ví dụ example"),
  );
  const root = $getRoot();
  root.clear();
  root.append(
    $createParagraphNode().append($createTextNode("Intro")),
    $createListNode("number").append(
      item("Khung framework"),
      $createListItemNode().append(nested),
      item("After"),
    ),
  );
}

const handle = () =>
  document.querySelector<HTMLElement>('[data-slot="draggable-block-menu"]')!;

const grip = () =>
  handle().querySelector<HTMLElement>('[data-slot="popover-trigger"]')!;

/**
 * Drag the hovered block's handle onto the upper or lower half of `target`.
 *
 * The hover that picks the block is real pointer input; the drag itself is
 * dispatched. Playwright's dragAndDrop sends a single dragover, and whether
 * Chrome then delivers the drop varied run to run — the same test passed and
 * failed on identical code. The handlers under test are the plugin's own
 * dragstart/dragover/drop, so dispatching reaches exactly the code in question.
 */
function dragBlockOnto(target: HTMLElement, half: "upper" | "lower") {
  const dataTransfer = new DataTransfer();
  const rect = target.getBoundingClientRect();
  const init = {
    bubbles: true,
    cancelable: true,
    dataTransfer,
    clientX: rect.left + 20,
    clientY: half === "upper" ? rect.top + 2 : rect.bottom - 2,
  };
  grip().dispatchEvent(new DragEvent("dragstart", init));
  target.dispatchEvent(new DragEvent("dragover", init));
  target.dispatchEvent(new DragEvent("drop", init));
  grip().dispatchEvent(new DragEvent("dragend", init));
}

/** The element whose text is exactly `text` inside the editable. */
function lineOf(text: string): HTMLElement {
  const match = [
    ...document.querySelectorAll<HTMLElement>('[contenteditable="true"] *'),
  ].find(
    (element) =>
      element.textContent === text &&
      [...element.children].every((child) => child.textContent !== text),
  );
  if (!match) throw new Error(`no element with text "${text}"`);
  return match;
}

const centreY = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  return rect.top + rect.height / 2;
};

test("hovering a nested list item puts the handle on that item", async () => {
  await renderEditor(buildNestedList);

  const target = lineOf("Ví dụ example");
  await userEvent.hover(target);

  await waitFor(() =>
    expect(Math.abs(centreY(handle()) - centreY(target))).toBeLessThan(8),
  );
});

test("hovering a top-level list item puts the handle on that item", async () => {
  await renderEditor(buildNestedList);

  const target = lineOf("After");
  await userEvent.hover(target);

  await waitFor(() =>
    expect(Math.abs(centreY(handle()) - centreY(target))).toBeLessThan(8),
  );
});

test("dragging a nested item's handle moves only that item", async () => {
  const editor = await renderEditor(buildNestedList);

  await userEvent.hover(lineOf("Ví dụ example"));
  await waitFor(() =>
    expect(
      Math.abs(centreY(handle()) - centreY(lineOf("Ví dụ example"))),
    ).toBeLessThan(8),
  );
  // Upper half of "S situation": before it.
  dragBlockOnto(lineOf("S situation"), "upper");

  await waitFor(() =>
    expect(
      editor.getEditorState().read(() => {
        const list = $getRoot().getChildAtIndex(1);
        if (!$isListNode(list)) return null;
        const holder = list.getChildAtIndex(1);
        const nested = $isListItemNode(holder) ? holder.getFirstChild() : null;
        return $isListNode(nested)
          ? nested.getChildren().map((child) => child.getTextContent())
          : null;
      }),
    ).toEqual(["Ví dụ example", "S situation", "B behavior"]),
  );
});

/** Top-level shape: paragraphs as their text, lists as nested arrays. */
const shape = (editor: LexicalEditor) =>
  editor.getEditorState().read(() => {
    const walk = (node: LexicalNode): unknown =>
      $isListNode(node)
        ? node.getChildren().flatMap((child) => {
            const first = $isListItemNode(child) ? child.getFirstChild() : null;
            return $isListNode(first)
              ? [walk(first)]
              : [child.getTextContent()];
          })
        : node.getTextContent();
    return $getRoot().getChildren().map(walk);
  });

test("a list item carries its nested items when dragged", async () => {
  const editor = await renderEditor(buildNestedList);

  await userEvent.hover(lineOf("Khung framework"));
  await waitFor(() =>
    expect(
      Math.abs(centreY(handle()) - centreY(lineOf("Khung framework"))),
    ).toBeLessThan(8),
  );
  dragBlockOnto(lineOf("After"), "lower");

  await waitFor(() =>
    expect(shape(editor)).toEqual([
      "Intro",
      [
        "After",
        "Khung framework",
        ["S situation", "B behavior", "Ví dụ example"],
      ],
    ]),
  );
});

test("an item dropped beside a paragraph becomes a list of its own", async () => {
  const editor = await renderEditor(buildNestedList);

  await userEvent.hover(lineOf("After"));
  await waitFor(() =>
    expect(Math.abs(centreY(handle()) - centreY(lineOf("After")))).toBeLessThan(
      8,
    ),
  );
  dragBlockOnto(lineOf("Intro"), "upper");

  await waitFor(() =>
    expect(shape(editor)).toEqual([
      ["After"],
      "Intro",
      ["Khung framework", ["S situation", "B behavior", "Ví dụ example"]],
    ]),
  );
});

function buildCodeBlock() {
  const root = $getRoot();
  root.clear();
  root.append(
    $createParagraphNode().append($createTextNode("Before")),
    $createCodeNode("javascript").append($createTextNode("const x = 1;")),
    $createParagraphNode().append($createTextNode("After")),
  );
}

test("a code block can be dragged by its handle", async () => {
  const editor = await renderEditor(buildCodeBlock);

  const code = document.querySelector<HTMLElement>(
    '[contenteditable="true"] code',
  )!;
  await userEvent.hover(code);
  await waitFor(() =>
    expect(
      Math.abs(
        handle().getBoundingClientRect().top - code.getBoundingClientRect().top,
      ),
    ).toBeLessThan(24),
  );
  // Upper half of "Before": the code block moves to the top.
  dragBlockOnto(lineOf("Before"), "upper");

  await waitFor(() =>
    expect(
      editor.getEditorState().read(() =>
        $getRoot()
          .getChildren()
          .map((child) => child.getType()),
      ),
    ).toEqual(["code", "paragraph", "paragraph"]),
  );
});

test("hovering a code block shows a copy button", async () => {
  await renderEditor(buildCodeBlock);

  await userEvent.hover(
    document.querySelector<HTMLElement>('[contenteditable="true"] code')!,
  );

  await waitFor(() =>
    expect(
      [...document.querySelectorAll("button")].some((button) =>
        /copy/i.test(
          `${button.getAttribute("aria-label") ?? ""} ${button.textContent ?? ""}`,
        ),
      ),
    ).toBe(true),
  );
});

const copyButton = () =>
  [...document.querySelectorAll("button")].find((button) =>
    /copy/i.test(
      `${button.getAttribute("aria-label") ?? ""} ${button.textContent ?? ""}`,
    ),
  );

test("the copy button stays while the pointer is on its icon", async () => {
  await renderEditor(buildCodeBlock);

  await userEvent.hover(
    document.querySelector<HTMLElement>('[contenteditable="true"] code')!,
  );
  await waitFor(() => expect(copyButton()).toBeDefined());

  // The icon is an SVG: the element under the pointer when reaching to click.
  await userEvent.hover(copyButton()!.querySelector("svg")!);
  await new Promise((resolve) => setTimeout(resolve, 300));

  expect(copyButton()).toBeDefined();
});

test("a read-only editor still offers copy, and no language picker", async () => {
  let editor: LexicalEditor | null = null;
  render(
    <div style={{ width: 720, padding: 40 }}>
      <Editor autoFocus={false} editable={false}>
        <EditorRefPlugin onReady={(next) => (editor = next)} />
      </Editor>
    </div>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  // Content is set programmatically: a read-only editor refuses user edits,
  // not updates from its host.
  (editor as unknown as LexicalEditor).update(buildCodeBlock, {
    discrete: true,
  });

  const code = await waitFor(() => {
    const node = document.querySelector<HTMLElement>("code");
    expect(node).not.toBeNull();
    return node!;
  });
  await userEvent.hover(code);

  await waitFor(() => expect(copyButton()).toBeDefined());
  expect(document.querySelector('button[title="Select language"]')).toBeNull();
});

/** Whether a highlight is running on the block that holds `element`. */
const isFlashing = (element: Element) =>
  (element.closest("li, p, h1, h2, h3, code") ?? element)
    .getAnimations()
    .some((animation) => animation.id === "editor-block-flash");

test("a dropped block is highlighted, like Notion", async () => {
  await renderEditor(buildCodeBlock);

  await userEvent.hover(lineOf("After"));
  await waitFor(() =>
    expect(Math.abs(centreY(handle()) - centreY(lineOf("After")))).toBeLessThan(
      12,
    ),
  );
  dragBlockOnto(lineOf("Before"), "upper");

  await waitFor(() => expect(isFlashing(lineOf("After"))).toBe(true));
  expect(isFlashing(lineOf("Before"))).toBe(false);
});

test("undo highlights the block it brings back", async () => {
  const editor = await renderEditor(buildNestedList);

  await userEvent.hover(lineOf("After"));
  await waitFor(() =>
    expect(Math.abs(centreY(handle()) - centreY(lineOf("After")))).toBeLessThan(
      8,
    ),
  );
  dragBlockOnto(lineOf("Khung framework"), "upper");
  await waitFor(() =>
    expect(shape(editor)[1]).toEqual([
      "After",
      "Khung framework",
      ["S situation", "B behavior", "Ví dụ example"],
    ]),
  );
  // Let the drop's own highlight finish so only the undo's can be seen.
  for (const animation of document.getAnimations()) animation.finish();

  editor.dispatchCommand(UNDO_COMMAND, undefined);

  await waitFor(() =>
    expect(shape(editor)[1]).toEqual([
      "Khung framework",
      ["S situation", "B behavior", "Ví dụ example"],
      "After",
    ]),
  );
  await waitFor(() => expect(isFlashing(lineOf("After"))).toBe(true));
});
