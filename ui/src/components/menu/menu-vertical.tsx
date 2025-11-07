"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import React from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { useMergedState } from "@rc-component/util";

import { cn } from "@acme/ui/lib/utils";

import type { ItemType, MenuItemType, SelectEventHandler } from "./types";
import { Icon } from "../../icons";
import { Divider } from "../divider";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../sidebar/_component";

type MenuVerticalProps = {
  className?: string;
  classNames?: {
    item?: string;
    subMenu?: string;
    divider?: string;
    group?: string;
    itemActive?: string;
    itemDisabled?: string;
    itemIcon?: string;
  };
  defaultOpenKeys?: string[];
  defaultSelectedKeys?: string[];
  items: ItemType[];
  openKeys?: string[];

  selectable?: boolean;
  multiple?: boolean;

  selectedKeys?: string[];
  onSelect?: (args: {
    item: ItemType;
    key: React.Key;
    selectedKeys: string[];
    event: MouseEvent<HTMLLIElement> | KeyboardEvent<HTMLLIElement>;
  }) => void;
  onDeselect?: SelectEventHandler;

  onOpenChange?: (openKeys: string[]) => void;
};

const MenuVertical = ({
  className,
  defaultOpenKeys,
  defaultSelectedKeys,
  items,
  openKeys,
  selectedKeys,
  onSelect,
  onOpenChange,
}: MenuVerticalProps) => {
  const [mergedOpenKeys, setMergedOpenKeys] = useMergedState(
    defaultOpenKeys ?? [],
    {
      value: openKeys,
      onChange: onOpenChange,
    },
  );

  const [mergedSelectKeys, _setMergedSelectKeys] = useMergedState(
    defaultSelectedKeys ?? [],
    {
      value: selectedKeys,
    },
  );

  const handleOpenChange = (key: string, isOpen: boolean) => {
    const newOpenKeys = isOpen
      ? [...mergedOpenKeys, key]
      : mergedOpenKeys.filter((k) => k !== key);
    setMergedOpenKeys(newOpenKeys);
  };

  const renderItem = (
    menu: ItemType[],
    isSubMenu = false,
  ): React.ReactNode[] => {
    return menu.map((item, index) => {
      if (!item) return null;

      // Handle divider type
      if (item.type === "divider") {
        return (
          <Divider
            key={`divider-${index}`}
            role="separator"
            className="border-t"
            asChild
          >
            <li />
          </Divider>
        );
      }

      // Handle group type
      if (item.type === "group") {
        return (
          <SidebarGroup key={`group-${item.key ?? index}`}>
            {item.label && <SidebarGroupLabel>{item.label}</SidebarGroupLabel>}
            <SidebarMenu>
              {item.children &&
                renderItem(item.children as MenuItemType[], false).map(
                  (child, childIndex) => (
                    <React.Fragment key={childIndex}>{child}</React.Fragment>
                  ),
                )}
            </SidebarMenu>
          </SidebarGroup>
        );
      }

      // Handle submenu
      if (item.type === "submenu") {
        const subMenuProps = item;
        const isOpen = mergedOpenKeys.includes(subMenuProps.key.toString());
        const hasActiveChild = mergedSelectKeys.some((k) =>
          k.toString().startsWith(subMenuProps.key.toString()),
        );

        return (
          <SidebarMenuItem key={subMenuProps.key}>
            <Collapsible.Root
              open={isOpen}
              onOpenChange={(open) =>
                handleOpenChange(subMenuProps.key.toString(), open)
              }
            >
              <Collapsible.Trigger asChild>
                <SidebarMenuButton
                  isActive={hasActiveChild}
                  tooltip={
                    typeof subMenuProps.label === "string"
                      ? subMenuProps.label
                      : subMenuProps.key.toString()
                  }
                >
                  {typeof subMenuProps.icon === "string" ? (
                    <Icon icon={subMenuProps.icon} />
                  ) : (
                    subMenuProps.icon
                  )}
                  <span>
                    {typeof subMenuProps.label === "string"
                      ? subMenuProps.label
                      : subMenuProps.label}
                  </span>
                </SidebarMenuButton>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <SidebarMenuSub>
                  {renderItem(subMenuProps.children, true).map(
                    (child, childIndex) => {
                      if (!child) return null;
                      // Extract key from child if it's a React element
                      const childKey =
                        React.isValidElement(child) && child.key
                          ? child.key
                          : `submenu-child-${childIndex}`;
                      return (
                        <React.Fragment key={childKey}>{child}</React.Fragment>
                      );
                    },
                  )}
                </SidebarMenuSub>
              </Collapsible.Content>
            </Collapsible.Root>
          </SidebarMenuItem>
        );
      }

      // Handle regular menu item (default case - all other types already handled above)
      const { key, label, icon } = item as MenuItemType;
      const isActive = mergedSelectKeys.some((k) =>
        key.toString().startsWith(k.toString()),
      );

      const labelToRender = (
        <>
          {typeof icon === "string" ? <Icon icon={icon} /> : icon}
          <span>{typeof label === "string" ? label : label}</span>
        </>
      );

      // Use SidebarMenuSubItem and SidebarMenuSubButton for submenu children
      if (isSubMenu) {
        return (
          <SidebarMenuSubItem key={key}>
            <SidebarMenuSubButton
              isActive={isActive}
              onClick={(event) => {
                onSelect?.({
                  item,
                  key,
                  selectedKeys: mergedSelectKeys,
                  event: event as unknown as MouseEvent<HTMLLIElement>,
                });
              }}
              onKeyUp={(event) => {
                onSelect?.({
                  item,
                  key,
                  selectedKeys: mergedSelectKeys,
                  event: event as unknown as KeyboardEvent<HTMLLIElement>,
                });
              }}
            >
              {labelToRender}
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        );
      }

      // Use regular SidebarMenuItem and SidebarMenuButton for top-level items
      return (
        <SidebarMenuItem key={key}>
          <SidebarMenuButton
            isActive={isActive}
            tooltip={typeof label === "string" ? label : key.toString()}
            onClick={(event) => {
              onSelect?.({
                item,
                key,
                selectedKeys: mergedSelectKeys,
                event: event as unknown as MouseEvent<HTMLLIElement>,
              });
            }}
            onKeyUp={(event) => {
              onSelect?.({
                item,
                key,
                selectedKeys: mergedSelectKeys,
                event: event as unknown as KeyboardEvent<HTMLLIElement>,
              });
            }}
          >
            {labelToRender}
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });
  };

  return (
    <SidebarMenu className={cn("flex flex-col space-y-1", className)}>
      {renderItem(items)}
    </SidebarMenu>
  );
};

export type { MenuVerticalProps };
export { MenuVertical };
