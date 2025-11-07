"use client";

// import type { Placement } from "@popperjs/core";
import type { DropdownMenuTriggerProps } from "@radix-ui/react-dropdown-menu";
import type { ReactNode } from "react";
import type React from "react";
import { cloneElement, Fragment, isValidElement } from "react";
import { useMergedState } from "@rc-component/util";
import { useDebounce } from "ahooks";

import { cn } from "@acme/ui/lib/utils";

import type { Placement } from "../../types";
import type { ItemType, MenuProps } from "../menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./_components";

export type DropdownProps = DropdownMenuTriggerProps & {
  onOpenChange?: (open: boolean, info: { source: "trigger" | "menu" }) => void;
  open?: boolean;

  className?: string;
  children: ReactNode;
  menu: MenuProps;
  placement?: Placement;
  trigger?: ("click" | "hover" | "contextMenu")[];
  disabled?: boolean;
};

export const Dropdown = ({
  className,
  children,
  menu,
  placement = "bottomLeft",
  asChild,
  trigger = ["click"],
  disabled = false,
  open: openProp,
  onOpenChange,
  ...rest
}: DropdownProps) => {
  // Normalize trigger to array
  const triggers = Array.isArray(trigger) ? trigger : [trigger];
  const hasHover = triggers.includes("hover");
  const hasClick = triggers.includes("click");
  const hasContextMenu = triggers.includes("contextMenu");

  const [open, setOpen] = useMergedState(false, {
    value: openProp,
    onChange: (value) => {
      onOpenChange?.(value, { source: "trigger" });
    },
  });

  const debouncedOpen = useDebounce(open, {
    wait: hasHover ? 100 : 0,
  });

  // Auto-detect if children is a button element or Button component
  const shouldUseAsChild =
    asChild ??
    (isValidElement(children) &&
      (typeof children.type === "string"
        ? children.type === "button"
        : (() => {
            const type = children.type as {
              displayName?: string;
              name?: string;
            };
            return type.displayName === "Button" || type.name === "Button";
          })()));

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

  const renderMenu = (items: ItemType[]): ReactNode => {
    return items.map((item, index) => {
      if (!item) return null;

      // Handle divider type
      if (item.type === "divider") {
        return <DropdownMenuSeparator key={`divider-${index}`} />;
      }

      // Handle group type
      if (item.type === "group") {
        return (
          <Fragment key={item.key ?? `group-${index}`}>
            {item.label && <DropdownMenuLabel>{item.label}</DropdownMenuLabel>}
            {item.children && renderMenu(item.children)}
          </Fragment>
        );
      }

      // Handle submenu type
      if (
        item.type === "submenu" ||
        (item.type === undefined && "children" in item)
      ) {
        return (
          <DropdownMenuSub key={item.key}>
            <DropdownMenuSubTrigger disabled={item.disabled}>
              {item.icon}
              <span>{item.label}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {renderMenu(item.children)}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        );
      }

      // Handle regular menu item (type === "item" or no type, and no children)
      if (item.type === "item" || !("children" in item)) {
        const {
          key,
          label,
          icon,
          disabled: itemDisabled,
          danger,
          extra,
          onClick,
          className: itemClassName,
        } = item;

        return (
          <DropdownMenuItem
            key={key || `item-${index}`}
            disabled={itemDisabled}
            variant={danger ? "destructive" : "default"}
            className={cn(menu.classNames?.item, itemClassName)}
            onSelect={(e) => {
              if (onClick) {
                onClick({
                  key: String(key),
                  keyPath: [String(key)],
                  domEvent: e as unknown as React.MouseEvent<HTMLElement>,
                });
              }
            }}
          >
            {icon &&
              isValidElement(icon) &&
              cloneElement(icon as React.ReactElement<{ className?: string }>, {
                className: "h-4 w-4",
              })}
            <span>{label}</span>
            {extra && <DropdownMenuShortcut>{extra}</DropdownMenuShortcut>}
          </DropdownMenuItem>
        );
      }
    });
  };
  const handleOpenChange = (newOpen: boolean) => {
    if (disabled) return;
    setOpen(newOpen);
  };

  // Build trigger props based on multiple triggers
  const triggerProps: {
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onContextMenu?: (e: React.MouseEvent) => void;
  } = {};

  if (hasHover) {
    triggerProps.onMouseEnter = () => {
      if (!disabled && !open) setOpen(true);
    };
    triggerProps.onMouseLeave = () => {
      if (open) setOpen(false);
    };
  }

  if (hasContextMenu) {
    triggerProps.onContextMenu = (e: React.MouseEvent) => {
      if (!disabled) {
        e.preventDefault();
        setOpen(true);
      }
    };
  }

  // Build content props for hover
  const contentProps: {
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  } = {};
  if (hasHover) {
    contentProps.onMouseEnter = () => {
      if (!disabled && !open) setOpen(true);
    };
    contentProps.onMouseLeave = () => {
      if (open) setOpen(false);
    };
  }

  return (
    <DropdownMenu
      open={hasHover ? debouncedOpen : open}
      onOpenChange={handleOpenChange}
      modal={hasClick}
    >
      <DropdownMenuTrigger
        className={cn(disabled && "pointer-events-none opacity-50", className)}
        asChild={shouldUseAsChild}
        disabled={disabled}
        {...triggerProps}
        {...rest}
      >
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={menu.className}
        side={side}
        align={align}
        forceMount
        {...contentProps}
      >
        {renderMenu(menu.items)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
