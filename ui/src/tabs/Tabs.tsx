"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { clsm } from "@acme/ui";

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={clsm(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={clsm(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
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
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

type TabsProps = Omit<
  React.ComponentProps<typeof TabsPrimitive.Root>,
  "defaultValue" | "onValueChange"
> & {
  /**
   * Initial active TabPane's key, if activeKey is not set
   */
  defaultActiveKey?: string;
  items: {
    key: string;
    label: React.ReactNode;
    children: React.ReactNode;
  }[];
  onActiveKeyChange?: (activeKey: string) => void;
};
const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(({ defaultActiveKey, items, onActiveKeyChange, ...props }, ref) => {
  return (
    <>
      <TabsPrimitive.Root
        ref={ref}
        defaultValue={defaultActiveKey}
        onValueChange={onActiveKeyChange}
        {...props}
      >
        <TabsList>
          {items.map((x) => (
            <TabsTrigger key={x.key} value={x.key}>
              {x.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {items.map((x) => (
          <TabsContent key={x.key} value={x.key}>
            {x.children}
          </TabsContent>
        ))}
      </TabsPrimitive.Root>
    </>
  );
});

Tabs.displayName = "Tabs";

export { Tabs };
export type { TabsProps };
