import type { LexicalEditor } from "lexical";
import * as React from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { render, waitFor } from "@testing-library/react";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { nodes } from "../nodes/nodes";
import { DraggableBlockPlugin } from "./draggable-block-plugin";

// Runs in the `browser` project: `userEvent` here is Playwright-backed, so the
// pointer really travels across the page. This bug is about what the pointer
// passes over on its way to a menu item, which a synthetic mousemove at a
// single element cannot express — and jsdom has no layout to move through.

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

function Harness({ onReady }: { onReady: (editor: LexicalEditor) => void }) {
  const [anchor, setAnchor] = React.useState<HTMLDivElement | null>(null);

  return (
    <LexicalComposer
      initialConfig={{
        namespace: "DraggableBlockBrowserTest",
        theme: {},
        nodes: nodes as never,
        onError: (error) => {
          throw error;
        },
      }}
    >
      <RichTextPlugin
        contentEditable={
          // No stylesheet loads here, so the layout the pointer needs has to
          // come from the harness: without a size, nothing is hoverable. The
          // outer box is fixed and inset so the page never scrolls — the
          // positions these tests assert on are viewport-relative — and so the
          // menu has margin to open into on either side.
          <div style={{ position: "fixed", top: 150, left: 120 }}>
            <div
              data-testid="anchor"
              ref={setAnchor}
              style={{ width: 260, padding: 12, position: "relative" }}
            >
              <ContentEditable
                aria-label="Draggable editor"
                style={{ minHeight: 200, outline: "none" }}
              />
            </div>
          </div>
        }
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <DraggableBlockPlugin anchorElem={anchor} />
      <EditorRefPlugin onReady={onReady} />
    </LexicalComposer>
  );
}

afterEach(() => document.body.replaceChildren());

const paragraphs = () => [
  ...document.querySelectorAll<HTMLElement>('[contenteditable="true"] > p'),
];

const blockTexts = (editor: LexicalEditor) =>
  editor.getEditorState().read(() =>
    $getRoot()
      .getChildren()
      .map((child) => child.getTextContent()),
  );

/**
 * Opening the menu on one block and then reaching for "Turn into" drags the
 * pointer down across the blocks below it. Those crossings used to retarget the
 * handle, so the heading landed on whichever block the pointer last passed over
 * rather than the one the menu was opened on.
 */
test("applies Turn into to the block the menu was opened on", async () => {
  let editor: LexicalEditor | null = null;
  render(<Harness onReady={(next) => (editor = next)} />);
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;

  // Enough blocks that the last one is still clear of the open menu, which
  // covers the ones directly beneath the handle.
  const texts = [
    "First block",
    "Second block",
    "Third block",
    ...Array.from({ length: 8 }, (_, index) => `Filler ${index + 1}`),
  ];

  live.update(() => {
    const root = $getRoot();
    root.clear();
    for (const text of texts) {
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode(text));
      root.append(paragraph);
    }
  });

  await waitFor(() => expect(paragraphs()).toHaveLength(texts.length));

  // Hover the first block so the handle belongs to it.
  await userEvent.hover(paragraphs()[0]!);

  const trigger = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[data-slot="draggable-block-menu"] [data-slot="popover-trigger"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });

  await userEvent.click(trigger);
  await waitFor(() =>
    expect(trigger.getAttribute("data-state")).toBe("open"),
  );

  // Reaching for the submenu takes the pointer over the blocks below.
  await userEvent.hover(paragraphs().at(-1)!);

  const turnInto = await waitFor(() => {
    const item = [
      ...document.querySelectorAll<HTMLElement>("[cmdk-item]"),
    ].find((node) => node.textContent?.includes("Turn into"));
    expect(item).toBeDefined();
    return item!;
  });

  await userEvent.click(turnInto);

  const heading = await waitFor(() => {
    const item = [
      ...document.querySelectorAll<HTMLElement>("[cmdk-item]"),
    ].find((node) => node.textContent?.trim() === "Heading 1");
    expect(item).toBeDefined();
    return item!;
  });

  await userEvent.click(heading);

  await waitFor(() => {
    const headings = [
      ...document.querySelectorAll<HTMLElement>('[contenteditable="true"] h1'),
    ].map((node) => node.textContent);

    expect(headings).toStrictEqual(["First block"]);
  });

  // The other blocks are untouched, in their original order.
  expect(blockTexts(live)).toStrictEqual(texts);
});

/**
 * Reaching for the menu takes the pointer off the editor, and @lexical/react
 * answers a `mouseleave` on the scroller by dropping the handle and hiding it —
 * with no `isOnMenu` guard. A menu anchored to the handle therefore lost its
 * anchor mid-reach: the rect collapsed to 0,0 and the menu jumped to the corner
 * of the screen. It has to stay where it was opened.
 */
test("keeps the menu in place once the pointer leaves the editor", async () => {
  let editor: LexicalEditor | null = null;
  render(<Harness onReady={(next) => (editor = next)} />);
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;

  live.update(() => {
    const root = $getRoot();
    root.clear();
    const paragraph = $createParagraphNode();
    paragraph.append($createTextNode("First block"));
    root.append(paragraph);
  });

  await waitFor(() => expect(paragraphs()).toHaveLength(1));
  await userEvent.hover(paragraphs()[0]!);

  const trigger = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[data-slot="draggable-block-menu"] [data-slot="popover-trigger"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });

  // Where the handle was when the menu opened — the menu belongs beside it.
  const handle = trigger.getBoundingClientRect();
  // Far enough down that the corner this used to jump to is unmistakable.
  // Far enough down that the corner this used to jump to is unmistakable.
  expect(handle.top).toBeGreaterThan(120);

  await userEvent.click(trigger);

  const content = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[data-slot="popover-content"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });

  // Somewhere outside the editor, the way the pointer travels to a menu item.
  const outside = document.createElement("div");
  Object.assign(outside.style, {
    position: "fixed",
    right: "0px",
    top: "0px",
    width: "120px",
    height: "120px",
  });
  document.body.append(outside);
  await userEvent.hover(outside);

  // Opening the submenu re-renders the menu, which is when the position is
  // recomputed — against an anchor that is no longer there.
  const turnInto = await waitFor(() => {
    const item = [
      ...document.querySelectorAll<HTMLElement>("[cmdk-item]"),
    ].find((node) => node.textContent?.includes("Turn into"));
    expect(item).toBeDefined();
    return item!;
  });
  await userEvent.hover(turnInto);
  await waitFor(() =>
    expect(
      document.querySelectorAll('[data-slot="popover-content"]'),
    ).toHaveLength(2),
  );

  const after = content.getBoundingClientRect();

  expect(after.width).toBeGreaterThan(0);
  expect(Math.abs(after.top - handle.top)).toBeLessThan(40);
});
