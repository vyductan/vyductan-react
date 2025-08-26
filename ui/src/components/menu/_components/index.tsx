import type { KeyboardEvent, MouseEvent } from "react";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@acme/ui/lib/utils";

import type { MenuItemType } from "../types";
import { Icon } from "../../../icons";

export * from "./submenu";

type MenuItemProps = Omit<MenuItemType, "key"> & {
  keyProp: React.Key;
  isActive?: boolean;
  onSelect?: (args: {
    item: MenuItemType;
    key: React.Key;
    event: MouseEvent<HTMLLIElement> | KeyboardEvent<HTMLLIElement>;
  }) => void;
};
export const MenuItem = ({
  keyProp,
  label,
  icon,
  onSelect,
  isActive,
}: MenuItemProps) => {
  const labelToRender = (
    <div>
      {typeof icon === "string" ? <Icon icon={icon} /> : icon}
      {typeof label === "string" ? <span>{label}</span> : label}
    </div>
  );
  return (
    <li
      role="menuitem"
      onClick={(event) => {
        onSelect?.({ item: { key: keyProp, label }, key: keyProp, event });
      }}
      onKeyUp={(event) => {
        onSelect?.({ item: { key: keyProp, label }, key: keyProp, event });
      }}
      className={cn(
        "my-1",
        "transition-all",
        "border-l-2 border-transparent",
        "text-muted-foreground hover:text-foreground",
        isActive
          ? "border-primary bg-primary-100 text-primary-600 hover:text-primary-700"
          : "hover:border-foreground-muted",
      )}
    >
      <Slot
        className={cn(
          "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2",
        )}
      >
        {/* {href ? ( */}
        {/*   <Link href={href}> */}
        {/*     {typeof icon === "string" ? <Icon icon={icon} /> : icon} */}
        {/*     {labelToRender} */}
        {/*   </Link> */}
        {/* ) : ( */}
        {/*   labelToRender */}
        {/* )} */}
        {labelToRender}
      </Slot>
    </li>
  );
};
