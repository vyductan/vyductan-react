import type { XOR } from "ts-xor";

import type { ShadcnSidebarProps as ShadcnSidebarProperties } from "./_component";
import type { SidebarProps as SidebarProperties } from "./sidebar";
import { SidebarRoot } from "./_component";
import { Sidebar as OwnSidebar } from "./sidebar";

export * from "./_component";

type ConditionalSidebarProperties = XOR<
  SidebarProperties,
  ShadcnSidebarProperties
>;

const Sidebar = (properties: ConditionalSidebarProperties) => {
  const isShadcnSidebar = !properties.items && !properties.itemRender;
  if (isShadcnSidebar) {
    return <SidebarRoot {...(properties as ShadcnSidebarProperties)} />;
  }

  return <OwnSidebar {...properties} />;
};

export { Sidebar };
