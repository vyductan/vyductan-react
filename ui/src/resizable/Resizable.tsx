"use client";

import { Fragment } from "react";

import type { ResizablePanelProps } from "./ResizablePanel";
import type { ResizablePanelGroupProps } from "./ResizablePanelGroup";
import { ResizableHandler } from "./ResizableHandler";
import { ResizablePanel } from "./ResizablePanel";
import { ResizablePanelGroup } from "./ResizablePanelGroup";

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
            {index > 0 && <ResizableHandler withHandle />}
            <ResizablePanel {...x} />
          </Fragment>
        );
      })}
    </ResizablePanelGroup>
  );
};
