// Tabs with underline https://github.com/shadcn-ui/ui/discussions/683
"use client";

import type * as React from "react";

import { cn } from "@acme/ui/lib/utils";
import {
  TabsList as ShadcnTabsList,
  TabsTrigger as ShadcnTabsTrigger,
  Tabs,
} from "@acme/ui/shadcn/tabs";

import type { TabsType } from "./types";
import { TabsProvider, useTabsContext } from "./context";

type TabsRootProperties<TValue extends string = string> = Omit<
  React.ComponentProps<typeof Tabs>,
  "value" | "defaultValue" | "onValueChange"
> & {
  type?: TabsType;
  value?: TValue;
  defaultValue?: TValue;
  onValueChange?: (value: TValue) => void;
};
const TabsRoot = <TValue extends string = string>({
  className,
  type = "line",
  children,
  onValueChange,
  ...properties
}: TabsRootProperties<TValue>) => {
  return (
    <TabsProvider type={type}>
      <Tabs
        {...properties}
        onValueChange={onValueChange as ((value: string) => void) | undefined}
        className={cn(type === "line" && "gap-4", className)}
      >
        {children}
      </Tabs>
    </TabsProvider>
  );
};

type TabsListProperties = React.ComponentProps<typeof ShadcnTabsList> & {
  type?: TabsType;
};
function TabsList({ className, type, ...properties }: TabsListProperties) {
  const context = useTabsContext();
  const tabsType = type ?? context.type;

  return (
    <ShadcnTabsList
      className={cn(
        // type === "solid" && "h-9 w-fit justify-center",
        tabsType === "card" &&
          "bg-background-muted justify-center rounded-md p-1",
        tabsType === "line" &&
          "h-auto justify-start rounded-none border-b bg-transparent p-0 *:data-[slot=tabs-trigger]:flex-none",
        // antd
        "relative w-full",
        className,
      )}
      variant={tabsType === "line" ? "line" : "default"}
      {...properties}
    />
  );
}

type TabsTriggerProperties = React.ComponentProps<typeof ShadcnTabsTrigger> & {
  tabsType?: TabsType;
};
function TabsTrigger({
  className,
  tabsType,
  ...properties
}: TabsTriggerProperties) {
  const context = useTabsContext();
  const type = tabsType ?? context.type;

  return (
    <ShadcnTabsTrigger
      className={cn(
        // own
        // "py-3",
        type === "solid" && [],
        type === "card" && [
          "px-3",
          "rounded-sm",
          "data-[state=active]:bg-surface-secondary data-[state=active]:text-foreground data-[state=active]:shadow-xs",
          // "justify-center rounded-md bg-background-muted p-1",
        ],
        type === "line" && [
          "pt-3 pb-[11px]",
          "mx-3 h-[calc(100%+2px)] first:ml-0",
          "text-muted-foreground rounded-none bg-transparent font-semibold shadow-none transition-none",
          "hover:text-primary-hover",
          "data-[state=active]:text-primary after:bg-primary group-data-[orientation=horizontal]/tabs:after:-bottom-px data-[state=active]:shadow-none",
        ],
        className,
      )}
      {...properties}
    />
  );
}

export { TabsRoot, TabsList, TabsTrigger };
export { TabsContent } from "@acme/ui/shadcn/tabs";
export type {
  TabsRootProperties as TabsRootProps,
  TabsListProperties as TabsListProps,
  TabsTriggerProperties as TabsTriggerProps,
};
