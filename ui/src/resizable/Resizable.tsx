import type { ResizablePanelProps } from "./ResizablePanel";
import { ResizableHandler } from "./ResizableHandler";
import { ResizablePanel } from "./ResizablePanel";
import { ResizablePanelGroup } from "./ResizablePanelGroup";

export type ResizableItems = ResizablePanelProps[];
export type ResizableProps = {
  direction: "horizontal" | "vertical";
  items: ResizableItems;
};
export const Resizable = ({ direction, items }: ResizableProps) => {
  return (
    <ResizablePanelGroup direction={direction}>
      {items.map((x, idx) => {
        return (
          <>
            {idx > 0 && <ResizableHandler withHandle />}
            <ResizablePanel {...x} />
          </>
        );
      })}
    </ResizablePanelGroup>
  );
};
