import type * as React from "react";

import { cn } from "@acme/ui/lib/utils";

import type {
  TabsListProps,
  TabsRootProps,
  TabsTriggerProps,
} from "./_components";
import type { TabsType } from "./types";
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "./_components";

type TabBarExtraMap = { left?: React.ReactNode; right?: React.ReactNode };
type TabItemDef<TKey extends string = string> = {
  key: TKey;
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  triggerProps?: Omit<TabsTriggerProps, "value">;
};

type TabsProps<TKey extends string = string> = {
  defaultValue?: never;
  onValueChange?: never;
  children?: never;
} & Omit<
  TabsRootProps<TKey>,
  "value" | "defaultValue" | "onValueChange" | "children" | "onChange"
> & {
    type?: TabsType;
    style?: React.CSSProperties;
    className?: string;
    classNames?: {
      root?: string;
      list?: string;
      trigger?: string;
    };
    /**
     * Initial active TabPane's key, if activeKey is not set
     */
    defaultActiveKey?: TabsRootProps<TKey>["defaultValue"];
    activeKey?: TabsRootProps<TKey>["value"];
    items: TabItemDef<TKey>[];
    onChange?: (activeKey: TKey) => void;

    /**
     * Extras content (left|right)
     */
    tabBarExtraContent?: React.ReactNode | TabBarExtraMap;
    tabBarStyle?: React.CSSProperties;

    // styles
    // list
    listProps?: TabsListProps;
  };

const Tabs = <TKey extends string = string>(props: TabsProps<TKey>) => {
  const {
    type = "line",
    className,
    classNames,

    defaultActiveKey,
    activeKey,
    items,
    onChange,
    tabBarExtraContent,
    tabBarStyle,
    listProps,
    ...restProps
  } = props;

  // Parse extra
  let assertExtra: TabBarExtraMap = {};

  if (tabBarExtraContent) {
    if (
      typeof tabBarExtraContent === "object" &&
      ("left" in tabBarExtraContent || "right" in tabBarExtraContent)
    ) {
      assertExtra = tabBarExtraContent;
    } else {
      assertExtra.right = tabBarExtraContent as React.ReactNode;
    }
  }

  return (
    <>
      <TabsRoot
        defaultValue={defaultActiveKey}
        value={activeKey}
        onValueChange={onChange}
        className={cn("w-full", className)}
        type={type}
        {...restProps}
      >
        {items.length > 0 && (
          <TabsList
            className={classNames?.list}
            style={tabBarStyle}
            {...listProps}
          >
            {assertExtra.left && <div className="mr-4">{assertExtra.left}</div>}
            {items.map((x) => (
              <TabsTrigger
                key={x.key}
                value={x.key}
                className={classNames?.trigger}
                {...x.triggerProps}
              >
                {x.label}
              </TabsTrigger>
            ))}
            {assertExtra.right && (
              <div className="ml-auto">{assertExtra.right}</div>
            )}
          </TabsList>
        )}

        {items.map((x) =>
          x.children === null ? undefined : (
            <TabsContent key={x.key} value={x.key} className={x.className}>
              {x.children}
            </TabsContent>
          ),
        )}
      </TabsRoot>
    </>
  );
};

export { Tabs };
export type { TabsProps as TabsProps, TabItemDef };
