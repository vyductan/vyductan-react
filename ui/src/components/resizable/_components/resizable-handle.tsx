import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@acme/ui/lib/utils";

import { Icon } from "../../../icons";

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        "bg-border relative flex w-px items-center justify-center",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2",
        "focus-visible:ring-ring focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden",
        "data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
        "data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2",
        "[&[data-panel-group-direction=vertical]>div]:rotate-90",

        //       "group hover:bg-blue-500 focus:bg-blue-500",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div
          className={cn(
            "bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border",
            // "absolute inset-y-0 z-10 m-auto flex size-4 items-center justify-center rounded border border-border bg-gray-200",
            // "group-hover:border-blue-500 group-hover:text-blue-500",
            // "group-focus:border-blue-500 group-focus:text-blue-500",
          )}
        >
          <Icon icon="icon-[lucide--grip-vertical]" className="size-2.5" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
}

export { ResizableHandle };
