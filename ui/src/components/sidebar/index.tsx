import type { XOR } from "ts-xor";

import type { ShadcnSidebarProps } from "./_component";
import type { SidebarProps } from "./sidebar";
import { SidebarRoot } from "./_component";
import { Sidebar as OwnSidebar } from "./sidebar";

export * from "./_component";

type ConditionalSidebarProps = XOR<SidebarProps, ShadcnSidebarProps>;

const Sidebar = (props: ConditionalSidebarProps) => {
  const isShadcnSidebar = !props.items && !props.itemRender;
  if (isShadcnSidebar) {
    return <SidebarRoot {...(props as ShadcnSidebarProps)} />;
  }

  return <OwnSidebar {...props} />;
};

export { Sidebar };
