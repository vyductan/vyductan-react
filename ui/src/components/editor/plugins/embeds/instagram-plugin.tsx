/**
 * Instagram Plugin
 * 
 * Plugin để embed Instagram posts vào Lexical editor
 */

import type { LexicalCommand } from "lexical";
import type { JSX } from "react";
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import { COMMAND_PRIORITY_EDITOR, createCommand } from "lexical";

import {
  $createInstagramNode,
  InstagramNode,
} from "../../nodes/embeds/instagram-node";

export const INSERT_INSTAGRAM_COMMAND: LexicalCommand<string> = createCommand(
  "INSERT_INSTAGRAM_COMMAND",
);

export function InstagramPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([InstagramNode])) {
      throw new Error("InstagramPlugin: InstagramNode not registered on editor");
    }

    return editor.registerCommand<string>(
      INSERT_INSTAGRAM_COMMAND,
      (payload) => {
        const instagramNode = $createInstagramNode(payload);
        $insertNodeToNearestRoot(instagramNode);

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}

