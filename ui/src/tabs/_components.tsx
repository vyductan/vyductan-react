// Tabs with underline https://github.com/shadcn-ui/ui/discussions/683
"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import type { TabsType } from "./types";
import { cn } from "..";

type TabsRootProps = React.ComponentProps<typeof TabsPrimitive.Root>;
function TabsRoot({ className, ...props }: TabsRootProps) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List> & {
  type?: TabsType;
};
function TabsList({ className, type = "line", ...props }: TabsListProps) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex items-center rounded-lg p-1",
        type === "solid" && "h-9 w-fit justify-center",
        // own
        type === "card" && "bg-background-muted justify-center rounded-md p-1",
        type === "line" &&
          "h-10 justify-start rounded-none border-b bg-transparent p-0",
        // antd
        "relative w-full",
        className,
      )}
      {...props}
    />
  );
}

type TabsTriggerProps = React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  tabsType?: TabsType;
};
function TabsTrigger({
  className,
  tabsType = "line",
  ...props
}: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-2 text-sm font-medium whitespace-nowrap transition-[color,box-shadow]",
        // "py-1",
        "ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50",
        "focus-visible:ring-4 focus-visible:outline-1",
        "disabled:pointer-events-none disabled:opacity-50",
        "aria-invalid:focus-visible:ring-0",
        "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // own
        "py-3",
        tabsType === "solid" && [],
        tabsType === "card" && [
          "px-3",
          "rounded-sm",
          "data-[state=active]:bg-surface-secondary data-[state=active]:text-foreground data-[state=active]:shadow-xs",
          // "justify-center rounded-md bg-background-muted p-1",
        ],
        tabsType === "line" && [
          "mx-3 h-10 first:ml-0",
          "text-muted-foreground relative rounded-none border-b-2 border-b-transparent bg-transparent font-semibold shadow-none transition-none",
          "data-[state=active]:text-foreground data-[state=active]:border-b-primary data-[state=active]:shadow-none",
        ],
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "flex-1 transition-[color,box-shadow]",
        "ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50",
        "focus-visible:ring-4 focus-visible:outline-1",
        "aria-invalid:focus-visible:ring-0",
        className,
      )}
      {...props}
    />
  );
}

export { TabsRoot, TabsList, TabsTrigger, TabsContent };
export type { TabsRootProps, TabsListProps, TabsTriggerProps };
