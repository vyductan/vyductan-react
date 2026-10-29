import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor, within } from "@testing-library/react";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { afterEach, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";
import { $createImageNode } from "../nodes/image-node";

// Runs in the `browser` project: the toolbar follows real hover.

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

async function renderWithImage({
  captionsEnabled,
  onImageDownload,
}: {
  captionsEnabled?: boolean;
  onImageDownload?: (source: string, name: string) => void;
} = {}) {
  let editor: LexicalEditor | null = null;
  render(
    <div style={{ width: 720, padding: 40 }}>
      <Editor autoFocus={false} onImageDownload={onImageDownload}>
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
              captionsEnabled,
            }),
          ),
          $createParagraphNode().append($createTextNode("Next line")),
        );
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

const toolbar = () =>
  document.querySelector<HTMLElement>('[data-slot="image-toolbar"]');

const openToolbar = async (image: HTMLElement) => {
  await userEvent.hover(image);
  return waitFor(() => {
    expect(toolbar()).not.toBeNull();
    return toolbar()!;
  });
};

/**
 * As Notion has it: an image shows a toolbar at its top right on hover —
 * caption, zoom, download and more.
 */
test("hovering an image shows its toolbar at the top right", async () => {
  const { image } = await renderWithImage();
  expect(toolbar()).toBeNull();

  const bar = await openToolbar(image);

  for (const name of ["Caption", "Zoom", "Download", "More"]) {
    expect(within(bar).getByRole("button", { name })).toBeTruthy();
  }
  const box = bar.getBoundingClientRect();
  const picture = image.getBoundingClientRect();
  expect(box.top).toBeGreaterThanOrEqual(picture.top);
  expect(box.right).toBeLessThanOrEqual(picture.right);
  expect(box.top - picture.top).toBeLessThan(24);
  expect(picture.right - box.right).toBeLessThan(24);
});

test("the toolbar goes when the pointer leaves the image", async () => {
  const { image } = await renderWithImage();
  await openToolbar(image);

  const next = [...document.querySelectorAll("p")].find(
    (line) => line.textContent === "Next line",
  )!;
  await userEvent.hover(next);

  await waitFor(() => expect(toolbar()).toBeNull());
});

test("an image whose captions are off offers no Caption", async () => {
  const { image } = await renderWithImage({ captionsEnabled: false });

  const bar = await openToolbar(image);

  expect(within(bar).queryByRole("button", { name: "Caption" })).toBeNull();
});

test("Caption opens the caption under the image", async () => {
  const { image } = await renderWithImage({ captionsEnabled: true });

  await userEvent.click(
    within(await openToolbar(image)).getByRole("button", { name: "Caption" }),
  );

  await waitFor(() =>
    expect(
      document.querySelector(".ImageNode__contentEditable"),
    ).not.toBeNull(),
  );
});

test("Zoom opens the image full screen", async () => {
  const { image } = await renderWithImage();

  await userEvent.click(
    within(await openToolbar(image)).getByRole("button", { name: "Zoom" }),
  );

  await waitFor(() =>
    expect(document.querySelector('[role="dialog"] img')).not.toBeNull(),
  );
});

test("More opens the image menu under the button", async () => {
  const { image } = await renderWithImage();
  const more = within(await openToolbar(image)).getByRole("button", {
    name: "More",
  });

  await userEvent.click(more);

  const menu = await waitFor(() => {
    const node = [...document.querySelectorAll<HTMLElement>("button")].find(
      (button) => button.textContent?.includes("Replace"),
    );
    expect(node).toBeTruthy();
    return node!;
  });
  expect(menu.getBoundingClientRect().top).toBeGreaterThan(
    more.getBoundingClientRect().bottom - 1,
  );
});

/**
 * A VS Code webview shows the save dialog for a page's download and writes
 * nothing; the host is handed the image to save instead.
 */
test("Download hands the image to the host when it saves images", async () => {
  const onImageDownload = vi.fn();
  const { image } = await renderWithImage({ onImageDownload });

  await userEvent.click(
    within(await openToolbar(image)).getByRole("button", { name: "Download" }),
  );

  expect(onImageDownload).toHaveBeenCalledWith(PIXEL, "pic");
});
