import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { createPortal } from "react-dom";

import { useDragListeners } from "../../hooks/use-drag-listeners";
import { useOnDrop } from "../../hooks/use-on-drop";
import { DraggableElement } from "./draggable-element";
import { DraggableLine } from "./draggable-line";
import { DRAGGABLE_WRAPPER_ID } from "./draggable-wrapper";

export const DraggableBlockPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  useDragListeners();
  useOnDrop();

  const wrapperHtmlElement = document.querySelector(
    `[id='${DRAGGABLE_WRAPPER_ID}]`,
  );

  const isEditable = editor.isEditable();
  if (!isEditable || !wrapperHtmlElement) {
    return;
  }

  return createPortal(
    <>
      <DraggableElement />
      <DraggableLine />
    </>,
    wrapperHtmlElement,
  );
};
