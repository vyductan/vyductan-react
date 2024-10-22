import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@acme/ui";

export type ResizablePanelGroupProps = React.ComponentProps<
  typeof ResizablePrimitive.PanelGroup
>;
export const ResizablePanelGroup = ({
  className,
  ...props
}: ResizablePanelGroupProps) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      "flex size-full data-[panel-group-direction=vertical]:flex-col",
      className,
    )}
    {...props}
  />
);
