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
 * The toolbar's block-type menu listed words only, and its button showed the
 * same icon whatever the type. The block menu's Turn into and the slash menu
 * show an icon beside each type; this one now shows the same ones, and the
 * button shows the current type's.
 */
test("shows each type's icon in the toolbar's type menu, and the current one on its button", async () => {
  let editor: LexicalEditor | null = null;
  render(
    <div style={{ position: "fixed", top: 200, left: 40, width: 360 }}>
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
        .append(
          $createParagraphNode().append($createTextNode("Some words here")),
        );
    },
    { discrete: true },
  );

  const line = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"] p',
    );
    expect(node?.textContent).toBe("Some words here");
    return node!;
  });
  await userEvent.tripleClick(line);

  const typeButton = await waitFor(() => {
    const node = [
      ...document.querySelectorAll<HTMLButtonElement>("button"),
    ].find((button) => button.textContent?.trim() === "Normal text");
    expect(node).toBeDefined();
    return node!;
  });
  await userEvent.click(typeButton);

  const choices = await waitFor(() => {
    const items = [
      ...document.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    ].filter((node) =>
      ["Normal text", "Bulleted list", "Numbered list", "To-do list"].includes(
        node.textContent?.trim() ?? "",
      ),
    );
    expect(items).toHaveLength(4);
    return items;
  });
  for (const item of choices) {
    expect(item.querySelector("svg")).not.toBeNull();
  }

  // Its button shows the type's icon — it used to show the text icon for
  // every type, a numbered list included.
  await userEvent.click(
    choices.find((item) => item.textContent?.trim() === "Bulleted list")!,
  );
  await waitFor(() => {
    const button = [
      ...document.querySelectorAll<HTMLButtonElement>("button"),
    ].find((node) => node.textContent?.trim() === "Bulleted list");
    expect([...(button?.querySelector("svg")?.classList ?? [])]).toContain(
      "lucide-list",
    );
  });
});
