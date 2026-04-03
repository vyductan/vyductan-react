import type { JSX } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TreeView } from "@lexical/react/LexicalTreeView";

import { ScrollArea, ScrollBar } from "@acme/ui/components/scroll-area";

export function EditorDebugViewPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  return (
    <div className="border-border mt-4 border-t">
      <div className="text-muted-foreground bg-muted px-2 py-1 text-sm font-medium">
        Editor Debug View
      </div>
      <ScrollArea className="bg-foreground text-background h-96 overflow-hidden rounded-b-lg p-2">
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
