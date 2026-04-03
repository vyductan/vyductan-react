import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@acme/ui/lib/utils";

type ResizablePanelGroupProps = ResizablePrimitive.GroupProps;

function ResizablePanelGroup({
  className,
  ...props
}: ResizablePanelGroupProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full aria-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  );
}
export type { ResizablePanelGroupProps };
export { ResizablePanelGroup };
