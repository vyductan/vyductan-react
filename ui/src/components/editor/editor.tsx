"use client";

import type {
  InitialConfigType,
  InitialEditorStateType,
} from "@lexical/react/LexicalComposer";
import type { EditorState } from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

import { TooltipProvider } from "../tooltip";
import { FloatingLinkContext } from "./context/floating-link-context";
import { SharedAutocompleteContext } from "./context/shared-autocomplete-context";
import { nodes } from "./nodes/nodes";
import { Plugins } from "./plugins/plugins";
import { editorTheme } from "./themes/editor-theme";

const editorConfig: InitialConfigType = {
  namespace: "Editor",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error);
  },
};

export function Editor({
  value,
  onChange,
}: {
  value?: InitialEditorStateType;
  onChange?: (editorState: EditorState) => void;
}) {
  return (
    <LexicalComposer
      initialConfig={{
        ...editorConfig,
        editorState: typeof value === "object" ? JSON.stringify(value) : value,
      }}
    >
      <TooltipProvider>
        <SharedAutocompleteContext>
          <FloatingLinkContext>
            <Plugins />

            <OnChangePlugin
              ignoreSelectionChange={true}
              onChange={(editorState) => {
                onChange?.(editorState);
              }}
            />
          </FloatingLinkContext>
        </SharedAutocompleteContext>
      </TooltipProvider>
    </LexicalComposer>
  );
}
