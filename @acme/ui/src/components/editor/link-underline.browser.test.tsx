import type { LexicalEditor } from "lexical";
import * as React from "react";
import { $createLinkNode } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { render, waitFor } from "@testing-library/react";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { afterEach, expect, test } from "vitest";

import { Editor } from "./editor";

// Computed decoration only resolves in a real browser.

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

async function renderLink() {
  let editor: LexicalEditor | null = null;

  render(
    <Editor autoFocus={false}>
      <EditorRefPlugin onReady={(next) => (editor = next)} />
    </Editor>,
  );

  await waitFor(() => expect(editor).not.toBeNull());
  const live = editor as unknown as LexicalEditor;

  live.update(() => {
    const root = $getRoot();
    root.clear();
    const link = $createLinkNode("mailto:tanvy@gmail.com").append(
      $createTextNode("tanvy@gmail.com"),
    );
    root.append($createParagraphNode().append(link));
  });

  return waitFor(() => {
    const node = document.querySelector<HTMLAnchorElement>(
      '[contenteditable="true"] a',
    );
    expect(node).not.toBeNull();
    return node!;
  });
}

/**
 * The alpha of a computed color. Chrome reports a fraction of `currentColor`
 * as `oklab(L a b / alpha)`, an older color as `rgba(r, g, b, alpha)`, and an
 * opaque one with no alpha at all.
 */
function alphaOf(color: string): number {
  const slash = /\/\s*([\d.]+)(%?)\s*\)$/.exec(color);
  if (slash) {
    const value = Number(slash[1]);
    return slash[2] === "%" ? value / 100 : value;
  }
  const rgba = /^rgba\((?:[^,]+,){3}\s*([\d.]+)\)$/.exec(color);
  return rgba ? Number(rgba[1]) : 1;
}

/**
 * A link's underline was drawn at full strength in the text color, a heavy
 * black rule under every linked address — heavier still under a code chip.
 * Notion draws it thin and faint; the link is marked, not shouted.
 */
test("draws a link's underline faint and thin", async () => {
  const link = await renderLink();
  const style = getComputedStyle(link);

  expect(style.textDecorationLine).toContain("underline");
  expect(alphaOf(style.textDecorationColor)).toBeLessThan(0.6);
  expect(Number.parseFloat(style.textDecorationThickness)).toBeLessThanOrEqual(
    1,
  );
});

/**
 * Still the text's own color, only fainter: the link takes its color from the
 * page it lands on, so the underline must not bring one of its own.
 */
test("keeps the underline in the text's own color", async () => {
  const link = await renderLink();
  const style = getComputedStyle(link);

  // Canvas answers "#rrggbb" for an opaque color and "rgba(...)" otherwise,
  // so reduce both to their channels before comparing.
  const probe = document.createElement("canvas").getContext("2d")!;
  const opaque = (color: string) => {
    probe.fillStyle = "#000";
    probe.fillStyle = color;
    const resolved = probe.fillStyle;
    if (resolved.startsWith("#")) {
      return [1, 3, 5].map((index) =>
        Number.parseInt(resolved.slice(index, index + 2), 16),
      );
    }
    return resolved
      .replace(/^rgba?\(|\)$/g, "")
      .split(",")
      .slice(0, 3)
      .map((channel) => Number(channel.trim()));
  };

  expect(opaque(style.textDecorationColor)).toStrictEqual(opaque(style.color));
});
