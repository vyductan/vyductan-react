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

// Through the block menu the way a person uses it, in the shipped editor, so
// the theme's list markers are the ones that paint.

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

/**
 * In Notion, turning "1. 11" into a heading brings the items nested under it
 * up to the top — "a. b. c." become "1. 2. 3.". Here they stayed nested under
 * nothing, still lettered.
 */
test("turning a numbered item into a heading brings its children up, numbered", async () => {
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

  live.update(() => {
    const root = $getRoot();
    root.clear();
    root.append(
      $createListNode("number").append(
        $createListItemNode().append($createTextNode("11")),
        $createListItemNode().append(
          $createListNode("number").append(
            $createListItemNode().append($createTextNode("a")),
            $createListItemNode().append($createTextNode("b")),
            $createListItemNode().append($createTextNode("c")),
          ),
        ),
        $createListItemNode().append($createTextNode("22")),
      ),
    );
  });

  const itemNamed = (text: string) =>
    [
      ...document.querySelectorAll<HTMLLIElement>(
        '[contenteditable="true"] li',
      ),
    ].find((node) => node.textContent?.trim() === text);

  const parent = await waitFor(() => {
    const node = itemNamed("11");
    expect(node).toBeDefined();
    return node!;
  });
  expect(getComputedStyle(itemNamed("a")!).listStyleType).toBe("lower-alpha");

  await userEvent.hover(parent);
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

  const heading3 = await waitFor(() => {
    const node = [
      ...document.querySelectorAll<HTMLElement>("[cmdk-item]"),
    ].find((item) => item.textContent?.trim() === "Heading 3");
    expect(node).toBeDefined();
    return node!;
  });
  await userEvent.click(heading3);

  await waitFor(() => {
    expect(
      document.querySelector('[contenteditable="true"] h3')?.textContent,
    ).toBe("11");
  });

  // a, b, c are top-level now, and number on into 22.
  const lists = live.getEditorState().read(() =>
    $getRoot()
      .getChildren()
      .filter((node) => $isListNode(node))
      .map((node) => node.getTextContent()),
  );
  expect(lists).toHaveLength(1);
  for (const text of ["a", "b", "c", "22"]) {
    expect(getComputedStyle(itemNamed(text)!).listStyleType).toBe("decimal");
  }
});
