import type React from "react";
import { Children, isValidElement } from "react";

import type { TabsProps as TabsProperties } from "./tabs";
import { TabsContent, TabsList, TabsRoot } from "./_components";
import { Tabs as OwnTabs } from "./tabs";

export * from "./_components";
export * from "./context";

type ShadcnTabsProperties<TKey extends string = string> = React.ComponentProps<
  typeof TabsRoot<TKey>
>;

type ConditionalTabsProps<TKey extends string = string> =
  | TabsProperties<TKey>
  | ShadcnTabsProperties<TKey>;

function Tabs<TKey extends string = string>(
  props: TabsProperties<TKey>,
): React.JSX.Element;
function Tabs<TKey extends string = string>(
  props: ShadcnTabsProperties<TKey>,
): React.JSX.Element;
function Tabs<TKey extends string = string>(
  props: ConditionalTabsProps<TKey>,
): React.JSX.Element {
  const { children, ...properties } = props;
  const isShadcnTabs =
    Children.toArray(children).some(
      (child) =>
        isValidElement(child) &&
        (child.type === TabsList || child.type === TabsContent),
    ) || !("items" in properties);

  if (isShadcnTabs) {
    return <TabsRoot<TKey> {...(properties as ShadcnTabsProperties<TKey>)}>{children}</TabsRoot>;
  }

  return <OwnTabs<TKey> {...(properties as TabsProperties<TKey>)} />;
}

export { Tabs };
