import * as ResizablePrimitive from "react-resizable-panels";

type ResizablePanelProps = ResizablePrimitive.PanelProps;
function ResizablePanel({
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

export type { ResizablePanelProps };
export { ResizablePanel };
