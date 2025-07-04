"use client";

import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { useMergedState } from "@rc-component/util";

import { cn } from "@acme/ui/lib/utils";

import type {
  MenuItemDef,
  MenuItemType,
  SelectEventHandler,
  SubMenuType,
} from "./types";
import { Divider } from "../divider";
import { MenuItem } from "./_components";
import { SubMenu } from "./_components/submenu";
import MenuContext from "./menu-context";

type MenuProps = {
  className?: string;
  defaultOpenKeys?: string[];
  defaultSelectedKeys?: string[];
  items: MenuItemDef[];
  mode?: "vertical" | "horizontal" | "inline";
  openKeys?: string[];

  selectable?: boolean;
  multiple?: boolean;

  selectedKeys?: string[];
  onSelect?: (args: {
    item: MenuItemDef;
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
  getPopupContainer,
  subMenuOpenDelay = 0.1,
  subMenuCloseDelay = 0.1,
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

  const renderItem = (menu: MenuItemDef[], level = 0) => {
    return menu.map((item, index) => {
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
      if (item.type === "submenu" || (item as SubMenuType).children) {
        const subMenuProps = item as SubMenuType;
        return (
          <SubMenu
            key={item.key}
            label={item.label}
            icon={item.icon}
            popupClassName={subMenuProps.popupClassName}
            popupOffset={subMenuProps.popupOffset}
            popupStyle={subMenuProps.popupStyle}
          >
            {subMenuProps.children &&
              renderItem(subMenuProps.children, level + 1)}
          </SubMenu>
        );
      }

      // Handle regular menu item
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
          {...rest}
        />
      );

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

  const contextValue = React.useMemo(
    () => ({
      getPopupContainer,
      subMenuOpenDelay,
      subMenuCloseDelay,
    }),
    [getPopupContainer, subMenuOpenDelay, subMenuCloseDelay],
  );

  return (
    <MenuContextProvider value={contextValue}>
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
    </MenuContextProvider>
  );
};

export type { MenuProps };
export { Menu };
