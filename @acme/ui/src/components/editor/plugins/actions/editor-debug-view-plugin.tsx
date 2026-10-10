import type { JSX } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TreeView } from "@lexical/react/LexicalTreeView";

import { ScrollArea, ScrollBar } from "@acme/ui/components/scroll-area";

export function EditorDebugViewPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  return (
    <div className="mt-4 border-t border-border">
      <div className="bg-muted px-2 py-1 text-sm font-medium text-muted-foreground">
        Editor Debug View
      </div>
      <ScrollArea className="h-96 overflow-hidden rounded-b-lg bg-foreground p-2 text-background">
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
    </div>
  );
}
