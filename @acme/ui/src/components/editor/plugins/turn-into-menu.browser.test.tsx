import type { LexicalEditor } from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { render, waitFor } from "@testing-library/react";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
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

/**
 * Notion's Turn into menu shows what each choice becomes at a glance: an icon
 * beside each, in the order the slash menu offers them. Ours was a list of
 * words, some named differently from the slash menu ("Paragraph" for Text,
 * "Check list" for To-do list).
 */
test("lists each block type with its icon, named as in the slash menu", async () => {
  let editor: LexicalEditor | null = null;
  render(
    <div style={{ position: "fixed", top: 150, left: 120, width: 260 }}>
      <Editor autoFocus={false}>
        <EditorRefPlugin onReady={(next) => (editor = next)} />
      </Editor>
    </div>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  (editor as unknown as LexicalEditor).update(
    () => {
      $getRoot()
        .clear()
        .append($createParagraphNode().append($createTextNode("A line")));
    },
    { discrete: true },
  );

  const line = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"] p',
    );
    expect(node?.textContent).toBe("A line");
    return node!;
  });

  await userEvent.hover(line);
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

  const choices = await waitFor(() => {
    const groups = [...document.querySelectorAll<HTMLElement>("[cmdk-group]")];
    const submenu = groups.at(-1)!;
    const items = [...submenu.querySelectorAll<HTMLElement>("[cmdk-item]")];
    expect(items.length).toBeGreaterThan(3);
    return items;
  });

  expect(choices.map((item) => item.textContent?.trim())).toStrictEqual([
    "Text",
    "Heading 1",
    "Heading 2",
    "Heading 3",
    "Bulleted list",
    "Numbered list",
    "To-do list",
    "Code",
    "Quote",
  ]);
  for (const item of choices) {
    expect(item.querySelector("svg")).not.toBeNull();
  }
});
