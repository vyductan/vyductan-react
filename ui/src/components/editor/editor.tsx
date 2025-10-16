"use client";

import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import type { EditorState, SerializedEditorState } from "lexical";
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
  editorState,
  editorSerializedState,
  onChange,
  onSerializedChange,

  // forFormItem = false,
  value,
}: {
  editorState?: EditorState;
  editorSerializedState?: SerializedEditorState;
  onChange?: (editorState: EditorState) => void;
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void;

  // forFormItem?: boolean;
  value?: string;
}) {
  return (
    <div className="bg-background overflow-hidden rounded-lg border shadow">
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          ...(editorState ? { editorState } : {}),
          ...(editorSerializedState
            ? { editorState: JSON.stringify(editorSerializedState) }
            : {}),
          // // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          // ...(forFormItem ? { editorState: value || undefined } : {}),
        }}
      >
        <TooltipProvider>
          <SharedAutocompleteContext>
            <FloatingLinkContext>
              <Plugins />

              <OnChangePlugin
                ignoreSelectionChange={true}
                onChange={(editorState) => {
                  // if (forFormItem) {
                  //   onChange?.(
                  //     JSON.stringify(
                  //       editorState.toJSON(),
                  //     ) as unknown as EditorState,
                  //   );
                  // } else {
                  //   onChange?.(editorState);
                  // }
                  onChange?.(editorState);
                  onSerializedChange?.(editorState.toJSON());
                }}
              />
            </FloatingLinkContext>
          </SharedAutocompleteContext>
        </TooltipProvider>
      </LexicalComposer>
    </div>
  );
}
