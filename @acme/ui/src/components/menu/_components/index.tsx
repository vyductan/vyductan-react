import type { KeyboardEvent, MouseEvent } from "react";
import type * as React from "react";

import { cn } from "@acme/ui/lib/utils";

import type { MenuItemType } from "../types";
import { Icon } from "../../../icons";
import { GenericSlot } from "../../slot";

export * from "./submenu";

type MenuItemProperties = Omit<MenuItemType, "key"> & {
  keyProp: React.Key;
  isActive?: boolean;
  onSelect?: (arguments_: {
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
}: MenuItemProperties) => {
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
      <GenericSlot
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
      </GenericSlot>
    </li>
  );
};
