/**
 * Table of Contents Plugin
 *
 * Plugin để insert Table of Contents vào Lexical editor
 * Tự động extract headings và tạo TOC
 */

import type { LexicalCommand } from "lexical";
import type { JSX } from "react";
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement } from "@lexical/utils";
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
} from "lexical";

import { $createTOCNode, TOCNode } from "../nodes/toc-node";

export const INSERT_TOC_COMMAND: LexicalCommand<void> =
  createCommand("INSERT_TOC_COMMAND");

export function TOCPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([TOCNode])) {
      throw new Error("TOCPlugin: TOCNode not registered on editor");
    }

    return editor.registerCommand(
      INSERT_TOC_COMMAND,
      () => {
        const tocNode = $createTOCNode();
        $insertNodes([tocNode]);
        if ($isRootOrShadowRoot(tocNode.getParentOrThrow())) {
          $wrapNodeInElement(tocNode, $createParagraphNode).selectEnd();
        }

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}
