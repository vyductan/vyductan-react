"use client";

import * as React from "react";

import type {
  TabsListProps,
  TabsRootProps,
  TabsRootRef,
  TabsTriggerProps,
} from "./_components";
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "./_components";

type TabBarExtraMap = { left?: React.ReactNode; right?: React.ReactNode };
type TabsProps = Omit<
  TabsRootProps,
  "defaultValue" | "onValueChange" | "onChange"
> & {
  /**
   * Initial active TabPane's key, if activeKey is not set
   */
  defaultActiveKey?: TabsRootProps["defaultValue"];
  items: {
    key: string;
    label: React.ReactNode;
    children: React.ReactNode;
  }[];
  onChange?: (activeKey: string) => void;

  /**
   * Extras content (left|right)
   */
  tabBarExtraContent?: React.ReactNode | TabBarExtraMap;

  // styles
  // list
  listProps?: TabsListProps;
  triggerProps?: Omit<TabsTriggerProps, "value">;
};
const Tabs = React.forwardRef<TabsRootRef, TabsProps>(
  (
    {
      defaultActiveKey,
      items,
      onChange,
      tabBarExtraContent,
      listProps,
      triggerProps,
      ...props
    },
    ref,
  ) => {
    // Parse extra
    let assertExtra: TabBarExtraMap = {};
    if (
      typeof tabBarExtraContent === "object" &&
      !React.isValidElement(tabBarExtraContent)
    ) {
      assertExtra = tabBarExtraContent as TabBarExtraMap;
    } else {
      assertExtra.right = tabBarExtraContent;
    }

    return (
      <>
        <TabsRoot
          ref={ref}
          defaultValue={defaultActiveKey}
          onValueChange={onChange}
          {...props}
        >
          <div className="flex items-center">
            {assertExtra.left && <div className="mr-4">{assertExtra.left}</div>}

            <TabsList {...listProps}>
              {items.map((x) => (
                <TabsTrigger key={x.key} value={x.key} {...triggerProps}>
                  {x.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="ml-auto">{assertExtra.right}</div>
          </div>

          {items.map((x) => (
            <TabsContent key={x.key} value={x.key}>
              {x.children}
            </TabsContent>
          ))}
        </TabsRoot>
      </>
    );
  },
);

Tabs.displayName = "Tabs";

export { Tabs };
export type { TabsProps };
