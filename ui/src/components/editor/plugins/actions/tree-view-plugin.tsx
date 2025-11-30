import type { JSX } from "react";
import { Button } from "@acme/ui/components/button";
import {
  DialogContent,
  DialogHeader,
  Dialog as DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/components/modal";
import { ScrollArea, ScrollBar } from "@acme/ui/components/scroll-area";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TreeView } from "@lexical/react/LexicalTreeView";
import { NotebookPenIcon } from "lucide-react";

export function TreeViewPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  return (
    <DialogRoot>
      <DialogTrigger asChild>
        <Button size="small" variant="text" className="p-2">
          <NotebookPenIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tree View</DialogTitle>
        </DialogHeader>
        <ScrollArea className="bg-foreground text-background h-96 overflow-hidden rounded-lg p-2">
          <TreeView
            viewClassName="tree-view-output"
            treeTypeButtonClassName="debug-treetype-button"
            timeTravelPanelClassName="debug-timetravel-panel"
            timeTravelButtonClassName="debug-timetravel-button"
            timeTravelPanelSliderClassName="debug-timetravel-panel-slider"
            timeTravelPanelButtonClassName="debug-timetravel-panel-button"
            editor={editor}
          />
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </DialogContent>
    </DialogRoot>
  );
}
