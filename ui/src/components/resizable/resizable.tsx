"use client";

import { Fragment } from "react";

import type { ResizablePanelProps } from "./_components/resizable-panel";
import type { ResizablePanelGroupProps } from "./_components/resizable-panel-group";
import { ResizableHandle } from "./_components/resizable-handle";
import { ResizablePanel } from "./_components/resizable-panel";
import { ResizablePanelGroup } from "./_components/resizable-panel-group";

export type ResizableItems = ResizablePanelProps[];
export type ResizableProps = ResizablePanelGroupProps & {
  items: ResizableItems;
};
export const Resizable = ({ direction, items, ...props }: ResizableProps) => {
  return (
    <ResizablePanelGroup direction={direction} {...props}>
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
