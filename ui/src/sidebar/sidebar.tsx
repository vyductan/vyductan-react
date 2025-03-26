"use client";

import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { useMergedState } from "@rc-component/util";

import type { MenuItemDef, MenuItemType } from "../menu";
import { Divider } from "../divider";
import { Icon } from "../icons";
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
    header?: string;
    menuButton?: string;
    icon?: string;
  };

  itemRender?: (
    item: MenuItemType,
    classNames: SidebarProps["classNames"],
    originalNode: ReactNode,
  ) => ReactNode;
  contentRender?: (props: { itemNodes: React.ReactNode }) => React.ReactNode;

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

  itemRender,
  contentRender,

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
          <Divider key={index} role="separator" className="border-t" asChild>
            <li />
          </Divider>
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
      const { key, children: _, label, title, icon, path } = item;
      const mergedLabel = label ?? title;
      const isActive = selectKeys.some((x) => key.toString().startsWith(x));
      let labelToRender: ReactNode = path ? (
        <a href={`${path}`}>
          {typeof icon === "string" ? (
            <Icon icon={icon} className={classNames?.icon} />
          ) : (
            icon
          )}
          <span>{mergedLabel}</span>
        </a>
      ) : (
        mergedLabel
      );
      labelToRender = itemRender
        ? itemRender(item, classNames, labelToRender)
        : labelToRender;

      return (
        <SidebarMenuItem
          key={key}
          onClick={(event) => {
            onSelect?.({ item: { key, label: mergedLabel }, key, event });
          }}
          onKeyUp={(event) => {
            onSelect?.({ item: { key, label: mergedLabel }, key, event });
          }}
        >
          <SidebarMenuButton
            asChild
            isActive={isActive}
            tooltip={
              typeof mergedLabel === "string" ? mergedLabel : key.toString()
            }
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
      <SidebarHeader className={classNames?.header}>{header}</SidebarHeader>
      <SidebarContent>
        {contentRender
          ? contentRender({ itemNodes: renderItems(items) })
          : renderItems(items)}
      </SidebarContent>
    </SidebarRoot>
  );
};
