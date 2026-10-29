import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import {
  $createParagraphNode,
  $getRoot,
  $nodesOfType,
  UNDO_COMMAND,
} from "lexical";
import { afterEach, expect, test } from "vitest";

import { Editor } from "../editor";
import { ImageNode } from "../nodes/image-node";

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

// A 1×1 PNG, so the uploaded image preloads.
const PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const images = (live: LexicalEditor) =>
  live.getEditorState().read(() =>
    $nodesOfType(ImageNode).map((node) => ({
      src: node.getSrc(),
      loading: node.isLoading(),
    })),
  );

/**
 * One Cmd+Z takes a pasted image away. The upload finishing was a step of
 * its own, so undo went back to the image still "Uploading...", for good.
 */
test("undo after a pasted image has uploaded removes it", async () => {
  let editor: LexicalEditor | null = null;
  render(
    <Editor autoFocus={false} onImageUpload={async () => PIXEL}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;
  const root = document.querySelector<HTMLElement>('[contenteditable="true"]')!;
  root.focus();
  live.update(
    () => {
      const line = $createParagraphNode();
      $getRoot().clear().append(line);
      line.select();
    },
    { discrete: true },
  );
  // Let the setup settle into history before the paste.
  await new Promise((resolve) => setTimeout(resolve, 50));

  const bytes = Uint8Array.from(atob(PIXEL.split(",")[1]!), (c) =>
    c.charCodeAt(0),
  );
  const clipboardData = new DataTransfer();
  clipboardData.items.add(
    new File([bytes], "image.png", { type: "image/png" }),
  );
  root.dispatchEvent(
    new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData,
    }),
  );

  await waitFor(() =>
    expect(images(live)).toStrictEqual([{ src: PIXEL, loading: false }]),
  );

  live.dispatchCommand(UNDO_COMMAND, undefined);

  await waitFor(() => expect(images(live)).toStrictEqual([]));
});
