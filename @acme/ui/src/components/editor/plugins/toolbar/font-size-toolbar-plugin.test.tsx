import "@testing-library/jest-dom/vitest";

import type { LexicalEditor } from "lexical";
import type * as React from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { ToolbarContext } from "../../context/toolbar-context";
import { FontSizeToolbarPlugin } from "./font-size-toolbar-plugin";

function WithToolbar({ children }: { children: React.ReactNode }) {
  const [editor] = useLexicalComposerContext();
  return (
    <ToolbarContext
      activeEditor={editor as LexicalEditor}
      blockType="paragraph"
      setBlockType={() => undefined}
      showModal={() => undefined}
    >
      {children}
    </ToolbarContext>
  );
}

// The stepper is two icon-only buttons around a number field; without names a
// screen reader announces "button, button" and every story that mounts the
// toolbar logs the Button accessible-name warning twice.
test("names the font-size stepper and its field", () => {
  render(
    <LexicalComposer
      initialConfig={{
        namespace: "FontSizeToolbarTest",
        onError: (error) => {
          throw error;
        },
      }}
    >
      <WithToolbar>
        <FontSizeToolbarPlugin />
      </WithToolbar>
    </LexicalComposer>,
  );

  expect(
    screen.getByRole("button", { name: "Decrease font size" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Increase font size" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "Font size" })).toHaveValue("16");
});
