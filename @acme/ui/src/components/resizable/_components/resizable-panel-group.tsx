import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@acme/ui/lib/utils";

type ResizablePanelGroupProperties = ResizablePrimitive.GroupProps;

function ResizablePanelGroup({
  className,
  ...properties
}: ResizablePanelGroupProperties) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full aria-[orientation=vertical]:flex-col",
        className,
      )}
      {...properties}
    />
  );
}
export type { ResizablePanelGroupProperties as ResizablePanelGroupProps };
export { ResizablePanelGroup };
