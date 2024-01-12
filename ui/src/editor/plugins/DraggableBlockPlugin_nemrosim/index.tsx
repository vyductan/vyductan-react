import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { createPortal } from "react-dom";

import { useDragListeners } from "../../hooks/useDragListeners";
import { useOnDrop } from "../../hooks/useOnDrop";
import { DraggableElement } from "./DraggableElement";
import { DraggableLine } from "./DraggableLine";
import { DRAGGABLE_WRAPPER_ID } from "./DraggableWrapper";

export const DraggableBlockPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  useDragListeners();
  useOnDrop();

  const wrapperHtmlElement = document.getElementById(DRAGGABLE_WRAPPER_ID);

  const isEditable = editor.isEditable();
  if (!isEditable || !wrapperHtmlElement) {
    return null;
  }

  return createPortal(
    <>
      <DraggableElement />
      <DraggableLine />
    </>,
    wrapperHtmlElement,
  );
};
