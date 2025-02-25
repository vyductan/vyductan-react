import { useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { DRAGGABLE_KEY } from "../constants";
import { draggableStore } from "../stores/use-draggable-store";
import { isHTMLElement } from "../utils/guard";

export const useOnDragEnter = () => {
  const [editor] = useLexicalComposerContext();

  const handleOnDragEnter = useCallback(
    (event: DragEvent): boolean => {
      // Without this drop will not work;
      event.preventDefault();

      const target = event.currentTarget;

      if (!isHTMLElement(target)) {
        console.error("[On drag enter] CurrentTarget is not Html element");
        return false;
      }

      // Use key-value that we set before in the "listeners" hook.
      const key = target.getAttribute(DRAGGABLE_KEY);

      if (key) {
        console.log(`Lexical node key is ${key}`);
      } else {
        return false;
      }

      const element = editor.getElementByKey(key);

      if (!isHTMLElement(element)) {
        console.error("[handleOnDragEnter] element is not HTMLElement");
        return false;
      }

      const coordinates = element.getBoundingClientRect();

      draggableStore.getState().setLine({
        htmlElement: element,
        data: {
          top: coordinates.top,
          left: coordinates.left,
          height: coordinates.height,
          width: coordinates.width,
        },
      });

      return true;
    },
    [editor],
  );

  return { handleOnDragEnter };
};
