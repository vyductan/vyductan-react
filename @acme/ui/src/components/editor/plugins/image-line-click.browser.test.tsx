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

// Runs in the `browser` project: where a click lands, and where the browser
// then puts the caret, needs real layout and a real click.

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

// A 1x1 PNG, scaled by the node's width/height so there is something to click
// beside.
const PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

async function renderWithImage(after: "text" | "nothing") {
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
      const root = $getRoot();
      root.clear();
      root.append(
        $createParagraphNode().append(
          $createImageNode({
            src: PIXEL,
            altText: "pic",
            width: 160,
            height: 120,
          }),
        ),
      );
      if (after === "text") {
        root.append(
          $createParagraphNode().append($createTextNode("Next line")),
        );
      }
    },
    { discrete: true },
  );

  const image = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"] img',
    );
    expect(node?.getBoundingClientRect().width).toBeGreaterThan(100);
    return node!;
  });
  return { editor: live, image };
}

/** Click in the empty space right of the image, level with its middle. */
async function clickRightOf(image: HTMLElement) {
  const block = image.closest("p")!;
  const imageRect = image.getBoundingClientRect();
  const blockRect = block.getBoundingClientRect();
  await userEvent.click(block, {
    position: {
      x: imageRect.right - blockRect.left + 120,
      y: imageRect.top - blockRect.top + imageRect.height / 2,
    },
  });
}

const caret = (editor: LexicalEditor) =>
  editor.getEditorState().read(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection) || !selection.isCollapsed()) return null;
    const block = selection.anchor.getNode().getTopLevelElementOrThrow();
    return {
      blockIndex: block.getIndexWithinParent(),
      blockText: block.getTextContent(),
      offset: selection.anchor.offset,
    };
  });

test("clicking right of an image puts the caret at the start of the next line", async () => {
  const { editor, image } = await renderWithImage("text");

  await clickRightOf(image);

  await waitFor(() =>
    expect(caret(editor)).toEqual({
      blockIndex: 1,
      blockText: "Next line",
      offset: 0,
    }),
  );
});

test("an image on the last line gets a new empty line to put the caret in", async () => {
  const { editor, image } = await renderWithImage("nothing");

  await clickRightOf(image);

  await waitFor(() =>
    expect(caret(editor)).toEqual({ blockIndex: 1, blockText: "", offset: 0 }),
  );
  expect(editor.getEditorState().read(() => $getRoot().getChildrenSize())).toBe(
    2,
  );
});
