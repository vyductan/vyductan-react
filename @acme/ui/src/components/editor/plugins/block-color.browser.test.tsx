import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { render, waitFor } from "@testing-library/react";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $setState,
} from "lexical";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";
import { blockColorState } from "../transformers/markdown-nfm-colors-transformer";

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

async function editorWithLine(text = "A line") {
  let editor: LexicalEditor | null = null;
  render(
    <div style={{ position: "fixed", top: 150, left: 120, width: 320 }}>
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
        .append($createParagraphNode().append($createTextNode(text)));
    },
    { discrete: true },
  );
  const line = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"] p',
    );
    expect(node?.textContent).toBe(text);
    return node!;
  });
  return { live, line };
}

/** Notion's block color: the block's text, or its background, in a color. */
test("a block color shows on the block", async () => {
  const { live, line } = await editorWithLine();
  live.update(
    () => {
      const paragraph = $getRoot().getFirstChildOrThrow();
      $setState(paragraph, blockColorState, "red");
    },
    { discrete: true },
  );

  await waitFor(() => expect(line.dataset.blockColor).toBe("red"));
  expect(getComputedStyle(line).color).toBe("rgb(220, 38, 38)");

  live.update(
    () => {
      $setState($getRoot().getFirstChildOrThrow(), blockColorState, "blue_bg");
    },
    { discrete: true },
  );
  await waitFor(() => expect(line.dataset.blockColor).toBe("blue_bg"));
  expect(getComputedStyle(line).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
});

async function openColorMenu(line: HTMLElement) {
  await userEvent.hover(line);
  const trigger = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[data-slot="draggable-block-menu"] [data-slot="popover-trigger"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });
  await userEvent.click(trigger);
  const color = await waitFor(() => {
    const node = [
      ...document.querySelectorAll<HTMLElement>("[cmdk-item]"),
    ].find((item) => item.textContent?.trim().startsWith("Color"));
    expect(node).toBeDefined();
    return node!;
  });
  await userEvent.hover(color);
  return (label: string) =>
    waitFor(() => {
      const node = [
        ...document.querySelectorAll<HTMLElement>("[cmdk-item]"),
        // Each item leads with an "A" swatch in its color.
      ].find((item) => item.textContent?.trim() === `A${label}`);
      expect(node).toBeDefined();
      return node!;
    });
}

test("the block menu's Color sets and clears a block's color", async () => {
  const { line } = await editorWithLine();

  const item = await openColorMenu(line);
  await userEvent.click(await item("Red background"));
  await waitFor(() => expect(line.dataset.blockColor).toBe("red_bg"));

  const again = await openColorMenu(line);
  await userEvent.click(await again("Default"));
  await waitFor(() => expect(line.dataset.blockColor).toBeUndefined());
});
