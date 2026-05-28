import * as ResizablePrimitive from "react-resizable-panels";

type ResizablePanelProperties = ResizablePrimitive.PanelProps;
function ResizablePanel({ ...properties }: ResizablePanelProperties) {
  return (
    <ResizablePrimitive.Panel data-slot="resizable-panel" {...properties} />
  );
}

export type { ResizablePanelProperties as ResizablePanelProps };
export { ResizablePanel };
