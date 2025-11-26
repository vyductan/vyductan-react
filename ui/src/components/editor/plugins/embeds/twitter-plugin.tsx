/**
 * Twitter Plugin
 * 
 * Plugin để embed Twitter tweets vào Lexical editor
 */

import type { LexicalCommand } from "lexical";
import type { JSX } from "react";
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import { COMMAND_PRIORITY_EDITOR, createCommand } from "lexical";

import {
  $createTwitterNode,
  TwitterNode,
} from "../../nodes/embeds/twitter-node";

export const INSERT_TWITTER_COMMAND: LexicalCommand<string> = createCommand(
  "INSERT_TWITTER_COMMAND",
);

export function TwitterPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([TwitterNode])) {
      throw new Error("TwitterPlugin: TwitterNode not registered on editor");
    }

    return editor.registerCommand<string>(
      INSERT_TWITTER_COMMAND,
      (payload) => {
        const twitterNode = $createTwitterNode(payload);
        $insertNodeToNearestRoot(twitterNode);

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}

