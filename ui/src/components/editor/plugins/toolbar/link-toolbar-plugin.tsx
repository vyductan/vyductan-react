import type { BaseSelection } from "lexical";
import { useCallback, useEffect, useState } from "react";
import { Toggle } from "@acme/ui/components/toggle";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  $isRangeSelection,
  COMMAND_PRIORITY_NORMAL,
  KEY_MODIFIER_COMMAND,
} from "lexical";
import { LinkIcon } from "lucide-react";

import { useFloatingLinkContext } from "../../context/floating-link-context";
import { useToolbarContext } from "../../context/toolbar-context";
import { useUpdateToolbarHandler } from "../../editor-hooks/use-update-toolbar";
import { getSelectedNode } from "../../utils/get-selected-node";
import { sanitizeUrl } from "../../utils/url";

export function LinkToolbarPlugin() {
  const { activeEditor } = useToolbarContext();
  const { setIsLinkEditMode } = useFloatingLinkContext();
  const [isLink, setIsLink] = useState(false);

  const $updateToolbar = (selection: BaseSelection) => {
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
    }
  };

  useUpdateToolbarHandler($updateToolbar);

  useEffect(() => {
    return activeEditor.registerCommand(
      KEY_MODIFIER_COMMAND,
      (payload) => {
        const event: KeyboardEvent = payload;
        const { code, ctrlKey, metaKey } = event;

        if (code === "KeyK" && (ctrlKey || metaKey)) {
          event.preventDefault();
          let url: string | null;
          if (isLink) {
            setIsLinkEditMode(false);
            url = null;
          } else {
            setIsLinkEditMode(true);
            url = sanitizeUrl("https://");
          }
          return activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
        }
        return false;
      },
      COMMAND_PRIORITY_NORMAL,
    );
  }, [activeEditor, isLink, setIsLinkEditMode]);

  const insertLink = useCallback(() => {
    if (isLink) {
      setIsLinkEditMode(false);
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    } else {
      setIsLinkEditMode(true);
      activeEditor.dispatchCommand(
        TOGGLE_LINK_COMMAND,
        sanitizeUrl("https://"),
      );
    }
  }, [activeEditor, isLink, setIsLinkEditMode]);

  return (
    <Toggle
      size={"sm"}
      variant={"outline"}
      aria-label="Toggle link"
      onClick={insertLink}
    >
      <LinkIcon className="h-4 w-4" />
    </Toggle>
  );
}
