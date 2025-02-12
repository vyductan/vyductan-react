import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { COMMAND_PRIORITY_LOW, DRAGOVER_COMMAND } from "lexical";

import { DRAGGABLE_KEY } from "../constants";
import { draggableStore } from "../stores/use-draggable-store";
import { isHTMLElement } from "../utils/guard";
import { useEditorKeys } from "./use-editor-keys";
import { useOnDragEnter } from "./use-on-drag-enter";

export const useDragListeners = () => {
  const [editor] = useLexicalComposerContext();
  const { handleOnDragEnter } = useOnDragEnter();

  // Get editor node keys (code is below)
  const { keys } = useEditorKeys();

  useEffect(() => {
    const addListeners = () => {
      for (const key of keys) {
        // Get HTML element by node "key"
        const htmlElement = editor.getElementByKey(key);

        if (!htmlElement) {
          console.warn("[useDragListeners] No html element");
          continue;
        }

        htmlElement.setAttribute(DRAGGABLE_KEY, key);

        // NOTE: Don't use "mouseover"/"mousemove" because then it will be triggered on children too!
        htmlElement.addEventListener("mouseenter", setDraggableElement);

        // We need "dragenter" with "DRAGOVER_COMMAND" because:
        // 1. target on "dragenter" -> current html element;
        // 2. target on "DRAGOVER_COMMAND" -> editable container;
        // 3. without "DRAGOVER_COMMAND" -> "DROP_COMMAND" will not work;
        htmlElement.addEventListener("dragenter", handleOnDragEnter);

        // event listeners will be added later ...
      }
    };
    addListeners();

    const removeListeners = () => {
      for (const key of keys) {
        const htmlElement = editor.getElementByKey(key);

        if (!htmlElement) {
          console.warn("[useDragListeners] No html element");
          continue;
        }

        htmlElement.removeEventListener("mouseenter", setDraggableElement);
        htmlElement.removeEventListener("dragenter", handleOnDragEnter);
      }
    };
    return () => {
      removeListeners();
    };
  }, [editor, handleOnDragEnter, keys]);

  useEffect(() => {
    // We need to register for drop to work with "dragenter" event
    // Without overriding this command "DROP_COMMAND" will not be triggered
    editor.registerCommand(
      DRAGOVER_COMMAND,
      (event) => handleOnDragEnter(event),
      COMMAND_PRIORITY_LOW,
    );
  }, [editor, handleOnDragEnter]);
};

const setDraggableElement = ({ target }: MouseEvent) => {
  if (!isHTMLElement(target)) {
    console.warn("[callback] target is not HTMLElement");
    return;
  }

  const coordinates = target.getBoundingClientRect();

  draggableStore.getState().setDraggable({
    htmlElement: target,
    data: {
      top: coordinates.top,
      left: coordinates.left,
      height: coordinates.height,
    },
  });
};
