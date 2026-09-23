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
          // come from the harness: without a size, nothing is hoverable.
          <div
            data-testid="anchor"
            ref={setAnchor}
            style={{ width: 600, padding: 24, position: "relative" }}
          >
            <ContentEditable
              aria-label="Draggable editor"
              style={{ minHeight: 200, outline: "none" }}
            />
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

  live.update(() => {
    const root = $getRoot();
    root.clear();
    for (const text of ["First block", "Second block", "Third block"]) {
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode(text));
      root.append(paragraph);
    }
  });

  await waitFor(() => expect(paragraphs()).toHaveLength(3));

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

  // Portalled out of the handle, not into it. The editor's scroll container and
  // the card around it clip their overflow, so a menu living inside that
  // subtree is cut off the moment it opens away from the text.
  const panel = document.querySelector('[data-slot="popover-content"]');
  expect(panel).not.toBeNull();
  expect(
    panel!.closest('[data-slot="draggable-block-menu"]'),
  ).toBeNull();

  // Reaching for the submenu takes the pointer over the blocks below.
  await userEvent.hover(paragraphs()[2]!);

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
  expect(blockTexts(live)).toStrictEqual([
    "First block",
    "Second block",
    "Third block",
  ]);
});
