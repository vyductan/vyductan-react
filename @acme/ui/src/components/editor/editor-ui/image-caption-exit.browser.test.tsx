import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
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
import { $createImageNode, $isImageNode } from "../nodes/image-node";

// Runs in the `browser` project: real keys and a real paste into the
// caption's own editor, nested in the page's.

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

/** "Before", an image captioned "Summary of changes", then "Last line". */
async function renderCaptioned() {
  let editor: LexicalEditor | null = null;
  render(
    <div style={{ width: 720, padding: 40 }}>
      <Editor autoFocus={false} onImageUpload={() => Promise.resolve(PIXEL)}>
        <EditorRefPlugin onReady={(next) => (editor = next)} />
      </Editor>
    </div>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  live.update(
    () => {
      const image = $createImageNode({
        src: PIXEL,
        altText: "first",
        width: 160,
        height: 120,
        showCaption: true,
        captionsEnabled: true,
      });
      image.setCaptionText("Summary of changes");
      $getRoot()
        .clear()
        .append(
          $createParagraphNode().append($createTextNode("Before")),
          $createParagraphNode().append(image),
          $createParagraphNode().append($createTextNode("Last line")),
        );
    },
    { discrete: true },
  );
  const caption = await waitFor(() => {
    const element = document.querySelector<HTMLElement>(
      ".ImageNode__contentEditable",
    );
    expect(element?.textContent).toBe("Summary of changes");
    return element!;
  });
  return { editor: live, caption };
}

/** The page's blocks: images by alt text, the rest by their words. */
const blocks = (editor: LexicalEditor) =>
  editor.getEditorState().read(() =>
    $getRoot()
      .getChildren()
      .map((block) => {
        const image = $isElementNode(block)
          ? block.getChildren().find($isImageNode)
          : undefined;
        return image ? `[${image.getAltText()}]` : block.getTextContent();
      }),
  );

async function caretAtCaptionEnd(caption: HTMLElement) {
  await userEvent.click(caption);
  await userEvent.keyboard("{End}");
}

/**
 * As in Notion, Enter in a caption is done with it: the caret goes to a new
 * line under the image. It made a second line in the caption instead, where
 * the next thing typed or pasted went astray (2026-11-24).
 */
test("Enter in a caption goes to a new line under the image", async () => {
  const { editor, caption } = await renderCaptioned();
  await caretAtCaptionEnd(caption);
  await userEvent.keyboard("{Enter}");
  await userEvent.keyboard("Typed");

  await waitFor(() =>
    expect(blocks(editor)).toEqual(["Before", "[first]", "Typed", "Last line"]),
  );
  expect(caption.textContent).toBe("Summary of changes");
});

/**
 * Pasted with the caret in a caption, the image went to the very end of the
 * page: the page itself had no caret to put it at.
 */
test("an image pasted in a caption goes right after its image", async () => {
  const { editor, caption } = await renderCaptioned();
  await caretAtCaptionEnd(caption);

  const bytes = Uint8Array.from(atob(PIXEL.split(",")[1]!), (c) =>
    c.charCodeAt(0),
  );
  const data = new DataTransfer();
  data.items.add(new File([bytes], "second", { type: "image/png" }));
  caption.dispatchEvent(
    new ClipboardEvent("paste", {
      clipboardData: data,
      bubbles: true,
      cancelable: true,
    }),
  );

  await waitFor(() =>
    expect(blocks(editor)).toEqual([
      "Before",
      "[first]",
      "[second]",
      "Last line",
    ]),
  );
  // Whatever the caption had, it still has.
  expect(caption.textContent).toBe("Summary of changes");
});
