"use client";

import type { InitialConfigType } from "@lexical/react/LexicalComposer";
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
  placeholder,
}: {
  value?: string;
  onChange?: (jsonString: string, editorState: EditorState) => void;
  placeholder?: string;
}) {
  return (
    <LexicalComposer
      initialConfig={{
        ...editorConfig,
        editorState: value,
      }}
    >
      <TooltipProvider>
        <SharedAutocompleteContext>
          <FloatingLinkContext>
            <Plugins placeholder={placeholder} />

            <OnChangePlugin
              ignoreSelectionChange={true}
              onChange={(editorState) => {
                const jsonString = JSON.stringify(editorState.toJSON());
                onChange?.(jsonString, editorState);
              }}
            />
          </FloatingLinkContext>
        </SharedAutocompleteContext>
      </TooltipProvider>
    </LexicalComposer>
  );
}
