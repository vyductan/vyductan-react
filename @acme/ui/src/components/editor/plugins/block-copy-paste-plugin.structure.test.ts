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
    expect(pluginSource).toContain(
      "const clipboardData = $getClipboardDataFromSelection(currentSelection);",
    );
    expect(pluginSource).toContain(
      "setLexicalClipboardDataTransfer(event.clipboardData, clipboardData);",
    );
  });

  test("selected range cut is normalized before removing the selection", () => {
    expect(pluginSource).toContain(
      "const clipboardData = $getClipboardDataFromSelection(currentSelection);",
    );
    expect(pluginSource).toContain(
      "setLexicalClipboardDataTransfer(event.clipboardData, clipboardData);\n            currentSelection.removeText();",
    );
  });
});
