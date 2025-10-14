import { XOR } from "ts-xor";

import { ShadcnSidebarProps, SidebarRoot } from "./_component";
import { Sidebar as OwnSidebar, SidebarProps } from "./sidebar";

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
