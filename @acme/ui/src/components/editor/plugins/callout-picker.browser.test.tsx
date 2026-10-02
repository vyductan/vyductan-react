import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import { $createParagraphNode, $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

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

afterEach(() => {
  // Unmount first: the picker is portaled to <body>, and emptying <body>
  // under a mounted portal makes React's own removal throw.
  cleanup();
  document.body.replaceChildren();
});

async function pasteIntoEmptyEditor(flavours: Record<string, string>) {
  let editor: LexicalEditor | null = null;

  render(
    <Editor autoFocus={false} resolvePasteLink={async () => null}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );

  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;

  live.update(() => {
    const root = $getRoot();
    root.clear();
    const paragraph = $createParagraphNode();
    root.append(paragraph);
    paragraph.select();
  });

  const contentEditable = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });

  const clipboardData = new DataTransfer();
  for (const [type, value] of Object.entries(flavours)) {
    clipboardData.setData(type, value);
  }

  contentEditable.dispatchEvent(
    new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData,
    }),
  );

  return { contentEditable, live };
}

/**
 * Clicking a callout's icon opens one picker for both of its properties: the
 * icon (search Notion-style by name) and the background color. The icon is
 * drawn by CSS, so the click is told apart by where it lands.
 */
async function calloutWithPicker() {
  const { contentEditable, live } = await pasteIntoEmptyEditor({
    "text/plain": '<callout icon="💡" color="gray_bg">\n\tA tip\n</callout>',
  });
  const callout = await waitFor(() => {
    const node = contentEditable.querySelector<HTMLElement>(".Callout");
    expect(node).not.toBeNull();
    return node!;
  });
  return { callout, live };
}

const picker = () =>
  document.querySelector<HTMLElement>('[aria-label="Callout icon and color"]');

const calloutJson = (live: LexicalEditor) =>
  live.getEditorState().read(() =>
    $getRoot()
      .getChildren()
      .map((node) => node.exportJSON())
      .find((json) => json.type === "callout"),
  ) as { icon: string; color: string } | undefined;

test("clicking the icon opens the picker; picking an emoji sets the icon", async () => {
  const { callout, live } = await calloutWithPicker();

  await userEvent.click(callout, { position: { x: 22, y: 22 } });
  await waitFor(() => expect(picker()).not.toBeNull());

  await userEvent.keyboard("fire");
  const fire = await waitFor(() => {
    const button = picker()?.querySelector<HTMLElement>('[aria-label="fire"]');
    expect(button).toBeTruthy();
    return button!;
  });
  await userEvent.click(fire);

  await waitFor(() => expect(callout.dataset.icon).toBe("🔥"));
  expect(calloutJson(live)?.icon).toBe("🔥");
  await waitFor(() => expect(picker()).toBeNull());
});

test("picking a color sets the callout's background", async () => {
  const { callout, live } = await calloutWithPicker();

  await userEvent.click(callout, { position: { x: 22, y: 22 } });
  const blue = await waitFor(() => {
    const button = picker()?.querySelector<HTMLElement>(
      '[aria-label="Blue background"]',
    );
    expect(button).toBeTruthy();
    return button!;
  });
  await userEvent.click(blue);

  await waitFor(() => expect(callout.dataset.color).toBe("blue_bg"));
  expect(calloutJson(live)?.color).toBe("blue_bg");
});

test("'Remove icon' leaves the callout without one", async () => {
  const { callout, live } = await calloutWithPicker();

  await userEvent.click(callout, { position: { x: 22, y: 22 } });
  const remove = await waitFor(() => {
    const button = [
      ...(picker()?.querySelectorAll<HTMLElement>("button") ?? []),
    ].find((node) => node.textContent === "Remove icon");
    expect(button).toBeDefined();
    return button!;
  });
  await userEvent.click(remove);

  await waitFor(() => expect(callout.dataset.icon).toBe(""));
  expect(calloutJson(live)?.icon).toBe("");
});

test("clicking the callout's text edits it, without opening the picker", async () => {
  const { callout } = await calloutWithPicker();

  const rect = callout.getBoundingClientRect();
  await userEvent.click(callout, {
    position: { x: rect.width - 20, y: rect.height / 2 },
  });
  await new Promise((resolve) => setTimeout(resolve, 300));

  expect(picker()).toBeNull();
});
