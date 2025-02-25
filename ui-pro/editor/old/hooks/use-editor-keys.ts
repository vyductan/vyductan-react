import { useCallback, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";

import { useDraggableStore } from "../stores/use-draggable-store";

export const useEditorKeys = () => {
  const [editor] = useLexicalComposerContext();

  const { resetState } = useDraggableStore();

  const getEditorKeys = useCallback(() => {
    return editor.getEditorState().read(() => $getRoot().getChildrenKeys());
  }, [editor]);

  // We set keys on app start ...
  const [keys, setKeys] = useState<string[]>(getEditorKeys());

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      // ... and on any state change
      setKeys(getEditorKeys());
      resetState();
    });
  }, [editor, getEditorKeys, resetState]);

  return { keys };
};
