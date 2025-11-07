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

type TabsRootProps = React.ComponentProps<typeof Tabs> & {
  type?: TabsType;
};
const TabsRoot = ({
  className,
  type = "line",
  children,
  ...props
}: TabsRootProps) => {
  return (
    <TabsProvider type={type}>
      <Tabs {...props} className={cn(type === "line" && "gap-4", className)}>
        {children}
      </Tabs>
    </TabsProvider>
  );
};

type TabsListProps = React.ComponentProps<typeof ShadcnTabsList> & {
  type?: TabsType;
};
function TabsList({ className, type, ...props }: TabsListProps) {
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
      {...props}
    />
  );
}

type TabsTriggerProps = React.ComponentProps<typeof ShadcnTabsTrigger> & {
  tabsType?: TabsType;
};
function TabsTrigger({ className, tabsType, ...props }: TabsTriggerProps) {
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
          "text-muted-foreground rounded-none border-b-2 border-b-transparent bg-transparent font-semibold shadow-none transition-none",
          "hover:text-primary-400",
          "data-[state=active]:text-primary-500 data-[state=active]:border-b-primary-500 data-[state=active]:shadow-none",
        ],
        className,
      )}
      {...props}
    />
  );
}

export { TabsRoot, TabsList, TabsTrigger };
export { TabsContent } from "@acme/ui/shadcn/tabs";
export type { TabsRootProps, TabsListProps, TabsTriggerProps };
