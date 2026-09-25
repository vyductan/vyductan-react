import type { ListType } from "@lexical/list";
import type { LexicalEditor } from "lexical";
import * as React from "react";
import { $createListItemNode, $createListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { render, waitFor } from "@testing-library/react";
import { $createTextNode, $getRoot } from "lexical";
import { afterEach, describe, expect, test } from "vitest";

import { Editor } from "./editor";
import { EditorRender } from "./editor-render";

// Which marker a list item draws is computed style — a real browser's.

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

afterEach(() => document.body.replaceChildren());

/** A list of `outer` kind holding "parent", with a list of `inner` kind under it. */
async function renderNested(
  outer: ListType,
  inner: ListType,
  published: boolean,
) {
  let editor: LexicalEditor | null = null;
  const { container, unmount } = render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );
  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;

  live.update(
    () => {
      $getRoot()
        .clear()
        .append(
          $createListNode(outer).append(
            $createListItemNode().append($createTextNode("parent")),
            $createListItemNode().append(
              $createListNode(inner).append(
                $createListItemNode().append($createTextNode("child")),
              ),
            ),
          ),
        );
    },
    { discrete: true },
  );

  if (!published) return container;

  const json = JSON.stringify(live.getEditorState().toJSON());
  unmount();
  return render(<EditorRender format="json" value={json} />).container;
}

/** An item's own text: what it reads without any list nested in it. */
function ownText(item: HTMLLIElement): string {
  const copy = item.cloneNode(true) as HTMLLIElement;
  for (const nested of copy.querySelectorAll("ul, ol")) nested.remove();
  return copy.textContent?.trim() ?? "";
}

const markerOf = (root: HTMLElement, text: string) => {
  const item = [...root.querySelectorAll("li")].find(
    (li) => ownText(li) === text,
  );
  return item ? getComputedStyle(item).listStyleType : "missing";
};

/**
 * Each kind of list counts only its own kind above it. A bullet under a
 * numbered line is the first level of bullets, so a filled dot, as in
 * Notion; a number under a bullet starts at "1." rather than "a.". A number
 * under a number still goes on to letters, so every item has an address of
 * its own ("1.a"), where Notion would show "1." twice.
 */
describe.each([
  ["the editor", false],
  ["a published page", true],
])("list markers in %s", (_where, published) => {
  test.each([
    ["a bullet under a number", "number", "bullet", "disc"],
    ["a bullet under a bullet", "bullet", "bullet", "circle"],
    ["a number under a bullet", "bullet", "number", "decimal"],
    ["a number under a number", "number", "number", "lower-alpha"],
  ] as const)("%s", async (_name, outer, inner, expected) => {
    const root = await renderNested(outer, inner, published);

    await waitFor(() => expect(markerOf(root, "child")).toBe(expected));
    expect(markerOf(root, "parent")).toBe(
      outer === "number" ? "decimal" : "disc",
    );
  });
});

/**
 * The renderer wraps a list line's text in a <p>, which took paragraph
 * spacing, so every item of a published list was taller than in the editor.
 */
test("gives a published list line no paragraph spacing", async () => {
  const root = await renderNested("number", "number", true);
  const text = [...root.querySelectorAll("li > p")];

  expect(text.length).toBeGreaterThan(0);
  for (const node of text) {
    expect(getComputedStyle(node).marginTop).toBe("0px");
    expect(getComputedStyle(node).marginBottom).toBe("0px");
  }
});
