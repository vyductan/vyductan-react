import type { LexicalEditor } from "lexical";
import * as React from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
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

import { $isLayoutContainerNode } from "../nodes/layout-container-node";
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

// Unmounted first: a test can end with a menu open, and clearing the page
// under its portals left the old tree to fail the next test as it went.
afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

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
  await waitFor(() => expect(trigger.getAttribute("data-state")).toBe("open"));

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

/**
 * Typing hides the handle and its "+", as Notion does; moving the pointer
 * brings them back. Keys go straight to the editor's root: what is typed is
 * not the point, only that a key that writes was pressed.
 */
test("hides the handle while typing until the pointer moves", async () => {
  let editor: LexicalEditor | null = null;
  render(<Harness onReady={(next) => (editor = next)} />);
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;

  live.update(() => {
    const root = $getRoot();
    root.clear();
    const paragraph = $createParagraphNode();
    paragraph.append($createTextNode("Some words"));
    root.append(paragraph);
  });
  await waitFor(() => expect(paragraphs()).toHaveLength(1));

  await userEvent.hover(paragraphs()[0]!);
  const menu = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[data-slot="draggable-block-menu"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });
  expect(menu.dataset.typing).toBeUndefined();

  const press = (key: string, init: KeyboardEventInit = {}) =>
    live
      .getRootElement()!
      .dispatchEvent(
        new KeyboardEvent("keydown", { key, bubbles: true, ...init }),
      );

  press("x");
  expect(menu.dataset.typing).toBe("");
  expect(getComputedStyle(menu).visibility).toBe("hidden");

  await userEvent.hover(document.querySelector('[data-testid="anchor"]')!, {
    position: { x: 200, y: 150 },
  });
  await waitFor(() => expect(menu.dataset.typing).toBeUndefined());

  // A shortcut, or moving the caret, is not typing.
  press("b", { metaKey: true });
  press("ArrowLeft");
  expect(menu.dataset.typing).toBeUndefined();

  press("Backspace");
  expect(menu.dataset.typing).toBe("");
});

/** The document as text, columns as arrays of their blocks' text. */
const docShape = (editor: LexicalEditor) =>
  editor.getEditorState().read(() =>
    $getRoot()
      .getChildren()
      .map((child) =>
        $isLayoutContainerNode(child)
          ? child
              .getChildren()
              .map((column) =>
                $isElementNode(column)
                  ? column.getChildren().map((block) => block.getTextContent())
                  : [],
              )
          : child.getTextContent(),
      ),
  );

/**
 * Drag `from`'s handle and drop at (x, y): real drag events, one
 * DataTransfer through them, as the browser sends.
 */
async function dragBlock(from: HTMLElement, x: number, y: number) {
  await userEvent.hover(from);
  const handle = await waitFor(() => {
    const menu = document.querySelector<HTMLElement>(
      '[data-slot="draggable-block-menu"]',
    );
    const wrapper = menu?.closest<HTMLElement>("[draggable]");
    expect(wrapper).toBeTruthy();
    return wrapper!;
  });
  const dataTransfer = new DataTransfer();
  handle.dispatchEvent(
    new DragEvent("dragstart", {
      bubbles: true,
      cancelable: true,
      dataTransfer,
    }),
  );
  const over = document.elementFromPoint(x, y)!;
  const init = {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    dataTransfer,
  };
  over.dispatchEvent(new DragEvent("dragover", init));
  const line = document.querySelector<HTMLElement>(
    '[data-slot="draggable-block-target-line"]',
  );
  const lineHeight = line?.getBoundingClientRect().height ?? 0;
  over.dispatchEvent(new DragEvent("drop", init));
  handle.dispatchEvent(
    new DragEvent("dragend", { bubbles: true, dataTransfer }),
  );
  return { lineHeight };
}

/**
 * Notion's columns: a block dropped on another's right edge goes beside it,
 * and dragged back out, the columns undo themselves.
 */
test("drops a block beside another as columns, and back out", async () => {
  let editor: LexicalEditor | null = null;
  render(<Harness onReady={(next) => (editor = next)} />);
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;

  live.update(() => {
    const root = $getRoot();
    root.clear();
    for (const text of ["Alpha", "Beta", "Gamma"]) {
      root.append($createParagraphNode().append($createTextNode(text)));
    }
  });
  await waitFor(() => expect(paragraphs()).toHaveLength(3));

  const [alpha, , gamma] = paragraphs();
  const target = alpha!.getBoundingClientRect();
  const { lineHeight } = await dragBlock(
    gamma!,
    target.right - 4,
    target.top + target.height / 2,
  );
  // Upright, the height of the block, not a 4px line across.
  expect(lineHeight).toBeGreaterThan(10);
  await waitFor(() =>
    expect(docShape(live)).toEqual([[["Alpha"], ["Gamma"]], "Beta"]),
  );

  // Gamma's handle is in its column; dropped under Beta, the columns go.
  const inColumn = [
    ...document.querySelectorAll<HTMLElement>('[contenteditable="true"] p'),
  ].find((element) => element.textContent === "Gamma")!;
  const beta = paragraphs().find((element) => element.textContent === "Beta")!;
  const under = beta.getBoundingClientRect();
  await dragBlock(inColumn, under.left + under.width / 2, under.bottom - 2);
  await waitFor(() =>
    expect(docShape(live)).toEqual(["Alpha", "Beta", "Gamma"]),
  );
});

/**
 * As Notion: the menu says what the block is now — on "Turn into", and ticked
 * in its list. With no room in the margin it opens below the handle; it
 * flipped to the right, over the line it was opened on.
 */
test("the block menu shows the block's type and keeps clear of its line", async () => {
  let editor: LexicalEditor | null = null;
  const { unmount } = render(<Harness onReady={(next) => (editor = next)} />);
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;

  live.update(() => {
    const root = $getRoot();
    root.clear();
    root.append(
      $createHeadingNode("h2").append($createTextNode("Why")),
      $createParagraphNode().append($createTextNode("What")),
    );
  });
  const heading = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"] h2',
    );
    expect(node).not.toBeNull();
    return node!;
  });

  await userEvent.hover(heading);
  const trigger = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[data-slot="draggable-block-menu"] [data-slot="popover-trigger"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });
  await userEvent.click(trigger);

  const menu = await waitFor(() => {
    const node = [
      ...document.querySelectorAll<HTMLElement>(
        '[data-slot="popover-content"]',
      ),
    ].find((content) => content.textContent?.includes("Turn into"));
    expect(node).toBeTruthy();
    return node!;
  });
  // Measured where it comes to rest: it slides in from above as it opens.
  await Promise.all(
    menu
      .getAnimations({ subtree: true })
      .map((animation) => animation.finished),
  );
  // The harness leaves 120px of margin, short of the menu's 256.
  const line = heading.getBoundingClientRect();
  const box = menu.getBoundingClientRect();
  const overlaps =
    box.left < line.right &&
    box.right > line.left &&
    box.top < line.bottom &&
    box.bottom > line.top;
  expect(overlaps).toBe(false);

  const turnInto = [...menu.querySelectorAll<HTMLElement>("[cmdk-item]")].find(
    (item) => item.textContent?.startsWith("Turn into"),
  )!;
  expect(turnInto.textContent).toContain("Heading 2");

  await userEvent.hover(turnInto);
  const current = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      "[cmdk-item][data-current]",
    );
    expect(node).not.toBeNull();
    return node!;
  });
  expect(current.textContent).toBe("Heading 2");
});
