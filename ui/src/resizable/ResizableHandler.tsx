import * as ResizablePrimitive from "react-resizable-panels";

import { Icon } from "@vyductan/icons";
import { clsm } from "@vyductan/utils";

export const ResizableHandler = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={clsm(
      "group hover:bg-blue-500 focus:bg-blue-500",
      "relative flex w-px items-center justify-center bg-border",
      "after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2",
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
      "data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
      "data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0",
      "[&[data-panel-group-direction=vertical]>div]:rotate-90",
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div
        className={clsm(
          "absolute bottom-0 top-0 z-10 m-auto flex h-4 w-4 items-center justify-center rounded border border-border bg-gray-200",
          "group-hover:border-blue-500 group-hover:text-blue-500",
          " group-focus:border-blue-500 group-focus:text-blue-500",
        )}
      >
        <Icon icon="lucide:grip-vertical" className="h-2.5 w-2.5" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
);
