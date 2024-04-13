import type { KeyboardEvent, MouseEvent } from "react";
import { Slot } from "@radix-ui/react-slot";
import { useMergedState } from "rc-util";

import type { MenuItemDef } from "./types";
import { clsm } from "..";
import { Collapse } from "../collapse";

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
  defaultOpenKeys,
  defaultSelectedKeys,
  items,
  openKeys,
  mode = "inline",
  selectedKeys,
  onSelect,
}: MenuProps) => {
  const [mergedOpenKeys, _setMergedOpenKeys] = useMergedState(
    defaultOpenKeys ?? [],
    {
      value: openKeys,
    },
  );
  const [mergedSelectKeys, _setMergedSelectKeys] = useMergedState(
    defaultSelectedKeys ?? [],
    {
      value: selectedKeys,
    },
  );

  const renderItem = (menu: MenuItemDef[]) => {
    return menu.map((item, index) => {
      const key = item.key ?? String(index);
      if (!item.children) {
        const active = mergedSelectKeys.some((x) => x.endsWith(key));
        return (
          <li
            role="menuitem"
            key={key}
            onClick={(event) => {
              onSelect?.({ item, key, event });
            }}
            onKeyUp={(event) => {
              onSelect?.({ item, key, event });
            }}
            className={clsm(
              "text-secondary",
              "border-l border-transparent",
              "hover:text-primary",
              active
                ? "border-primary bg-primary-100 text-primary-500"
                : "hover:border-foreground hover:text-foreground",
            )}
          >
            <Slot
              className={clsm("block cursor-pointer rounded-md px-4 py-2.5")}
            >
              {typeof item.label === "string" ? (
                <span>{item.label}</span>
              ) : (
                item.label
              )}
            </Slot>
          </li>
        );
      }

      return (
        <Collapse
          key={key}
          type="single"
          defaultActiveKey={mergedOpenKeys}
          items={[
            {
              key: key,
              label: item.label,
              children: renderItem(item.children),
            },
          ]}
          contentProps={{
            as: "ul",
            className: clsm("border-l border-border"),
          }}
          triggerProps={{
            className: clsm(
              "text-secondary",
              "hover:text-foreground",
              mergedSelectKeys.some((x) => x.includes(key)) &&
                "text-foreground",
            ),
          }}
        />
      );
    });
  };

  const Comp = "aside";

  return (
    <Comp className={className}>
      <ul
        className={clsm(
          mode === "inline" &&
            "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        )}
      >
        {renderItem(items)}
      </ul>
    </Comp>
  );
};
