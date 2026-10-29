import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";
import { $createImageNode } from "../nodes/image-node";

// Runs in the `browser` project: what is seen of a selected image needs real
// layout and a real click.

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

async function renderWithImage() {
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
      $getRoot()
        .clear()
        .append(
          $createParagraphNode().append(
            $createImageNode({
              src: PIXEL,
              altText: "pic",
              width: 160,
              height: 120,
            }),
          ),
          $createParagraphNode().append($createTextNode("Next line")),
        );
    },
    { discrete: true },
  );

  return waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"] img',
    );
    expect(node?.getBoundingClientRect().width).toBeGreaterThan(100);
    return node!;
  });
}

const overlay = () =>
  document.querySelector<HTMLElement>('[data-slot="image-selected"]');

/**
 * As Notion has it: a clicked image is tinted the blue of a selected block.
 * Its ring was drawn outside the image, where the frame around it clips —
 * a click showed nothing at all.
 */
test("a clicked image is tinted over its whole area", async () => {
  const image = await renderWithImage();
  expect(overlay()).toBeNull();

  await userEvent.click(image);

  const tint = await waitFor(() => {
    expect(overlay()).not.toBeNull();
    return overlay()!;
  });
  const box = tint.getBoundingClientRect();
  const picture = image.getBoundingClientRect();
  expect(box.width).toBeCloseTo(picture.width, 0);
  expect(box.height).toBeCloseTo(picture.height, 0);
  expect(getComputedStyle(tint).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
});

test("the tint goes once the caret moves elsewhere", async () => {
  const image = await renderWithImage();
  await userEvent.click(image);
  await waitFor(() => expect(overlay()).not.toBeNull());

  const next = [...document.querySelectorAll("p")].find(
    (line) => line.textContent === "Next line",
  )!;
  await userEvent.click(next);

  await waitFor(() => expect(overlay()).toBeNull());
});
