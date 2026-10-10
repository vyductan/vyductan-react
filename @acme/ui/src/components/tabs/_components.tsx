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
  "value" | "defaultValue" | "onValueChange" | "onChange"
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
        className={cn(
          (type === "line" || type === "card") && "gap-4",
          className,
        )}
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
          "justify-start gap-0.5 rounded-none bg-transparent p-0 shadow-[inset_0_-1px_0_var(--border)] group-data-[orientation=horizontal]/tabs:h-auto *:data-[slot=tabs-trigger]:flex-none",
        tabsType === "line" &&
          "h-auto justify-start rounded-none bg-transparent p-0 shadow-[inset_0_-1px_0_var(--border)] *:data-[slot=tabs-trigger]:flex-none",
        // Too many tabs for the width: scroll the bar itself. Without this the
        // bar overflows and focusing a clipped trigger scrolls the page instead.
        // The bottom rule is an inset shadow, not border-b, because overflow
        // clips at the padding box and would hide an indicator drawn over a border.
        (tabsType === "line" || tabsType === "card") &&
          "no-scrollbar overflow-x-auto overflow-y-hidden",
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
          "h-auto rounded-none rounded-t-lg px-4 py-2",
          "border-border bg-muted text-muted-foreground",
          "hover:text-primary-hover",
          "data-[state=active]:border-b-transparent data-[state=active]:bg-background data-[state=active]:text-primary group-data-[variant=default]/tabs-list:data-[state=active]:shadow-none",
          "dark:data-[state=active]:border-border dark:data-[state=active]:border-b-transparent dark:data-[state=active]:bg-background",
        ],
        type === "line" && [
          "pt-3 pb-[11px]",
          "mx-3 h-[calc(100%+2px)] first:ml-0",
          "rounded-none bg-transparent font-semibold text-muted-foreground shadow-none transition-none",
          "hover:text-primary-hover",
          "after:bg-primary group-data-[orientation=horizontal]/tabs:after:bottom-0 data-[state=active]:text-primary data-[state=active]:shadow-none",
        ],
        // The list scrolls (overflow clips), so draw the focus ring and
        // outline inside the trigger or their top and bottom get cut off.
        (type === "line" || type === "card") &&
          "focus-visible:-outline-offset-1 focus-visible:ring-inset",
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
