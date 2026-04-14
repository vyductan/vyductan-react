import type { SerializedDocument } from "@lexical/file";
import { useEffect } from "react";
import {
  editorStateFromSerializedDocument,
  serializedDocumentFromEditorState,
} from "@lexical/file";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CLEAR_HISTORY_COMMAND } from "lexical";
import { SendIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@acme/ui/components/button";
import {
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from "@acme/ui/components/tooltip";

import { docFromHash as documentFromHash, docToHash as documentToHash } from "../../utils/doc-serialization";

async function shareDocument(document: SerializedDocument): Promise<void> {
  if (globalThis.window === undefined) {
    throw new TypeError("shareDoc can only be called on the client side");
  }

  const url = new URL(globalThis.location.toString());
  url.hash = await documentToHash(document);
  const newUrl = url.toString();
  globalThis.history.replaceState({}, "", newUrl);
  await globalThis.navigator.clipboard.writeText(newUrl);
}

export function ShareContentPlugin() {
  const [editor] = useLexicalComposerContext();
  const isClient = globalThis.window !== undefined;

  useEffect(() => {
    if (!isClient) return;

    void documentFromHash(globalThis.location.hash)
      .then((document) => {
        if (document?.source === "editor") {
          editor.setEditorState(editorStateFromSerializedDocument(editor, document));
          editor.dispatchCommand(CLEAR_HISTORY_COMMAND, void 0);
        }
      })
      .catch(() => {
        // Ignore invalid or malformed share hashes.
      });
  }, [editor, isClient]);

  return (
    <TooltipRoot>
      <TooltipTrigger asChild>
        <Button
          variant="text"
          onClick={() => {
            if (!isClient) return;

            void shareDocument(
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
