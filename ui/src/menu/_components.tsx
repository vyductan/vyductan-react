import type { KeyboardEvent, MouseEvent } from "react";
import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";

import type { MenuItemType } from "./types";
import { clsm } from "..";
import { Icon } from "../icons";

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
  href,
  onSelect,
  isActive,
}: MenuItemProps) => {
  const labelToRender =
    typeof label === "string" ? <span>{label}</span> : label;
  return (
    <li
      role="menuitem"
      onClick={(event) => {
        onSelect?.({ item: { key: keyProp, label }, key: keyProp, event });
      }}
      onKeyUp={(event) => {
        onSelect?.({ item: { key: keyProp, label }, key: keyProp, event });
      }}
      className={clsm(
        "text-secondary",
        "border-l border-transparent",
        "hover:text-primary",
        isActive
          ? "border-primary bg-primary-100 text-primary-500"
          : "hover:border-foreground hover:text-foreground",
      )}
    >
      <Slot
        className={clsm(
          "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-all hover:text-primary",
        )}
      >
        {href ? (
          <Link href={href}>
            {typeof icon === "string" ? <Icon icon={icon} /> : icon}
            {labelToRender}
          </Link>
        ) : (
          labelToRender
        )}
      </Slot>
      {/* <Slot className={clsm("block cursor-pointer rounded-md px-4 py-2.5")}> */}
      {/*   <> */}
      {/*     {typeof icon === "string" ? <Icon className={icon} /> : icon} */}
      {/*     {typeof label === "string" ? <span>{label}</span> : label} */}
      {/*   </> */}
      {/* </Slot> */}
    </li>
  );
};
