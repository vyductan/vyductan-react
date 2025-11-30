import { useState } from "react";
import { Button } from "@acme/ui/components/button";
import {
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from "@acme/ui/components/tooltip";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LockIcon, UnlockIcon } from "lucide-react";

export function EditModeTogglePlugin() {
  const [editor] = useLexicalComposerContext();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());

  return (
    <TooltipRoot>
      <TooltipTrigger asChild>
        <Button
          variant="text"
          onClick={() => {
            editor.setEditable(!editor.isEditable());
            setIsEditable(editor.isEditable());
          }}
          title="Read-Only Mode"
          aria-label={`${isEditable ? "Lock" : "Unlock"} read-only mode`}
          size="small"
          className="p-2"
        >
          {isEditable ? (
            <LockIcon className="size-4" />
          ) : (
            <UnlockIcon className="size-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isEditable ? "View Only Mode" : "Edit Mode"}
      </TooltipContent>
    </TooltipRoot>
  );
}
