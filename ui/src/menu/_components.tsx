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
        "my-1",
        "transition-all",
        "border-l-2 border-transparent",
        "text-foreground-muted hover:text-foreground",
        isActive
          ? "border-primary bg-primary-100 text-primary-600 hover:text-primary-700"
          : "hover:border-foreground-muted",
      )}
    >
      <Slot
        className={clsm(
          "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2",
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
    </li>
  );
};
