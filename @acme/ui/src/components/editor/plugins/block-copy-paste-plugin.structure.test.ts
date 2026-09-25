import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

describe("BlockCopyPastePlugin structure", () => {
  const pluginSource = readFileSync(
    path.resolve(import.meta.dirname, "./block-copy-paste-plugin.tsx"),
    "utf8",
  );

  test("selected range copy is handled before Lexical default copy logic", () => {
    expect(pluginSource).toContain("if (!$isRangeSelection(selection)) {");
    expect(pluginSource).toContain("if (!selection.isCollapsed()) {");
    // The clipboard is filled from the selection as meant: a whole-line
    // selection that runs onto the next line's start is pulled back first.
    expect(pluginSource).toContain("$selectionForCopy(currentSelection);");
    expect(pluginSource).toContain("$getClipboardDataFromSelection(meant);");
    expect(pluginSource).toContain("setLexicalClipboardDataTransfer(");
  });

  test("selected range cut is normalized before removing the selection", () => {
    expect(pluginSource).toContain("$getClipboardDataFromSelection(meant);");
    expect(pluginSource).toContain(
      "            );\n            currentSelection.removeText();",
    );
  });
});
