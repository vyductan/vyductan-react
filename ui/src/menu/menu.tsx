"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { useMergedState } from "rc-util";

import type { MenuItemDef } from "./types";
import { cn } from "..";
// import { Collapse } from "../collapse";
import { Divider } from "../divider";
import { MenuItem } from "./_components";

type MenuProps = {
  className?: string;
  defaultOpenKeys?: string[];
  defaultSelectedKeys?: string[];
  items: MenuItemDef[];
  mode?: "vertical" | "horizontal" | "inline";
  openKeys?: string[];
  selectedKeys?: string[];
  onSelect?: (args: {
    item: MenuItemDef;
    key: React.Key;
    event: MouseEvent<HTMLLIElement> | KeyboardEvent<HTMLLIElement>;
  }) => void;
};
export const Menu = ({
  className,
  // defaultOpenKeys,
  defaultSelectedKeys,
  items,
  // openKeys,
  mode = "inline",
  selectedKeys,
  onSelect,
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

  const renderItem = (menu: MenuItemDef[]) => {
    return menu.map((item, index) => {
      if (item.type === "divider") {
        return (
          <Divider key={index} as="li" role="separator" className="border-t" />
        );
      }

      if (item.type === "group") {
        return (
          <li key={index} role="presentation" className="my-1 text-left">
            <div
              role="presentation"
              title={typeof item.label === "string" ? item.label : ""}
              className="py-2"
            >
              {item.label}
            </div>
            {item.children.some((c) => !c.hidden) && (
              <ul role="group">
                {item.children
                  .filter((c) => !c.hidden)
                  .map(({ key, ...x }) => {
                    // const isActive = mergedSelectKeys.some((x) =>
                    //   x.endsWith(key.toString()),
                    // );
                    const isActive = mergedSelectKeys.some((x) =>
                      key.toString().startsWith(x),
                    );
                    return (
                      <MenuItem
                        key={key}
                        keyProp={key}
                        isActive={isActive}
                        onSelect={onSelect}
                        {...x}
                      />
                    );
                  })}
              </ul>
            )}
          </li>
        );
      }

      const { key, ...rest } = item;
      return <MenuItem key={key} keyProp={key} onSelect={onSelect} {...rest} />;

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

  return (
    <ul
      className={cn(
        mode === "inline" && "space-x-2 space-y-1 overflow-y-auto",
        className,
      )}
    >
      {renderItem(items)}
    </ul>
  );
};
