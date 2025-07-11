"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import * as React from "react";
import { useMergedState } from "@rc-component/util";

import { cn } from "@acme/ui/lib/utils";

import type { ItemType, MenuItemType, SelectEventHandler } from "./types";
import { Divider } from "../divider";
import { MenuItem, SubMenu } from "./_components";

type MenuProps = {
  className?: string;
  defaultOpenKeys?: string[];
  defaultSelectedKeys?: string[];
  items: ItemType[];
  mode?: "vertical" | "horizontal" | "inline";
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

  /** Customize popup container */
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
  /** @private Internal usage. Safe to remove. */
  subMenuOpenDelay?: number;
  /** @private Internal usage. Safe to remove. */
  subMenuCloseDelay?: number;

  onOpenChange?: (openKeys: string[]) => void;
};
const Menu = ({
  className,
  // defaultOpenKeys,
  defaultSelectedKeys,
  items,
  // openKeys,
  mode = "inline",
  selectedKeys,
  onSelect,
  // getPopupContainer,
  // subMenuOpenDelay = 0.1,
  // subMenuCloseDelay = 0.1,
}: MenuProps) => {
  // const [mergedOpenKeys, _setMergedOpenKeys] = useMergedState(
  //   defaultOpenKeys ?? [],
  //   {
  //     value: openKeys,
  //   },
  // );
  const [mergedSelectKeys, _setMergedSelectKeys] = useMergedState(
    defaultSelectedKeys ?? [],
    {
      value: selectedKeys,
    },
  );

  const renderItem = (menu: ItemType[]) => {
    return menu.map((item, index) => {
      if (!item) return <></>;
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
          <li
            key={`group-${item.key ?? index}`}
            role="presentation"
            className="my-1 text-left"
          >
            {item.label && (
              <div
                role="presentation"
                title={typeof item.label === "string" ? item.label : ""}
                className="text-muted-foreground px-4 py-2 text-xs font-medium"
              >
                {item.label}
              </div>
            )}
            {item.children && (
              <ul role="group" className="mt-1">
                {(item.children as MenuItemType[]).map((child) => {
                  // Destructure the key and other props we need
                  const { key, ...rest } = child;
                  const isActive = mergedSelectKeys.some((k) =>
                    key.toString().startsWith(k.toString()),
                  );
                  return (
                    <MenuItem
                      key={key}
                      keyProp={key}
                      isActive={isActive}
                      onSelect={(info) =>
                        onSelect?.({
                          ...info,
                          selectedKeys: mergedSelectKeys,
                        })
                      }
                      {...(rest as Omit<MenuItemType, "key">)}
                    />
                  );
                })}
              </ul>
            )}
          </li>
        );
      }

      // Handle submenu
      if (item.type === "submenu") {
        const subMenuProps = item;
        return (
          <SubMenu
            type="submenu"
            key={subMenuProps.key}
            icon={subMenuProps.icon}
            popupClassName={subMenuProps.popupClassName}
            popupOffset={subMenuProps.popupOffset}
            popupStyle={subMenuProps.popupStyle}
          >
            {renderItem(subMenuProps.children)}
          </SubMenu>
        );
      }

      // Handle regular menu item
      if (item.type === "item") {
        const { key, ...rest } = item;
        const isActive = mergedSelectKeys.some((k) =>
          key.toString().startsWith(k.toString()),
        );

        return (
          <MenuItem
            key={key}
            keyProp={key}
            isActive={isActive}
            onSelect={(info) =>
              onSelect?.({
                ...info,
                selectedKeys: mergedSelectKeys,
              })
            }
            {...(rest as Omit<MenuItemType, "key">)}
          />
        );
      }

      // Optionally handle other types (e.g., divider) or return null
      return null;

      // if (!item.children) {
      //   const isActive = mergedSelectKeys.some((x) => x.endsWith(key));
      //   return (
      //     <li
      //       role="menuitem"
      //       key={key}
      //       onClick={(event) => {
      //         onSelect?.({ item, key, event });
      //       }}
      //       onKeyUp={(event) => {
      //         onSelect?.({ item, key, event });
      //       }}
      //       className={cn(
      //         "text-secondary",
      //         "border-l border-transparent",
      //         "hover:text-primary",
      //         isActive
      //           ? "border-primary bg-primary-100 text-primary-500"
      //           : "hover:border-foreground hover:text-foreground",
      //       )}
      //     >
      //       <Slot
      //         className={cn("block cursor-pointer rounded-md px-4 py-2.5")}
      //       >
      //         {typeof item.label === "string" ? (
      //           <span>{item.label}</span>
      //         ) : (
      //           item.label
      //         )}
      //       </Slot>
      //     </li>
      //   );
      // }

      // return (
      //   <Collapse
      //     key={key}
      //     type="single"
      //     defaultActiveKey={mergedOpenKeys}
      //     items={[
      //       {
      //         key: key,
      //         label: item.label,
      //         children: renderItem(item.children),
      //       },
      //     ]}
      //     contentProps={{
      //       as: "ul",
      //       className: cn("border-l border-border"),
      //     }}
      //     triggerProps={{
      //       className: cn(
      //         "text-secondary",
      //         "hover:text-foreground",
      //         mergedSelectKeys.some((x) => x.includes(key)) &&
      //           "text-foreground",
      //       ),
      //     }}
      //   />
      // );
    });
  };

  // const contextValue = React.useMemo(
  //   () => ({
  //     getPopupContainer,
  //     subMenuOpenDelay,
  //     subMenuCloseDelay,
  //   }),
  //   [getPopupContainer, subMenuOpenDelay, subMenuCloseDelay],
  // );

  return (
    <ul
      role="menu"
      className={cn(
        "flex flex-col space-y-1 text-sm",
        mode === "inline" && "w-full overflow-y-auto",
        mode === "horizontal" && "flex-row space-y-0 space-x-2",
        className,
      )}
    >
      {renderItem(items)}
    </ul>
  );
};

export type { MenuProps };
export { Menu };
