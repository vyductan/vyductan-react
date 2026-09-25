import type { LexicalEditor } from "lexical";
import * as React from "react";
import {
  $createListItemNode,
  $createListNode,
  $isListNode,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { render, waitFor } from "@testing-library/react";
import { $createTextNode, $getRoot } from "lexical";
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
  document.body.replaceChildren();
  document.body.removeAttribute("style");
});

const item = (text: string) =>
  $createListItemNode().append($createTextNode(text));

async function setUp() {
  let editor: LexicalEditor | null = null;
  render(
    <div style={{ position: "fixed", top: 150, left: 120, width: 260 }}>
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
          $createListNode("number").append(
            item("11"),
            $createListItemNode().append(
              $createListNode("number").append(item("a"), item("b"), item("c")),
            ),
            item("22"),
          ),
        );
    },
    { discrete: true },
  );
  const contentEditable = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    expect(node?.textContent).toContain("22");
    return node!;
  });
  await userEvent.click(contentEditable);

  // a through c, the way a drag across them leaves it.
  live.update(() => {
    const texts = $getRoot().getAllTextNodes();
    const a = texts.find((node) => node.getTextContent() === "a")!;
    const c = texts.find((node) => node.getTextContent() === "c")!;
    const selection = a.select(0, 0);
    selection.focus.set(c.getKey(), 1, "text");
  });

  return live;
}

const lineReading = (text: string) =>
  [
    ...document.querySelectorAll<HTMLLIElement>('[contenteditable="true"] li'),
  ].find(
    (li) => li.textContent?.trim() === text && !li.querySelector("ul, ol"),
  );

/**
 * In Notion, dragging across three lines of a nested list selects those three
 * lines as blocks. Here they share one top-level list, so the selection stayed
 * text, and nothing turned them into bullets together.
 */
test("selects nested list lines as blocks", async () => {
  await setUp();

  await waitFor(() => {
    for (const text of ["a", "b", "c"]) {
      expect(lineReading(text)?.hasAttribute("data-block-selected")).toBe(true);
    }
  });
  expect(lineReading("11")?.hasAttribute("data-block-selected")).toBe(false);
  expect(lineReading("22")?.hasAttribute("data-block-selected")).toBe(false);
});

test("turns every selected line into a bullet from the block menu", async () => {
  const live = await setUp();
  await waitFor(() =>
    expect(lineReading("a")?.hasAttribute("data-block-selected")).toBe(true),
  );

  await userEvent.hover(lineReading("a")!);
  const trigger = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[data-slot="draggable-block-menu"] [data-slot="popover-trigger"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });
  await userEvent.click(trigger);

  const turnInto = await waitFor(() => {
    const node = [
      ...document.querySelectorAll<HTMLElement>("[cmdk-item]"),
    ].find((item) => item.textContent?.includes("Turn into"));
    expect(node).toBeDefined();
    return node!;
  });
  await userEvent.hover(turnInto);
  const bulleted = await waitFor(() => {
    const node = [
      ...document.querySelectorAll<HTMLElement>("[cmdk-item]"),
    ].find((item) => item.textContent?.trim() === "Bulleted list");
    expect(node).toBeDefined();
    return node!;
  });
  await userEvent.click(bulleted);

  await waitFor(() => {
    for (const text of ["a", "b", "c"]) {
      expect(getComputedStyle(lineReading(text)!).listStyleType).toBe("disc");
    }
  });
  expect(getComputedStyle(lineReading("11")!).listStyleType).toBe("decimal");
  expect(getComputedStyle(lineReading("22")!).listStyleType).toBe("decimal");
  const lists = live.getEditorState().read(
    () =>
      $getRoot()
        .getChildren()
        .filter((node) => $isListNode(node)).length,
  );
  expect(lists).toBe(1);
});
