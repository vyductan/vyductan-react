import type { LexicalEditor, NodeKey, NodeMutation } from "lexical";
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { mergeRegister } from "@lexical/utils";
import { $getNodeByKey, $getState, ParagraphNode } from "lexical";

import { blockColorState } from "../transformers/markdown-nfm-colors-transformer";

/**
 * Shows a block's Notion color (blockColorState: `red`, `blue_bg`, …) as
 * `data-block-color` on its element; editor-theme.css colors it.
 *
 * NodeState is not rendered by the nodes themselves, so this watches the
 * three kinds that can carry one and keeps the attribute in step.
 */
export function BlockColorPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const sync = (mutations: Map<NodeKey, NodeMutation>) =>
      syncBlockColors(editor, mutations);
    return mergeRegister(
      editor.registerMutationListener(ParagraphNode, sync),
      editor.registerMutationListener(HeadingNode, sync),
      editor.registerMutationListener(QuoteNode, sync),
    );
  }, [editor]);

  return null;
}

function syncBlockColors(
  editor: LexicalEditor,
  mutations: Map<NodeKey, NodeMutation>,
) {
  editor.getEditorState().read(() => {
    for (const [key, mutation] of mutations) {
      if (mutation === "destroyed") continue;
      const element = editor.getElementByKey(key);
      const node = $getNodeByKey(key);
      if (!element || !node) continue;
      const color = $getState(node, blockColorState);
      if (color) element.dataset.blockColor = color;
      else delete element.dataset.blockColor;
    }
  });
}
