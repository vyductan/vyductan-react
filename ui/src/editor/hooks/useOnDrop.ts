import { useCallback, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, COMMAND_PRIORITY_HIGH, DROP_COMMAND } from "lexical";

import { DRAGGABLE_KEY } from "../constants";
import { draggableStore } from "../stores/useDraggableStore";

export const useOnDrop = () => {
  const [editor] = useLexicalComposerContext();

  const handleOnDrop = useCallback((): boolean => {
    const lineElement = draggableStore.getState().line?.htmlElement;
    const draggableElement = draggableStore.getState().draggable?.htmlElement;

    const draggableKey = draggableElement?.getAttribute(DRAGGABLE_KEY);
    if (!draggableKey) {
      console.error("NO DRAGGABLE KEY");
      return false;
    }

    const closestToLineElementKey = lineElement?.getAttribute(DRAGGABLE_KEY);
    if (!closestToLineElementKey) {
      console.error("[ON DROP] no closestToLineElementKey");
      return false;
    }

    const lineLexicalNode = $getNodeByKey(closestToLineElementKey);

    const draggableLexicalNode = $getNodeByKey(draggableKey);
    if (!draggableLexicalNode) {
      console.error("NO DRAGGABLE ELEMENT FOUND");
      return false;
    }

    // Inserts a node after this LexicalNode (as the next sibling).
    lineLexicalNode?.insertAfter(draggableLexicalNode);

    return true;
  }, []);

  useEffect(() => {
    // THIS EVENT WILL BE TRIGGERED ON DROP IN EDITOR
    editor.registerCommand(
      DROP_COMMAND,
      () => {
        return handleOnDrop();
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor, handleOnDrop]);

  return { handleOnDrop };
};
