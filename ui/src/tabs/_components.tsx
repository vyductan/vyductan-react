"use client";

import type { TabsListProps as RdxTabsListProps } from "@radix-ui/react-tabs";
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import type { TabsType } from "./types";
import { clsm } from "..";

type TabsRootProps = React.ComponentProps<typeof TabsPrimitive.Root>;
type TabsRootRef = React.ElementRef<typeof TabsPrimitive.Root>;
const TabsRoot = TabsPrimitive.Root;

type TabsListProps = RdxTabsListProps & {
  type?: TabsType;
};
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ type, className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={clsm(
      "flex-nowrap overflow-x-scroll text-foreground-muted",
      "flex items-baseline",
      type === "secondary" &&
        "justify-center rounded-md bg-background-muted p-1",
      type === undefined && [
        "pb-px",
        // "shadow-[0_-1px_0_var(--gray-300)_inset]",
      ],
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

type TabsTriggerProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Trigger
> & {
  tabsType?: TabsType;
};
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ tabsType, className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={clsm(
      "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      "py-3",
      tabsType === "secondary" && [
        "px-3",
        "rounded-sm",
        "data-[state=active]:bg-surface-secondary data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        // "justify-center rounded-md bg-background-muted p-1",
      ],
      tabsType === undefined && [
        "mx-3 first:ml-0",
        "border-b-2 border-transparent",
        "data-[state=active]:border-gray-950 data-[state=active]:text-foreground",
        // "pb-px",
        // "shadow-[0_-1px_0_var(--gray-300)_inset]",
      ],
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={clsm(
      "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { TabsRoot, TabsList, TabsTrigger, TabsContent };
export type { TabsRootProps, TabsRootRef, TabsListProps, TabsTriggerProps };
