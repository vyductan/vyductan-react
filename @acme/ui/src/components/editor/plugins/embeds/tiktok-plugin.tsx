/**
 * TikTok Plugin
 *
 * Plugin to embed TikTok videos in the Lexical editor
 */

import type { LexicalCommand } from "lexical";
import type { JSX } from "react";
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import { COMMAND_PRIORITY_EDITOR, createCommand } from "lexical";

import { $createTikTokNode, TikTokNode } from "../../nodes/embeds/tiktok-node";

export const INSERT_TIKTOK_COMMAND: LexicalCommand<{
  videoId: string;
  username?: string;
}> = createCommand("INSERT_TIKTOK_COMMAND");

export function TikTokPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([TikTokNode])) {
      throw new Error("TikTokPlugin: TikTokNode not registered on editor");
    }

    return editor.registerCommand<{ videoId: string; username?: string }>(
      INSERT_TIKTOK_COMMAND,
      (payload) => {
        const tiktokNode = $createTikTokNode(payload.videoId, payload.username);
        $insertNodeToNearestRoot(tiktokNode);

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}
