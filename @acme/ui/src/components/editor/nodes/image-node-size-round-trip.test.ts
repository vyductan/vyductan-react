import type { ParagraphNode } from "lexical";
import { createHeadlessEditor } from "@lexical/headless";
import { $getRoot, $createParagraphNode } from "lexical";
import { describe, expect, test } from "vitest";

import { $createImageNode, ImageNode } from "./image-node";

/*
 * An image saved at its natural size has to come back at its natural size.
 *
 * `__width`/`__height` are `"inherit" | number`, and exportJSON spells
 * "inherit" as 0 because the serialized shape is numeric. Nothing translated
 * that 0 back on the way in, so the reloaded node carried a literal 0 and the
 * browser drew the image 0x0 — present in the DOM, fully loaded, invisible.
 *
 * On a task body that reads as lost work: the text is there, the screenshot
 * that explained it is not.
 */

const makeEditor = () =>
  createHeadlessEditor({
    nodes: [ImageNode],
    onError: (error) => {
      throw error;
    },
  });

const roundTrip = (payload: { width?: number; height?: number }) => {
  const editor = makeEditor();
  let exported: Record<string, unknown> = {};
  editor.update(
    () => {
      const paragraph = $createParagraphNode();
      paragraph.append(
        $createImageNode({ altText: "a screenshot", src: "data:image/png;base64,AAAA", ...payload }),
      );
      $getRoot().append(paragraph);
    },
    { discrete: true },
  );
  editor.read(() => {
    exported = JSON.parse(JSON.stringify(editor.getEditorState().toJSON())) as Record<string, unknown>;
  });

  const reloaded = makeEditor();
  reloaded.setEditorState(reloaded.parseEditorState(exported as never));
  let node: ImageNode | null = null;
  reloaded.read(() => {
    node =
      $getRoot().getFirstChild<ParagraphNode>()?.getFirstChild<ImageNode>() ??
      null;
  });
  return node as unknown as ImageNode;
};

describe("image size survives a save and reload", () => {
  test("an unsized image comes back unsized, not zero-sized", () => {
    const node = roundTrip({});

    // 0 is how exportJSON spells "inherit"; reading it back as a real 0 is the
    // bug — it renders the image at 0x0.
    expect(node.__width).toBe("inherit");
    expect(node.__height).toBe("inherit");
  });

  test("a resized image keeps the size it was given", () => {
    const node = roundTrip({ width: 320, height: 240 });

    expect(node.__width).toBe(320);
    expect(node.__height).toBe(240);
  });
});
