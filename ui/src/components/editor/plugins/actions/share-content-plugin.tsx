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

import { Button } from "@acme/ui/button";
import { TooltipContent, TooltipRoot, TooltipTrigger } from "@acme/ui/tooltip";

import { docFromHash, docToHash } from "../../utils/doc-serialization";

async function shareDoc(doc: SerializedDocument): Promise<void> {
  const url = new URL(globalThis.location.toString());
  url.hash = await docToHash(doc);
  const newUrl = url.toString();
  globalThis.history.replaceState({}, "", newUrl);
  await globalThis.navigator.clipboard.writeText(newUrl);
}

export function ShareContentPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    void docFromHash(globalThis.location.hash).then((doc) => {
      if (doc && doc.source === "editor") {
        editor.setEditorState(editorStateFromSerializedDocument(editor, doc));
        editor.dispatchCommand(CLEAR_HISTORY_COMMAND, void 0);
      }
    });
  }, [editor]);

  return (
    <TooltipRoot>
      <TooltipTrigger asChild>
        <Button
          variant={"ghost"}
          onClick={() =>
            shareDoc(
              serializedDocumentFromEditorState(editor.getEditorState(), {
                source: "editor",
              }),
            ).then(
              () => toast.success("URL copied to clipboard"),
              () => toast.error("URL could not be copied to clipboard"),
            )
          }
          title="Share"
          aria-label="Share Playground link to current editor state"
          size={"sm"}
          className="p-2"
        >
          <SendIcon className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Share Content</TooltipContent>
    </TooltipRoot>
  );
}
