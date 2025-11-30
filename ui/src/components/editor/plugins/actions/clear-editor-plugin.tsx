import { Button } from "@acme/ui/components/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  Dialog as DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/components/modal";
import {
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from "@acme/ui/components/tooltip";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CLEAR_EDITOR_COMMAND } from "lexical";
import { Trash2Icon } from "lucide-react";

export function ClearEditorActionPlugin() {
  const [editor] = useLexicalComposerContext();

  return (
    <DialogRoot>
      <TooltipRoot disableHoverableContent>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button size="small" variant="text" className="p-2">
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Clear Editor</TooltipContent>
      </TooltipRoot>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clear Editor</DialogTitle>
          <DialogDescription>
            Are you sure you want to clear the editor?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outlined">Cancel</Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              color="danger"
              onClick={() => {
                editor.dispatchCommand(CLEAR_EDITOR_COMMAND, void 0);
              }}
            >
              Clear
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
