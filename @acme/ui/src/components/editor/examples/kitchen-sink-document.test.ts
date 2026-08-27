import { describe, expect, test } from "vitest";

import { normalizeEditorContent } from "../render/normalize-editor-content";
import { kitchenSinkContent, kitchenSinkValue } from "./kitchen-sink-document";

describe("kitchen sink document", () => {
  test("is accepted by the publish renderer", () => {
    // normalizeEditorContent returns null for any node it does not recognise, so
    // a wrong node shape would make the published pane silently render nothing.
    expect(normalizeEditorContent(kitchenSinkContent)).not.toBeNull();
  });

  test("round trips through the serialized form the editor consumes", () => {
    expect(normalizeEditorContent(JSON.parse(kitchenSinkValue))).toEqual(
      normalizeEditorContent(kitchenSinkContent),
    );
  });

  test("covers every block type the renderer supports", () => {
    const blockTypes = new Set(
      kitchenSinkContent.root.children.map((child) => child.type),
    );

    expect([...blockTypes].sort()).toEqual([
      "check-block",
      "code",
      "heading",
      "horizontalrule",
      "list",
      "paragraph",
      "quote",
      "table",
    ]);
  });
});
