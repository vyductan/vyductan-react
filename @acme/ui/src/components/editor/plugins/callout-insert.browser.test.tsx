import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { Editor } from "../editor";

// Runs in the `browser` project: the slash menu needs real key presses, and
// "typing lands in the first cell" is only proven by real keys.

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

async function renderEditor() {
  let editor: LexicalEditor | null = null;

  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );

  await waitFor(() => expect(editor).not.toBeNull());
  await userEvent.click(
    await waitFor(() => {
      const node = document.querySelector<HTMLElement>(
        '[contenteditable="true"]',
      );
      expect(node).not.toBeNull();
      return node!;
    }),
  );
}

/**
 * Like Notion: "/callout" puts in a 💡 callout on a gray tint with the caret
 * inside it, and a line after it so there is somewhere to go next.
 */
test("'/callout' inserts a callout with the caret inside", async () => {
  await renderEditor();

  await userEvent.keyboard("/callout");
  const option = await waitFor(() => {
    const match = [
      ...document.querySelectorAll<HTMLElement>('[role="option"]'),
    ].find((node) => node.textContent?.trim().startsWith("Callout"));
    expect(match).toBeDefined();
    return match!;
  });
  await userEvent.click(option);

  const callout = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(".Callout");
    expect(node).not.toBeNull();
    return node!;
  });
  expect(callout.dataset.icon).toBe("💡");
  expect(callout.dataset.color).toBe("gray_bg");
  expect(document.querySelector('[role="dialog"]')).toBeNull();

  await userEvent.keyboard("hi");
  await waitFor(() => expect(callout.textContent).toBe("hi"));

  // Not the slash command's text left behind, and a line to move on to.
  const root = callout.closest<HTMLElement>('[contenteditable="true"]')!;
  expect(root.textContent).not.toContain("/callout");
  expect(callout.nextElementSibling?.tagName).toBe("P");
});
