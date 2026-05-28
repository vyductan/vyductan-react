"use client";

import { Fragment } from "react";

import type { ResizablePanelProps as ResizablePanelProperties } from "./_components/resizable-panel";
import type { ResizablePanelGroupProps as ResizablePanelGroupProperties } from "./_components/resizable-panel-group";
import { ResizableHandle } from "./_components/resizable-handle";
import { ResizablePanel } from "./_components/resizable-panel";
import { ResizablePanelGroup } from "./_components/resizable-panel-group";

export type ResizableItems = ResizablePanelProperties[];
export type ResizableProps = ResizablePanelGroupProperties & {
  items: ResizableItems;
};
export const Resizable = ({
  orientation,
  items,
  ...properties
}: ResizableProps) => {
  return (
    <ResizablePanelGroup orientation={orientation} {...properties}>
      {items.map((x, index) => {
        return (
          <Fragment key={index}>
            {index > 0 && <ResizableHandle withHandle />}
            <ResizablePanel {...x} />
          </Fragment>
        );
      })}
    </ResizablePanelGroup>
  );
};
