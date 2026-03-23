import type React from "react";
import type { XOR } from "ts-xor";
import { Children, isValidElement } from "react";

import type { TabsProps } from "./tabs";
import { TabsContent, TabsList, TabsRoot } from "./_components";
import { Tabs as OwnTabs } from "./tabs";

export * from "./_components";
export * from "./context";

type ShadcnTabsProps = React.ComponentProps<typeof TabsRoot>;
type ConditionTabsProps = XOR<TabsProps, ShadcnTabsProps>;
const Tabs = ({ children, ...props }: ConditionTabsProps) => {
  const isShadcnTabs =
    Children.toArray(children).some(
      (child) =>
        isValidElement(child) &&
        (child.type === TabsList || child.type === TabsContent),
    ) || !props.items;
  if (isShadcnTabs) {
    return <TabsRoot {...(props as ShadcnTabsProps)}>{children}</TabsRoot>;
  }

  return <OwnTabs {...(props as TabsProps)} />;
};

export { Tabs };
