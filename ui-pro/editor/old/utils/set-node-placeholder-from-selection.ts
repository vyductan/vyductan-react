import type { LexicalEditor } from "lexical";
import { $getSelection, $isRangeSelection } from "lexical";

import { setPlaceholderOnSelection } from "./set-placeholder-on-selection";

export const setNodePlaceholderFromSelection = (
  editor: LexicalEditor,
): void => {
  editor.getEditorState().read(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      // Do nothing if user selected node's content
      return;
    }
    setPlaceholderOnSelection({ selection, editor });
  });
};
