import type { ElementNode, LexicalEditor, TextNode } from "lexical";
import * as React from "react";
import { $createListItemNode, $createListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createHeadingNode } from "@lexical/rich-text";
import { cleanup, render, waitFor } from "@testing-library/react";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isElementNode,
} from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";

// Runs in the `browser` project: the highlight is computed style and the
// handle's block comes from real layout under a real pointer.

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

function build() {
  $getRoot()
    .clear()
    .append(
      $createParagraphNode().append($createTextNode("Intro")),
      $createParagraphNode().append($createTextNode("Middle")),
      $createHeadingNode("h2").append($createTextNode("TODO")),
      $createListNode("check").append(
        $createListItemNode(false).append($createTextNode("to do")),
      ),
    );
}

/** Select from the start of block `from` to the end of block `to`. */
async function selectBlocks(editor: LexicalEditor, from: number, to: number) {
  await userEvent.click(lineOf("Intro"));
  editor.update(
    () => {
      const root = $getRoot();
      const first = root.getChildAtIndex<ElementNode>(from)!;
      const last = root.getChildAtIndex<ElementNode>(to)!;
      const end = last.getLastDescendant()!;
      const selection = first.selectStart();
      if ($isElementNode(end)) selection.focus.set(end.getKey(), 0, "element");
      else selection.focus.set(end.getKey(), end.getTextContentSize(), "text");
    },
    { discrete: true },
  );
}

const selectedTexts = () =>
  [
    ...document.querySelectorAll<HTMLElement>(
      '[contenteditable="true"] [data-block-selected]',
    ),
  ].map((element) => element.textContent);

const topLevelTexts = (editor: LexicalEditor) =>
  editor.getEditorState().read(() =>
    $getRoot()
      .getChildren()
      .map((node) => node.getTextContent()),
  );

test("a selection running into a second block highlights every block it spans", async () => {
  const editor = await renderEditor(build);
  await selectBlocks(editor, 1, 3);

  await waitFor(() =>
    expect(selectedTexts()).toEqual(["Middle", "TODO", "to do"]),
  );
  const heading = lineOf("TODO").closest("h2")!;
  expect(getComputedStyle(heading).backgroundColor).not.toBe(
    "rgba(0, 0, 0, 0)",
  );
});

test("a selection inside one block stays a text selection", async () => {
  const editor = await renderEditor(build);
  await userEvent.click(lineOf("Intro"));
  editor.update(
    () => {
      $getRoot()
        .getFirstChildOrThrow<ElementNode>()
        .getFirstChildOrThrow<TextNode>()
        .select(0, 3);
    },
    { discrete: true },
  );
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(selectedTexts()).toEqual([]);
});

test("dragging the handle of a selected block moves the whole selection", async () => {
  const editor = await renderEditor(build);
  await selectBlocks(editor, 2, 3);
  await waitFor(() => expect(selectedTexts()).toEqual(["TODO", "to do"]));

  await userEvent.hover(lineOf("to do"));
  await waitFor(() => expect(handle()).toBeTruthy());
  grip().dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  dragBlockOnto(lineOf("Intro"), "upper");

  await waitFor(() =>
    expect(topLevelTexts(editor)).toEqual(["TODO", "to do", "Intro", "Middle"]),
  );
});

test("the handle of a block outside the selection drags only that block", async () => {
  const editor = await renderEditor(build);
  await selectBlocks(editor, 2, 3);
  await waitFor(() => expect(selectedTexts()).toEqual(["TODO", "to do"]));

  await userEvent.hover(lineOf("Middle"));
  await waitFor(() => expect(handle()).toBeTruthy());
  grip().dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  dragBlockOnto(lineOf("Intro"), "upper");

  await waitFor(() =>
    expect(topLevelTexts(editor)).toEqual(["Middle", "Intro", "TODO", "to do"]),
  );
});
