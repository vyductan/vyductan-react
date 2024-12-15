import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { useMergedState } from "rc-util";

import type { MenuItemDef } from "../menu";
import { Divider } from "../divider";
import { Icon } from "../icons";
import { Link } from "../link";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRoot,
} from "./_components";

type SidebarProps = {
  className?: string;
  classNames?: {
    menuButton?: string;
    icon?: string;
  };
  header?: ReactNode;
  items?: MenuItemDef[];
  defaultSelectedKeys?: string[];
  selectedKeys?: string[];
  onSelect?: (args: {
    item: MenuItemDef;
    key: React.Key;
    event: MouseEvent<HTMLLIElement> | KeyboardEvent<HTMLLIElement>;
  }) => void;
};
export const Sidebar = ({
  className,
  classNames,
  header,
  items = [],
  defaultSelectedKeys: defaultSelectedKeysProp,
  selectedKeys: selectedKeysProp,
  onSelect,
}: SidebarProps) => {
  const [selectKeys] = useMergedState(defaultSelectedKeysProp ?? [], {
    value: selectedKeysProp,
  });

  const renderItems = (items: MenuItemDef[]) => {
    return items.map((item, index) => {
      if (item.type === "divider") {
        return (
          <Divider key={index} as="li" role="separator" className="border-t" />
        );
      }

      if (item.type === "group") {
        return (
          <SidebarGroup
            key={index}
            // className="group-data-[collapsible=icon]:hidden"
          >
            {item.label && <SidebarGroupLabel>{item.label}</SidebarGroupLabel>}
            <SidebarMenu>{renderItems(item.children)}</SidebarMenu>
            {/* {item.children.some((c) => !c.hiddenInNav) && ( */}
            {/*   <SidebarMenu> */}
            {/*     {item.children */}
            {/*       .filter((c) => !c.hiddenInNav) */}
            {/*       .map(({ key, children, label, icon, path }) => { */}
            {/*         // const isActive = mergedSelectKeys.some((x) => */}
            {/*         //   x.endsWith(key.toString()), */}
            {/*         // ); */}
            {/*         const isActive = selectKeys.some((x) => */}
            {/*           key.toString().startsWith(x), */}
            {/*         ); */}
            {/*         if (children) { */}
            {/*           console.log("cccccc", item); */}
            {/*           return renderItems(children); */}
            {/*         } */}
            {/*         // const labelToRender = */}
            {/*         //   typeof label === "object" ? ( */}
            {/*         //     label */}
            {/*         //   ) : ( */}
            {/*         //     <div> */}
            {/*         //       {typeof icon === "string" ? ( */}
            {/*         //         <Icon icon={icon} /> */}
            {/*         //       ) : ( */}
            {/*         //         icon */}
            {/*         //       )} */}
            {/*         //       {typeof label === "string" ? ( */}
            {/*         //         <span>{label}</span> */}
            {/*         //       ) : ( */}
            {/*         //         label */}
            {/*         //       )} */}
            {/*         //     </div> */}
            {/*         //   ); */}
            {/*         const labelToRender = path ? ( */}
            {/*           <Link href={`${path}`}> */}
            {/*             {typeof icon === "string" ? <Icon icon={icon} /> : icon} */}
            {/*             <span>{label}</span> */}
            {/*           </Link> */}
            {/*         ) : ( */}
            {/*           label */}
            {/*         ); */}
            {/*         return ( */}
            {/*           <SidebarMenuItem */}
            {/*             key={key} */}
            {/*             onClick={(event) => { */}
            {/*               onSelect?.({ item: { key, label }, key, event }); */}
            {/*             }} */}
            {/*             onKeyUp={(event) => { */}
            {/*               onSelect?.({ item: { key, label }, key, event }); */}
            {/*             }} */}
            {/*           > */}
            {/*             <SidebarMenuButton */}
            {/*               asChild */}
            {/*               isActive={isActive} */}
            {/*               tooltip={label} */}
            {/*             > */}
            {/*               {labelToRender} */}
            {/*             </SidebarMenuButton> */}
            {/*           </SidebarMenuItem> */}
            {/*         ); */}
            {/*       })} */}
            {/*   </SidebarMenu> */}
            {/* )} */}
          </SidebarGroup>
        );
      }

      /* Item type Render */
      if (item.hidden) {
        return;
      }
      const { key, children: _, label, icon, path } = item;
      const isActive = selectKeys.some((x) => key.toString().startsWith(x));
      const labelToRender = path ? (
        <Link href={`${path}`}>
          {typeof icon === "string" ? (
            <Icon icon={icon} className={classNames?.icon} />
          ) : (
            icon
          )}
          <span>{label}</span>
        </Link>
      ) : (
        label
      );
      return (
        <SidebarMenuItem
          key={key}
          onClick={(event) => {
            onSelect?.({ item: { key, label }, key, event });
          }}
          onKeyUp={(event) => {
            onSelect?.({ item: { key, label }, key, event });
          }}
        >
          <SidebarMenuButton
            asChild
            isActive={isActive}
            tooltip={item.label}
            className={classNames?.menuButton}
          >
            {labelToRender}
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });
  };

  return (
    <SidebarRoot collapsible="icon" className={className}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>{header}</SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>{renderItems(items)}</SidebarContent>
    </SidebarRoot>
  );
};
