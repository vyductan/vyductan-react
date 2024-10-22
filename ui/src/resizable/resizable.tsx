"use client";

import { Fragment } from "react";

import type { ResizablePanelProps } from "./resizable-panel";
import type { ResizablePanelGroupProps } from "./resizable-panel-group";
import { ResizableHandler } from "./resizable-handler";
import { ResizablePanel } from "./resizable-panel";
import { ResizablePanelGroup } from "./resizable-panel-group";

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
