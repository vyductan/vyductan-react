import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
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
import { $createImageNode } from "../nodes/image-node";

// Runs in the `browser` project: a shift+click is real pointer and key input.

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

const PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

async function renderEditor(src: string) {
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
  live.update(
    () => {
      const image = () =>
        $createParagraphNode().append(
          $createImageNode({ src, altText: "pic", width: 160, height: 120 }),
        );
      $getRoot()
        .clear()
        .append(
          $createParagraphNode().append($createTextNode("Screenshots")),
          image(),
          image(),
          $createParagraphNode().append($createTextNode("After")),
        );
    },
    { discrete: true },
  );
  return live;
}

function lineOf(text: string): HTMLElement {
  const match = [
    ...document.querySelectorAll<HTMLElement>('[contenteditable="true"] p'),
  ].find((element) => element.textContent === text);
  if (!match) throw new Error(`no line "${text}"`);
  return match;
}

const selected = (editor: LexicalEditor) =>
  editor.getEditorState().read(() => {
    const selection = $getSelection();
    return $isRangeSelection(selection)
      ? {
          anchor: selection.anchor.getNode().getTextContent(),
          focus: selection.focus.getNode().getTextContent(),
          collapsed: selection.isCollapsed(),
        }
      : null;
  });

async function shiftClick(
  element: HTMLElement,
  position: { x: number; y: number },
) {
  await userEvent.keyboard("{Shift>}");
  await userEvent.click(element, { position });
  await userEvent.keyboard("{/Shift}");
}

for (const [name, src] of [
  ["loaded", PIXEL],
  ["failed", "attachment:x:missing.png"],
] as const) {
  /**
   * As in Notion: a click before a line, then a shift+click further down,
   * selects every line between — over images too — to delete them at once.
   */
  test(`shift+click selects the lines down to it, over ${name} images`, async () => {
    const editor = await renderEditor(src);
    await waitFor(() =>
      expect(
        document.querySelectorAll('[contenteditable="true"] p').length,
      ).toBe(4),
    );
    await userEvent.click(lineOf("Screenshots"), { position: { x: 1, y: 8 } });

    await shiftClick(lineOf("After"), { x: 30, y: 8 });

    await waitFor(() =>
      expect(selected(editor)).toStrictEqual({
        anchor: "Screenshots",
        focus: "After",
        collapsed: false,
      }),
    );
  });
}

const images = () =>
  [
    ...document.querySelectorAll<HTMLElement>('[contenteditable="true"] p'),
  ].filter(
    (line) =>
      line.querySelector("img, [data-slot], .editor-image") &&
      !line.textContent,
  );

for (const [where, target] of [
  [
    "on the image",
    (line: HTMLElement) => ({
      el: line.querySelector<HTMLElement>("img") ?? line,
      x: 40,
      y: 40,
    }),
  ],
  ["right of the image", (line: HTMLElement) => ({ el: line, x: 220, y: 40 })],
  [
    "at the image's left edge",
    (line: HTMLElement) => ({ el: line, x: 1, y: 40 }),
  ],
] as const) {
  test(`shift+click ${where} selects the lines down to it`, async () => {
    const editor = await renderEditor(PIXEL);
    await waitFor(() => expect(images().length).toBe(2));
    await userEvent.click(lineOf("Screenshots"), { position: { x: 1, y: 8 } });

    const { el, x, y } = target(images()[1]!);
    await shiftClick(el, { x, y });

    await waitFor(() => {
      const range = selected(editor);
      expect(range?.anchor).toBe("Screenshots");
      expect(range?.collapsed).toBe(false);
    });
  });
}

test("the lines so selected go with one Backspace", async () => {
  const editor = await renderEditor(PIXEL);
  await waitFor(() => expect(images().length).toBe(2));
  await userEvent.click(lineOf("Screenshots"), { position: { x: 1, y: 8 } });
  await shiftClick(images()[1]!, { x: 220, y: 40 });

  await userEvent.keyboard("{Backspace}");

  await waitFor(() =>
    expect(
      editor.getEditorState().read(() =>
        $getRoot()
          .getChildren()
          .map((line) => line.getTextContent()),
      ),
    ).toStrictEqual(["After"]),
  );
  expect(
    document.querySelectorAll('[contenteditable="true"] img'),
  ).toHaveLength(0);
});
