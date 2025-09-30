import type { XOR } from "ts-xor";

import { Tabs as ShadcnTabs } from "@acme/ui/shadcn/tabs";

import type { TabsProps } from "./tabs";
import { Tabs as OwnTabs } from "./tabs";

export * from "./tabs";
export * from "./_components";

type ShadcnTabsProps = React.ComponentProps<typeof ShadcnTabs>;
type ConditionTabsProps = XOR<TabsProps, ShadcnTabsProps>;
const Tabs = (props: ConditionTabsProps) => {
  const isShadcnTabs = !!props.children && !props.items;
  if (isShadcnTabs) {
    return <ShadcnTabs {...props} />;
  }
  return <OwnTabs {...(props as TabsProps)} />;
};

export { Tabs };
