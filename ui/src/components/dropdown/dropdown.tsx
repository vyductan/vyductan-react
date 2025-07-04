"use client";

// import type { Placement } from "@popperjs/core";
import type { DropdownMenuTriggerProps } from "@radix-ui/react-dropdown-menu";
import type { ReactElement, ReactNode } from "react";
import React, { cloneElement, Fragment } from "react";

import { cn } from "@acme/ui/lib/utils";

import type { Placement } from "../../types";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../../shadcn/dropdown";
import { Link } from "../link";
import { GenericSlot } from "../slot";

type MenuItem = {
  key?: string;
  label?: ReactNode;
  className?: string;
  icon?: ReactElement<any>;
  shortcut?: ReactNode;
  group?: MenuItem[];
  as?: "title" | "separator";
  href?: string;
  onSelect?: (event: Event) => void;

  asChild?: React.ReactNode;
};
type Menu = {
  className?: string;
  items: MenuItem[];
  itemsClassName?: string;
};
export type DropdownProps = DropdownMenuTriggerProps & {
  onOpenChange?: (open: boolean, info: { source: "trigger" | "menu" }) => void;
  open?: boolean;

  className?: string;
  children: ReactNode;
  menu: Menu;
  placement?: Placement;
};

export const Dropdown = ({
  className,
  children,
  menu,
  placement = "bottomLeft",
  ...rest
}: DropdownProps) => {
  const side = placement.includes("top")
    ? "top"
    : placement.includes("right")
      ? "right"
      : placement.includes("bottom")
        ? "bottom"
        : "left";
  const align = placement.includes("Top")
    ? "start"
    : !placement.includes("Left") && !placement.includes("Right")
      ? "center"
      : placement.includes("Left")
        ? "start"
        : "end";
  const renderMenu = (items: MenuItem[]): ReactNode => {
    return items.map(
      (
        {
          as,
          group,
          href,
          key,
          label,
          className,
          icon,
          shortcut,
          onSelect,
          asChild,
        },
        index,
      ) => (
        <Fragment key={key ?? index}>
          {as === "title" ? (
            <DropdownMenuLabel>{label}</DropdownMenuLabel>
          ) : as === "separator" ? (
            <DropdownMenuSeparator />
          ) : group ? (
            renderMenu(group)
          ) : (
            <DropdownMenuItem
              onSelect={onSelect}
              asChild={!!href || !!asChild}
              className={cn(menu.itemsClassName, className)}
            >
              {asChild ??
                (href ? (
                  <Link href={href}>
                    {icon &&
                      cloneElement(icon, {
                        className: "mr-2 h-4 w-4",
                      })}
                    <span>{label}</span>
                    {shortcut && (
                      <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>
                    )}
                  </Link>
                ) : (
                  <>
                    {icon && (
                      <GenericSlot className="text-muted-foreground">
                        <div>{icon}</div>
                      </GenericSlot>
                    )}
                    <span>{label}</span>
                    {shortcut && (
                      <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>
                    )}
                  </>
                ))}
            </DropdownMenuItem>
          )}
        </Fragment>
      ),
    );
  };
  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger className={className} {...rest}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={menu.className}
        side={side}
        align={align}
        forceMount
      >
        {renderMenu(menu.items)}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
};
