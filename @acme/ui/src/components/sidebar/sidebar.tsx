"use client";

import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { Fragment, isValidElement } from "react";
import { useMergedState } from "@rc-component/util";

import type { MenuItemType, MenuProps as MenuProperties } from "../menu";
import { Divider } from "../divider";
import {
  ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./_component";

type SidebarProperties = {
  className?: string;
  classNames?: {
    header?: string;
    footer?: string;
    menuButton?: string;
    icon?: string;
  };

  itemRender?: (
    item: MenuItemType,
    classNames: SidebarProperties["classNames"],
    originalNode: ReactNode,
  ) => ReactNode;
  contentRender?: (properties: {
    itemNodes: React.ReactNode;
  }) => React.ReactNode;

  header?: ReactNode;
  footer?: ReactNode;
  items?: MenuProperties["items"];
  defaultSelectedKeys?: string[];
  selectedKeys?: string[];
  onSelect?: (arguments_: {
    item: MenuItemType;
    key: React.Key;
    event: MouseEvent<HTMLLIElement> | KeyboardEvent<HTMLLIElement>;
  }) => void;
};

const Sidebar = (properties: SidebarProperties) => {
  const [selectKeys] = useMergedState(properties.defaultSelectedKeys ?? [], {
    value: properties.selectedKeys,
  });

  const {
    className,
    classNames,

    itemRender,
    contentRender,

    header,
    footer,
    items = [],
    defaultSelectedKeys: _defaultSelectedKeys,
    selectedKeys: _selectedKeys,
    onSelect,
  } = properties;

  const renderItems = (items: MenuProperties["items"]) => {
    return items.map((item, index) => {
      if (!item) return <></>;
      if (item.type === "divider") {
        return (
          <Divider key={index} role="separator" className="border-t" asChild>
            <li />
          </Divider>
        );
      }

      if (item.type === "group") {
        return (
          <SidebarGroup key={index}>
            {item.label && <SidebarGroupLabel>{item.label}</SidebarGroupLabel>}
            <SidebarMenu>{renderItems(item.children ?? [])}</SidebarMenu>
          </SidebarGroup>
        );
      }
      if (
        item.type === "submenu" ||
        (item.type === undefined && "children" in item)
      ) {
        return <></>;
      }

      if (item.type === "item" || !("children" in item)) {
        const { key, label, title, icon } = item;
        const mergedLabel = label ?? title;
        const isActive = selectKeys.some((x) => key.toString().startsWith(x));

        const defaultNode = (
          <>
            {icon}
            <span>{mergedLabel}</span>
          </>
        );
        const content = itemRender
          ? itemRender(item, classNames, defaultNode)
          : defaultNode;

        // Radix Slot needs exactly one host element — Fragment/string crashes/warns.
        // isValidElement(<></>) === true, so Fragment must be excluded.
        const asChild = isValidElement(content) && content.type !== Fragment;

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
              asChild={asChild}
              isActive={isActive}
              tooltip={
                typeof mergedLabel === "string" ? mergedLabel : key.toString()
              }
              className={classNames?.menuButton}
            >
              {content}
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      }
    });
  };

  return (
    <ShadcnSidebar collapsible="icon" className={className}>
      <SidebarHeader className={classNames?.header}>{header}</SidebarHeader>
      <SidebarContent>
        {contentRender ? (
          contentRender({ itemNodes: renderItems(items) })
        ) : items.some((item) => item && item.type === "group") ? (
          renderItems(items)
        ) : (
          <SidebarMenu>{renderItems(items)}</SidebarMenu>
        )}
      </SidebarContent>
      <SidebarFooter className={classNames?.footer}>{footer}</SidebarFooter>
    </ShadcnSidebar>
  );
};

export type { SidebarProperties as SidebarProps };
export { Sidebar };
