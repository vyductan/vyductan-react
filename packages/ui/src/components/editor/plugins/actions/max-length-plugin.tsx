/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type { EditorState } from "lexical";
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $trimTextContentFromAnchor } from "@lexical/selection";
import { $restoreEditorState } from "@lexical/utils";
import { $getSelection, $isRangeSelection, RootNode } from "lexical";

export function MaxLengthPlugin({ maxLength }: { maxLength: number }): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    let lastRestoredEditorState: EditorState | null = null;

    return editor.registerNodeTransform(RootNode, (rootNode: RootNode) => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
        return;
      }
      const previousEditorState = editor.getEditorState();
      const previousTextContentSize = previousEditorState.read(() =>
        rootNode.getTextContentSize(),
      );
      const textContentSize = rootNode.getTextContentSize();
      if (previousTextContentSize !== textContentSize) {
        const delCount = textContentSize - maxLength;
        const anchor = selection.anchor;

        if (delCount > 0) {
          // Restore the old editor state instead if the last
          // text content was already at the limit.
          if (
            previousTextContentSize === maxLength &&
            lastRestoredEditorState !== previousEditorState
          ) {
            lastRestoredEditorState = previousEditorState;
            $restoreEditorState(editor, previousEditorState);
          } else {
            $trimTextContentFromAnchor(editor, anchor, delCount);
          }
        }
      }
    });
  }, [editor, maxLength]);

  return null;
}
