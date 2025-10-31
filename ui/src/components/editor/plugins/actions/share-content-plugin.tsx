/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable unicorn/prefer-type-error */
/* eslint-disable unicorn/prefer-global-this */
import type { SerializedDocument } from "@lexical/file";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  editorStateFromSerializedDocument,
  serializedDocumentFromEditorState,
} from "@lexical/file";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CLEAR_HISTORY_COMMAND } from "lexical";
import { SendIcon } from "lucide-react";
import { toast } from "sonner";

import { docFromHash, docToHash } from "../../utils/doc-serialization";

async function shareDoc(doc: SerializedDocument): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("shareDoc can only be called on the client side");
  }

  const url = new URL(globalThis.location.toString());
  url.hash = await docToHash(doc);
  const newUrl = url.toString();
  globalThis.history.replaceState({}, "", newUrl);
  await globalThis.navigator.clipboard.writeText(newUrl);
}

export function ShareContentPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    void docFromHash(globalThis.location.hash).then((doc) => {
      if (doc?.source === "editor") {
        editor.setEditorState(editorStateFromSerializedDocument(editor, doc));
        editor.dispatchCommand(CLEAR_HISTORY_COMMAND, void 0);
      }
    });
  }, [editor, isClient]);

  return (
    <TooltipRoot>
      <TooltipTrigger asChild>
        <Button
          variant="text"
          onClick={() => {
            if (!isClient) return;

            shareDoc(
              serializedDocumentFromEditorState(editor.getEditorState(), {
                source: "editor",
              }),
            ).then(
              () => toast.success("URL copied to clipboard"),
              () => toast.error("URL could not be copied to clipboard"),
            );
          }}
          title="Share"
          aria-label="Share Playground link to current editor state"
          size="small"
          className="p-2"
        >
          <SendIcon className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Share Content</TooltipContent>
    </TooltipRoot>
  );
}
