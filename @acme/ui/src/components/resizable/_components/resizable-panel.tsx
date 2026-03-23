import * as ResizablePrimitive from "react-resizable-panels";

type ResizablePanelProps = ResizablePrimitive.PanelProps;
function ResizablePanel({ ...props }: ResizablePanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

export type { ResizablePanelProps };
export { ResizablePanel };
